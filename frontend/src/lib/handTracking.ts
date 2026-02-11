import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export type Vector2D = { x: number; y: number };

export class HandTrackingManager {
    public handLandmarker: HandLandmarker | null = null;
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private running: boolean = false;
    private stream: MediaStream | null = null;
    private onDirectionUpdate: (vector: Vector2D | null) => void;
    private onStatusChange?: (status: string) => void;
    private onSpecialMove?: (moveName: string) => void;

    constructor(
        onDirectionUpdate: (vector: Vector2D | null) => void,
        onStatusChange?: (status: string) => void,
        onSpecialMove?: (moveName: string) => void
    ) {
        this.onDirectionUpdate = onDirectionUpdate;
        this.onStatusChange = onStatusChange;
        this.onSpecialMove = onSpecialMove;
    }

    private isFingerExtended(landmarks: any[], fingerName: "Index" | "Middle" | "Ring" | "Pinky" | "Thumb"): boolean {
        const tipIndices = { Thumb: 4, Index: 8, Middle: 12, Ring: 16, Pinky: 20 };
        const mcpIndices = { Thumb: 2, Index: 5, Middle: 9, Ring: 13, Pinky: 17 };

        const tip = landmarks[tipIndices[fingerName]];
        const mcp = landmarks[mcpIndices[fingerName]];

        // Simple y-check: Tip higher than MCP (smaller y)
        // For thumb, x-check might be needed depending on orientation, but y check works for "thumbs up" style
        return tip.y < mcp.y;
    }

    private detectSpecialMove(landmarks: any[]) {
        const indexMCP = landmarks[5];
        const indexTip = landmarks[8];
        const middleMCP = landmarks[9];
        const middleTip = landmarks[12];

        // 1. Check for "Kon" (Fox)
        // Index & Pinky Extended
        // Middle & Ring Folded (Curled)
        const isIndexExt = this.isFingerExtended(landmarks, "Index");
        const isPinkyExt = this.isFingerExtended(landmarks, "Pinky");
        const isMiddleExt = this.isFingerExtended(landmarks, "Middle");
        const isRingExt = this.isFingerExtended(landmarks, "Ring");

        if (isIndexExt && isPinkyExt && !isMiddleExt && !isRingExt) {
            return "Kon";
        }

        // 2. Check for "Muryo Kusho" (Unlimited Void)
        // Index and Middle extended and crossed/overlapping
        const isMiddleExtended = isMiddleExt; // Re-use
        const isIndexExtended = isIndexExt;   // Re-use

        if (!isIndexExtended || !isMiddleExtended) return null;

        // Check if relationship is inverted (crossed) or overlapping (very close)
        const overlapThresholdX = Math.abs(indexMCP.x - middleMCP.x) * 0.5; // X-axis threshold
        const baseRelation = indexMCP.x < middleMCP.x ? -1 : 1;
        const tipRelation = indexTip.x < middleTip.x ? -1 : 1;

        const isCrossed = baseRelation !== tipRelation;
        const isOverlappingX = Math.abs(indexTip.x - middleTip.x) < overlapThresholdX;

        // Euclidean Distance Check (prevent false positives where fingers are far apart vertically or deep)
        // Use MCP distance as a scale reference for "Length" unit
        const mcpDistance = Math.hypot(indexMCP.x - middleMCP.x, indexMCP.y - middleMCP.y);
        const tipDistance = Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y);

        // If crossed, tips should be relatively close (converging). 
        // Let's say max 1.2x MCP distance (usually tips are further than MCPs when splayed, closer when crossed)
        const isTipsClose = tipDistance < (mcpDistance * 1.2);

        if ((isCrossed || isOverlappingX) && isTipsClose) {
            return "Muryo Kusho";
        }

