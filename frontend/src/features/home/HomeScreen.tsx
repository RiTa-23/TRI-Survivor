import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/gameStore";
import { Settings, LogOut, Coins, ShoppingBag, BookOpen, ChevronRight, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeScreen() {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();
    const { coins } = useGameStore();

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
                    <div className="relative z-10 flex flex-col items-center -mt-20">
                        {/* キャラクター画像本体 */}
                        <motion.div 
                            className="relative group"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* 足元の影 */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-black/30 blur-xl rounded-full scale-x-110" />
                            
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
                        {[...Array(6)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute bg-white rounded-full blur-xl animate-pulse"
                                style={{
                                    width: Math.random() * 100 + 50 + 'px',
                                    height: Math.random() * 100 + 50 + 'px',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    animationDelay: i * 0.5 + 's',
                                    opacity: Math.random() * 0.2
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* --- 右下: バトル開始ボタン --- */}
                <div className="absolute bottom-10 right-10 z-30">
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button asChild className="px-12 py-12 text-2xl font-black btn-fantasy-red rounded-3xl group">
                            <Link to="/game" className="tracking-[0.25em] flex flex-col items-center leading-tight">
                                <span className="flex items-center gap-2">
                                    BATTLE START
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </Button>
                    </motion.div>
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
