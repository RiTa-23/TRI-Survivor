import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GameApp } from "@/game/core/GameApp";
import { type PlayerStats, SkillType, type SkillOption, SKILL_DEFINITIONS } from "../../game/types";
import { Button } from "@/components/ui/button";
import { ArrowUp, Coins, Heart, Zap } from "lucide-react";
import { SkillSelectionModal } from "./SkillSelectionModal";

export default function GameScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameAppRef = useRef<GameApp | null>(null);

    const [status, setStatus] = useState<string>("Initializing...");
    const [specialMove, setSpecialMove] = useState<string | null>(null);
    const [stats, setStats] = useState<PlayerStats>({
        coins: 0,
        exp: 0,
        hp: 100,
        maxHp: 100,
        level: 1,
        nextLevelExp: 5
    });

    // Skill System State
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
    const [acquiredSkills, setAcquiredSkills] = useState<Map<SkillType, number>>(new Map());

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastStatusRef = useRef<string>("");
    const lastUpdateTsRef = useRef<number>(0);
    const lastStatsRef = useRef<string>("");

    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !canvasRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            // Reset state
            setAcquiredSkills(new Map());
            setIsLevelUpModalOpen(false);

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
                        setSpecialMove(null);
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
                (move) => {
                    setSpecialMove(move);
                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                        setSpecialMove(null);
                        timerRef.current = null;
                    }, 1000);
                },
                (s: PlayerStats) => {
                    // Throttle stats update
                    const key = `${s.coins},${s.exp},${Math.round(s.hp)},${s.level}`;
                    if (key !== lastStatsRef.current) {
                        lastStatsRef.current = key;
                        setStats(s);
                    }
                },
                // onLevelUp Callback
                (options: SkillOption[]) => {
                    setSkillOptions(options);
                    setIsLevelUpModalOpen(true);
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

            // Update local acquired skills state for HUD (exclude instant skills)
            if (type !== SkillType.HEAL && type !== SkillType.GET_COIN) {
                setAcquiredSkills(prev => {
                    const newMap = new Map(prev);
                    newMap.set(type, (newMap.get(type) || 0) + 1);
                    return newMap;
                });
            }

            setIsLevelUpModalOpen(false);
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
                    onSelect={handleSkillSelect}
                />
            )}

            {/* Special Move Overlay */}
            {specialMove && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 text-center w-full">
                    <div className="text-5xl font-black text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce tracking-wider uppercase">
                        {specialMove}!!
                    </div>
                    <div className="text-2xl text-white font-bold mt-2 drop-shadow-md tracking-widest bg-black/50 inline-block px-4 py-1 rounded uppercase">
                        {specialMove === "Muryo Kusho" ? "DOMAIN EXPANSION" : "FOX DEVIL"}
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

                {/* Acquired Skills HUD */}
                {acquiredSkills.size > 0 && (
                    <div className="bg-black/70 text-white px-4 py-3 rounded-xl pointer-events-none select-none max-w-[250px]">
                        <div className="flex items-center gap-2 mb-2 text-yellow-400 border-b border-gray-600 pb-1">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold text-xs">SKILLS</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(acquiredSkills.entries()).map(([type, level]) => {
                                const def = SKILL_DEFINITIONS[type];
                                return (
                                    <div key={type} className="relative group w-10 h-10 bg-slate-800 rounded border border-slate-600 flex items-center justify-center shadow-sm" title={`${def.name} Lv.${level}`}>
                                        <img src={def.icon} alt={def.name} className="w-7 h-7 object-contain" />
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] font-bold text-white px-1.5 rounded-full leading-tight border border-black">
                                            {level}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