        return null;
    }

    /**
     * Check if the palm is facing the camera using MCP joints (Knuckles).
     * MCP joints are more stable than fingertips since they don't move much
     * when fingers are curled or extended.
     * 
     * Right Hand Palm facing camera: IndexMCP (5) is LEFT of PinkyMCP (17)
     * Left Hand Palm facing camera: IndexMCP (5) is RIGHT of PinkyMCP (17)
     */
    private isPalmFacingCamera(landmarks: any[], handedness: string): boolean {
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];

        if (handedness === "Right") {
            return indexMCP.x > pinkyMCP.x;
        } else {
            return indexMCP.x < pinkyMCP.x;
        }
    }

    private log(msg: string) {
        console.log(`[HandTracking] ${msg}`);
        this.onStatusChange?.(msg);
    }

    public async init(videoElement: HTMLVideoElement, canvasElement?: HTMLCanvasElement) {
        this.log("Initializing...");
        this.video = videoElement;
        this.canvas = canvasElement || null;
        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
        }

        try {
            this.log("Loading Vision Model...");
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
            );

            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            this.log("Model loaded.");

            await this.startCamera();
            this.running = true;
            this.log("Tracking started.");
            this.predictLoop();
        } catch (error) {
            console.error(error);
            this.log(`Error: ${error}`);
        }
    }

    private async startCamera() {
        if (!this.video) return;
        this.log("Starting Camera...");

        const constraints = {
            video: {
                width: 640,
                height: 480
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.stream = stream; // Store reference
        this.video.srcObject = stream;

        return new Promise<void>((resolve) => {
            if (!this.video) return resolve();

            this.video.onloadedmetadata = () => {
                this.video?.play().then(() => {
                    this.log("Video playing...");
                    resolve();
                }).catch(e => {
                    this.log(`Video play failed: ${e}`);
                    resolve(); // Try to continue anyway
                });
            };
        });
    }

    private predictLoop = async () => {
        if (!this.running) return;

        // Ensure video is ready
        if (!this.video || !this.handLandmarker || this.video.readyState < 2) {
            requestAnimationFrame(this.predictLoop);
            return;
        }

        let startTimeMs = performance.now();
        if (this.video.currentTime > 0) {
            const results = this.handLandmarker.detectForVideo(this.video, startTimeMs);

            if (this.canvas && this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (results.landmarks) {
                    const drawingUtils = new DrawingUtils(this.ctx);
                    for (const landmarks of results.landmarks) {
                        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5
                        });
                        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
                    }
                }
            }

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                const handedness = results.handedness[0][0].categoryName; // "Left" or "Right"

                // Check if Palm is facing camera (using stable MCP joints)
                const palmFacing = this.isPalmFacingCamera(landmarks, handedness);

                // Detect Special Move
                const specialMove = this.detectSpecialMove(landmarks);
                if (specialMove) {
                    this.onSpecialMove?.(specialMove);
                    this.onStatusChange?.(`SPECIAL: ${specialMove}`);
                    this.onDirectionUpdate(null); // Stop movement
                } else if (!palmFacing) {
                    // Back of hand detected - don't move but keep tracking
                    this.onDirectionUpdate(null);
                    this.onStatusChange?.("Back of Hand");
                } else {
                    // Index finger MCP (base) is index 5, TIP is index 8
                    const base = landmarks[5];
                    const tip = landmarks[8];

                    // Invert X for mirror effect (Selfie view)
                    const dx = (tip.x - base.x) * -1;
                    const dy = tip.y - base.y;

                    const length = Math.sqrt(dx * dx + dy * dy);

                    // Only register if movement is significant enough to be a direction
                    if (length > 0.05) {
                        this.onDirectionUpdate({ x: dx / length, y: dy / length });
                        this.onStatusChange?.(`Active: ${dx.toFixed(2)}, ${dy.toFixed(2)}`);
                    } else {
                        this.onDirectionUpdate(null);
                        this.onStatusChange?.("Idle - Move finger");
                    }
                }
            } else {
                this.onDirectionUpdate(null);
                this.onStatusChange?.("No Hand");
            }
        }

        requestAnimationFrame(this.predictLoop);
    };

    public stop() {
        this.running = false;
        this.log("Stopping...");

        const currentStream = this.stream;

        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        if (this.video && this.video.srcObject === currentStream) {
            this.video.srcObject = null;
        }

        this.stream = null;
        this.handLandmarker?.close();
    }
}
