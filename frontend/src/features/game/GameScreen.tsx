import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GameApp } from "@/game/core/GameApp";
import { type PlayerStats, SkillType, type SkillOption, SKILL_DEFINITIONS } from "../../game/types";
import { Button } from "@/components/ui/button";
import { ArrowUp, Coins, Heart, Zap, Clock, Skull } from "lucide-react";
import { SkillSelectionModal } from "./SkillSelectionModal";

export default function GameScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameAppRef = useRef<GameApp | null>(null);
    const navigate = useNavigate();

    const [status, setStatus] = useState<string>("Initializing...");
    const [stats, setStats] = useState<PlayerStats>({
        coins: 0,
        exp: 0,
        hp: 100,
        maxHp: 100,
        level: 1,
        nextLevelExp: 5,
        weapons: [],
        passives: [],
        time: 0,
        killCount: 0,
        specialGauge: 0,
        maxSpecialGauge: 20,
        activeSpecialType: "MURYO_KUSHO"
    });

    // Skill System State
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);

    // Tutorial State
    const [isTutorialVisible, setIsTutorialVisible] = useState(true);

    // Safety State
    const [showFingerWarning, setShowFingerWarning] = useState(false);
    const isWaitingForFingerResetRef = useRef(false);

    // Refs for accessing state in closures (GameApp callbacks)
    const isLevelUpModalOpenRef = useRef(false);
    const skillOptionsRef = useRef<SkillOption[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const selectedIndexRef = useRef<number | null>(null);

    // Sync refs
    useEffect(() => {
        isLevelUpModalOpenRef.current = isLevelUpModalOpen;
        if (isLevelUpModalOpen) {
            isWaitingForFingerResetRef.current = true;
            setShowFingerWarning(false);
        }
    }, [isLevelUpModalOpen]);

    useEffect(() => {
        skillOptionsRef.current = skillOptions;
    }, [skillOptions]);

    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastStatusRef = useRef<string>("");
    const lastUpdateTsRef = useRef<number>(0);
    const lastStatsRef = useRef<string>("");

    // Debounce/Throttle confirm action to prevent double firing
    const lastConfirmTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !canvasRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            // Reset state
            setIsLevelUpModalOpen(false);
            setSelectedIndex(null);
            setIsTutorialVisible(true);

            // Destroy previous instance if it exists
            if (gameAppRef.current) {
                gameAppRef.current.destroy();
                gameAppRef.current = null;
            }

            const gameApp = new GameApp(
                videoRef.current!,
                canvasRef.current!,
                (msg) => {
                    // Urgent per-frame side effects
                    if (msg.startsWith("Active:")) {
                        // Hide tutorial on first movement
                        setIsTutorialVisible(false);

                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                        }
                    }

                    // Throttle setStatus
                    const now = performance.now();
                    if (msg !== lastStatusRef.current || now - lastUpdateTsRef.current > 200) {
                        lastStatusRef.current = msg;
                        lastUpdateTsRef.current = now;
                        setStatus(msg);
                    }
                },
                (vector) => {
                    // Hand Move Callback

                    // 1. Check if Modal is Open
                    if (isLevelUpModalOpenRef.current && vector) {
                        const now = Date.now();

                        // Gesture Control Logic

                        // X-Axis -> Selection (Left / Center / Right)
                        let newIndex = 1; // Default Center
                        if (vector.x < -0.65) newIndex = 0;      // Left
                        else if (vector.x > 0.65) newIndex = 2;   // Right

                        // Clamp index to available options
                        const maxIndex = Math.max(0, skillOptionsRef.current.length - 1);
                        newIndex = Math.min(newIndex, maxIndex);

                        // Update Selection State if changed
                        if (selectedIndexRef.current !== newIndex) {
                            setSelectedIndex(newIndex);
                        }

                        // Y-Axis (Up) -> Confirm
                        // vector.y is negative for UP (tip < base)

                        // Check for initial high finger position (Safety)
                        if (isWaitingForFingerResetRef.current) {
                            if (vector.y < -0.8) {
                                // Still high, show warning and block confirm
                                setShowFingerWarning(true);
                                return;
                            } else {
                                // Finger dropped, clear warning and enable confirm
                                isWaitingForFingerResetRef.current = false;
                                setShowFingerWarning(false);
                            }
                        }

                        if (vector.y < -0.9) {
                            // Cooldown for confirm
                            if (now - lastConfirmTimeRef.current > 1000) {
                                lastConfirmTimeRef.current = now;

                                const options = skillOptionsRef.current;
                                if (options[newIndex]) {
                                    handleSkillSelect(options[newIndex].type);
                                }
                            }
                        }

                        return; // Skip other game input logic if modal is open (conceptually)
                    }

                    // Normal Game Input Logic (Overlay timer etc)
                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                        timerRef.current = null;
                    }, 1000);
                },
                (s: PlayerStats) => {
                    // Throttle stats update
                    const key = `${s.coins},${s.exp},${Math.round(s.hp)},${s.level},${Math.floor(s.time)},${s.killCount},${s.specialGauge.toFixed(1)},${s.maxSpecialGauge},${s.activeSpecialType}`;
                    if (key !== lastStatsRef.current) {
                        lastStatsRef.current = key;
                        setStats(s);
                    }
                },
                (options: SkillOption[]) => {
                    setSkillOptions(options);
                    setIsLevelUpModalOpen(true);
                    setSelectedIndex(1); // Default to center
                },
                // onGameEnd Callback
                (finalStats: PlayerStats, isClear: boolean) => {
                    navigate("/result", { state: { stats: finalStats, isClear } });
                }
            );

            gameAppRef.current = gameApp;

            try {
                await gameApp.init(containerRef.current!);
            } catch (e) {
                console.error("Game init failed", e);
            }
        };

        initGame();

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (gameAppRef.current) {
                gameAppRef.current.destroy();
                gameAppRef.current = null;
            }
        };
    }, []);

    const handleSkillSelect = (type: SkillType) => {
        if (gameAppRef.current) {
            gameAppRef.current.applySkill(type);
            setIsLevelUpModalOpen(false);
            setSelectedIndex(null);
        }
    };

    return (
        <div className="w-full h-screen relative flex">
            {/* Game Container */}
            <div ref={containerRef} className="w-full h-full overflow-hidden relative" />

            {/* Level Up Modal */}
            {isLevelUpModalOpen && (
                <SkillSelectionModal
                    options={skillOptions}
                    selectedIndex={selectedIndex}
                />
            )}

            {/* Safety Warning Overlay */}
            {showFingerWarning && isLevelUpModalOpen && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
                    <div className="bg-red-600/90 text-white px-8 py-4 rounded-full text-2xl font-bold animate-bounce shadow-lg border-4 border-white">
                        指が上がりすぎ　画面に対して指を垂直に向けて
                    </div>
                </div>
            )}



            {/* Status Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none z-50 flex items-center gap-2">
                {status.startsWith("Active:") ? (
                    <>
                        <span>Active</span>
                        <ArrowUp
                            className="w-5 h-5 text-green-400 transition-transform duration-100"
                            style={{
                                transform: (() => {
                                    const match = status.match(/Active: ([-\d.]+), ([-\d.]+)/);
                                    if (match) {
                                        const x = parseFloat(match[1]);
                                        const y = parseFloat(match[2]);
                                        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
                                        return `rotate(${angle}deg)`;
                                    }
                                    return "rotate(0deg)";
                                })()
                            }}
                        />
                    </>
                ) : (
                    status
                )}
            </div>

            {/* Camera Preview overlay (bottom right) */}
            <div className="absolute bottom-4 right-4 w-64 h-48 bg-black border-2 border-white/50 rounded-lg overflow-hidden flex flex-col items-center justify-center pointer-events-none opacity-80">
                <video
                    ref={videoRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    width={640}
                    height={480}
                />
            </div>

            {/* UI Overlay (top-left) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Button asChild variant="secondary" className="bg-slate-800/80 hover:bg-slate-700 text-white border-none w-fit">
                    <Link to="/home">
                        Back to Home
                    </Link>
                </Button>

                {/* Stats HUD */}
                <div className="bg-black/70 text-white px-4 py-3 rounded-xl flex flex-col gap-1.5 text-sm font-mono pointer-events-none select-none min-w-[200px]">
                    {/* Level & EXP */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-yellow-100">Lv.{stats.level}</span>
                        <span className="text-xs text-gray-300">{Math.floor(stats.exp)} / {Math.floor(stats.nextLevelExp)} EXP</span>
                    </div>
                    {/* EXP Bar */}
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (stats.exp / stats.nextLevelExp) * 100)}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-red-300">
                            {Math.ceil(stats.hp)} / {stats.maxHp}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300">{stats.coins}</span>
                    </div>
                </div>

                {/* Weapons HUD */}
                {stats.weapons.length > 0 && (
                    <div className="bg-black/70 text-white px-4 py-3 rounded-xl pointer-events-none select-none max-w-[250px]">
                        <div className="flex items-center gap-2 mb-2 text-red-400 border-b border-gray-600 pb-1">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold text-xs">WEAPONS</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats.weapons.map((w) => {
                                const def = SKILL_DEFINITIONS[w.type];
                                return (
                                    <div key={w.type} className="relative group w-10 h-10 bg-slate-800 rounded border border-slate-600 flex items-center justify-center shadow-sm" title={`${def.name} Lv.${w.level}`}>
                                        <img src={def.icon} alt={def.name} className="w-7 h-7 object-contain" />
                                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-[10px] font-bold text-white px-1.5 rounded-full leading-tight border border-black">
                                            {w.level}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Passives HUD */}
                {stats.passives.length > 0 && (
                    <div className="bg-black/70 text-white px-4 py-3 rounded-xl pointer-events-none select-none max-w-[250px]">
                        <div className="flex items-center gap-2 mb-2 text-blue-400 border-b border-gray-600 pb-1">
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-bold text-xs">PASSIVES</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {stats.passives.map((p) => {
                                const def = SKILL_DEFINITIONS[p.type];
                                return (
                                    <div key={p.type} className="relative group w-10 h-10 bg-slate-800 rounded border border-slate-600 flex items-center justify-center shadow-sm" title={`${def.name} Lv.${p.level}`}>
                                        <img src={def.icon} alt={def.name} className="w-7 h-7 object-contain" />
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] font-bold text-white px-1.5 rounded-full leading-tight border border-black">
                                            {p.level}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* Top Right HUD (Time & Kills) */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-5 py-3 rounded-xl flex flex-col gap-3 pointer-events-none select-none shadow-lg border border-white/10">
                {/* Time */}
                <div className="flex items-center justify-between min-w-[140px]">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tabular-nums">
                        {Math.floor(stats.time)}<span className="text-sm text-gray-400 ml-1">s</span>
                    </div>
                </div>

                {/* Kills */}
                <div className="flex items-center justify-between min-w-[140px]">
                    <div className="flex items-center gap-2 text-red-500">
                        <Skull className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tabular-nums">
                        {stats.killCount}
                    </div>
                </div>
            </div>

            {/* Special Skill Gauge (Bottom Right, left of camera) */}
            <div className="absolute bottom-6 right-72 pointer-events-none select-none flex flex-col items-center gap-1">
                <div className="relative w-24 h-24">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-800"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 44}
                            strokeDashoffset={2 * Math.PI * 44 * (1 - Math.min(1, stats.specialGauge / stats.maxSpecialGauge))}
                            className={`transition-all duration-200 ${stats.specialGauge >= stats.maxSpecialGauge ? "text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "text-purple-900"
                                }`}
                        />
                    </svg>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 ${stats.specialGauge >= stats.maxSpecialGauge ? "border-purple-400 bg-purple-900/50 animate-pulse" : "border-gray-700 bg-black/50"
                            }`}>
                            {/* Placeholder Icon/Text for Muryo Kusho */}
                            <span className={`text-xs font-bold text-center ${stats.specialGauge >= stats.maxSpecialGauge ? "text-purple-100" : "text-gray-500"
                                }`}>
                                {stats.activeSpecialType === "MURYO_KUSHO" ? <>無量<br />空処</> : "狐"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cooldown Text */}
                <div className="text-sm font-mono font-bold bg-black/70 px-2 py-0.5 rounded text-white">
                    {stats.specialGauge >= stats.maxSpecialGauge ? "READY" : `${Math.ceil(stats.maxSpecialGauge - stats.specialGauge)}s`}
                </div>
            </div>
            {/* Tutorial Overlay */}
            {isTutorialVisible && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                    <div className="flex flex-col items-center gap-6 p-8 bg-black/40 rounded-3xl border border-white/20 shadow-2xl animate-pulse-slow">
                        <div className="relative w-32 h-32 flex items-center justify-center bg-slate-800/50 rounded-full border-4 border-yellow-400/50">
                            <span className="text-6xl">👆</span>
                            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-ping"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-md">
                                カメラの前で指を動かして操作
                            </h2>
                            <p className="text-xl text-white/90">
                                指を動かすとキャラクターが移動します
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
