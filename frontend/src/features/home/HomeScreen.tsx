import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/gameStore";
import { Settings, LogOut, Coins, ShoppingBag, BookOpen, User as UserIcon, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeScreen() {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();
    const { coins, selectedWeapon, setSelectedWeapon, selectedSpecialMove, setSelectedSpecialMove } = useGameStore();

    // パーティクルデータを初回のみ生成（再レンダリング時のちらつき防止）
    const particles = useMemo(() => 
        Array.from({ length: 6 }, (_, i) => ({
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: i * 0.5,
            opacity: Math.random() * 0.2,
        })),
    []);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("ログアウトに失敗しました。もう一度お試しください。");
        }
    };

    return (
        <div className="relative min-h-screen w-full forest-bg text-white overflow-hidden flex flex-col">
            
            {/* --- 上部メニューバー (木製パネル) --- */}
            <div className="h-20 w-full wood-panel z-30 flex items-center justify-between px-8 border-t-0 border-x-0">
                {/* ログイン中ユーザー (左) */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1b110e] border-2 border-[#5d4037] flex items-center justify-center shadow-inner overflow-hidden">
                        <UserIcon className="text-amber-200/50 w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-100/60 uppercase tracking-widest leading-tight">Adventurer</span>
                        <span className="text-sm font-black text-amber-50 drop-shadow-sm">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Player"}
                        </span>
                    </div>
                </div>

                {/* コインと設定 (右) */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-amber-900/30">
                        <Coins className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        <span className="text-sm font-mono font-black tracking-widest text-yellow-100">{coins.toLocaleString()}</span>
                    </div>

                    <Button asChild variant="ghost" className="p-2 text-amber-200/70 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Link to="/setting">
                            <Settings className="w-6 h-6" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 relative">
                {/* --- 左側メニューバー (木製パネル) --- */}
                <div className="w-24 md:w-28 wood-panel z-20 flex flex-col items-center py-10 gap-8 border-l-0 border-y-0">
                    <VerticalMenuButton to="/shop" icon={<ShoppingBag className="w-6 h-6" />} label="SHOP" color="text-blue-400" />
                    <VerticalMenuButton to="/tutorial" icon={<BookOpen className="w-6 h-6" />} label="TUTORIAL" color="text-amber-400" />
                    
                    <div className="mt-auto mb-4">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="flex flex-col items-center gap-1 text-amber-200/50 hover:text-red-400 hover:bg-red-400/5 transition-colors group p-2"
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="font-black uppercase tracking-tighter text-[9px]">LOG OUT</span>
                        </Button>
                    </div>
                </div>

                {/* --- 中央: キャラクター表示エリア --- */}
                <div className="flex-1 relative flex items-center justify-center">
                    
                    {/* --- スキル選択 (武器選択) エリア --- */}
                    <div className="absolute left-6 md:left-12 top-[55%] -translate-y-1/2 z-20 flex flex-col gap-8">

                        <div className="flex flex-col gap-6">
                            {/* 剣の選択肢 */}
                            <div 
                                onClick={() => setSelectedWeapon('sword')}
                                className={`relative w-28 h-32 md:w-32 md:h-40 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                                    ${selectedWeapon === 'sword' 
                                        ? 'border-amber-400 bg-amber-900/40 shadow-[0_0_30px_rgba(251,191,36,0.4)]' 
                                        : 'border-amber-900/30 bg-black/40 grayscale hover:grayscale-0 hover:border-amber-700'}`}
                            >
                                {/* 剣のイメージ画像 */}
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                    <img 
                                        src="/assets/images/sword.png" 
                                        alt="Sword" 
                                        className="w-full h-full object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]"
                                    />
                                </div>
                                <span className={`text-xs font-black tracking-[0.2em] transition-colors ${selectedWeapon === 'sword' ? 'text-amber-100' : 'text-amber-100/40'}`}>SWORD</span>
                                
                                {selectedWeapon === 'sword' && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.6)] border-4 border-[#1b110e]">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1b110e]" />
                                    </div>
                                )}
                            </div>

                            {/* 銃の選択肢 */}
                            <div 
                                onClick={() => setSelectedWeapon('gun')}
                                className={`relative w-28 h-32 md:w-32 md:h-40 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                                    ${selectedWeapon === 'gun' 
                                        ? 'border-blue-400 bg-blue-900/40 shadow-[0_0_30px_rgba(96,165,250,0.4)]' 
                                        : 'border-amber-900/30 bg-black/40 grayscale hover:grayscale-0 hover:border-blue-900/50'}`}
                            >
                                {/* 銃のイメージ画像 — センタリングを維持しつつ拡大 */}
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 overflow-visible">
                                    <img 
                                        src="/assets/images/handgun.png" 
                                        alt="Handgun" 
                                        className="max-w-[150%] max-h-[150%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transform translate-x-12 translate-y-[-6px]"
                                    />
                                </div>
                                <span className={`text-xs font-black tracking-[0.2em] transition-colors ${selectedWeapon === 'gun' ? 'text-blue-100' : 'text-amber-100/40'}`}>HANDGUN</span>

                                {selectedWeapon === 'gun' && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.6)] border-4 border-[#1b110e]">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1b110e]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- 必殺技選択 エリア --- */}
                    <div className="absolute right-6 md:right-12 top-[45%] -translate-y-1/2 z-20 flex flex-col gap-8">

                        <div className="flex flex-col gap-6">
                            {/* 無量空処の選択肢 */}
                            <div 
                                onClick={() => setSelectedSpecialMove('unlimited_void')}
                                className={`relative w-28 h-32 md:w-32 md:h-40 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                                    ${selectedSpecialMove === 'unlimited_void' 
                                        ? 'border-purple-400 bg-purple-900/40 shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                                        : 'border-purple-900/30 bg-black/40 grayscale hover:grayscale-0 hover:border-purple-700'}`}
                            >
                                {/* 必殺技のイメージ画像: 無量空処 (青い目のマーク) */}
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative">
                                    {/* 魔方陣のような背景発光 */}
                                    <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                        <Eye 
                                            size={44} 
                                            className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" 
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black tracking-wider transition-colors ${selectedSpecialMove === 'unlimited_void' ? 'text-purple-100' : 'text-purple-100/40'}`}>MURYOUKUUSHO</span>
                                
                                {selectedSpecialMove === 'unlimited_void' && (
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.6)] border-4 border-[#1b110e]">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1b110e]" />
                                    </div>
                                )}
                            </div>

                            {/* コンの選択肢 */}
                            <div 
                                onClick={() => setSelectedSpecialMove('kon')}
                                className={`relative w-28 h-32 md:w-32 md:h-40 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
                                    ${selectedSpecialMove === 'kon' 
                                        ? 'border-red-400 bg-red-900/40 shadow-[0_0_30px_rgba(248,113,113,0.4)]' 
                                        : 'border-red-900/30 bg-black/40 grayscale hover:grayscale-0 hover:border-red-900/50'}`}
                            >
                                {/* 必殺技のイメージ画像: KON */}
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 overflow-visible">
                                    <img 
                                        src="/assets/images/Kon.png" 
                                        alt="Kon" 
                                        className="max-w-[140%] max-h-[140%] object-contain drop-shadow-[0_10px_20px_rgba(255,0,0,0.5)] transform translate-y-[-4px]"
                                    />
                                </div>
                                <span className={`text-[10px] font-black tracking-wider transition-colors ${selectedSpecialMove === 'kon' ? 'text-red-100' : 'text-red-100/40'}`}>KON</span>

                                {selectedSpecialMove === 'kon' && (
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-red-400 flex items-center justify-center shadow-[0_0_15px_rgba(248,113,113,0.6)] border-4 border-[#1b110e]">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1b110e]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center -mt-20">
                        {/* キャラクター画像本体 */}
                        <motion.div 
                            className="relative group"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* 足元の影 */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-black/40 blur-[3px] rounded-full scale-x-110" />
                            
                            {/* キャラクター画像 */}
                            <div className="relative w-48 h-60 md:w-64 md:h-[320px] flex items-center justify-center">
                                <img 
                                    src="/assets/images/player.png" 
                                    alt="Player Character" 
                                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* --- 背景の装飾粒子 --- */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        {particles.map((p, i) => (
                            <div 
                                key={i}
                                className="absolute bg-white rounded-full blur-xl animate-pulse"
                                style={{
                                    width: p.width + 'px',
                                    height: p.height + 'px',
                                    top: p.top + '%',
                                    left: p.left + '%',
                                    animationDelay: p.delay + 's',
                                    opacity: p.opacity
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* --- 右下: バトル開始ボタン --- */}
                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30">
                    <Button asChild className="px-12 py-8 md:px-16 md:py-10 text-3xl md:text-4xl font-black btn-fantasy-red rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.7)] hover:scale-105 transition-transform border-4 border-amber-200/80 group">
                        <Link to="/game" className="flex items-center justify-center">
                            <span className="font-serif tracking-[0.15em] text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)] uppercase">
                                BATTLE START
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function VerticalMenuButton({ to, icon, label, color }: { to: string, icon: React.ReactNode, label: string, color: string }) {
    return (
        <motion.div whileHover={{ y: -5 }}>
            <Link to={to} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl bg-[#1b110e] border-2 border-[#5d4037] flex items-center justify-center shadow-lg group-hover:border-white/40 group-hover:bg-[#2d1b18] transition-all ${color}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-amber-100/50 tracking-widest group-hover:text-amber-100 transition-colors">{label}</span>
            </Link>
        </motion.div>
    );
}
