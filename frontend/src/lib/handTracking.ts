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

    constructor(
        onDirectionUpdate: (vector: Vector2D | null) => void,
        onStatusChange?: (status: string) => void
    ) {
        this.onDirectionUpdate = onDirectionUpdate;
        this.onStatusChange = onStatusChange;
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
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
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
                    this.onStatusChange?.("Tracking (Idle - Move finger)");
                }
            } else {
                this.onDirectionUpdate(null);
                this.onStatusChange?.("Tracking (No Hand Detected)");
            }
        }

        requestAnimationFrame(this.predictLoop);
    };

    public stop() {
        this.running = false;
        this.log("Stopping...");

        // Only stop the stream WE created
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }

        // Only clear video.srcObject if it matches our stream
        if (this.video && this.video.srcObject === this.stream) {
            this.video.srcObject = null;
        }

        this.handLandmarker?.close();
    }
}
