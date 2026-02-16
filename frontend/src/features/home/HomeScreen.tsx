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
        <div className="relative min-h-screen w-full bg-[#020617] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Effect (Matching LandingPage style but more robust) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-slate-900 to-[#020617] z-0" />
            
            {/* --- HUD Headerパーツ (左上: プロフィール) --- */}
            <div className="absolute top-6 left-6 flex items-center gap-3 glass-morphism px-4 py-2 rounded-xl z-20">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                    <UserIcon className="text-slate-400 w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">Logged in as</span>
                    <span className="text-sm font-black text-white tracking-wide">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Player"}
                    </span>
                </div>
            </div>

            {/* --- HUD Headerパーツ (右上: 通貨 & 設定) --- */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                <div className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-full shadow-inner">
                    <Coins className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    <span className="text-sm font-mono font-black tracking-widest text-yellow-50">{coins.toLocaleString()}</span>
                </div>

                <Button asChild variant="ghost" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <Link to="/setting">
                        <Settings className="w-7 h-7" />
                    </Link>
                </Button>
            </div>

            {/* --- センターエリア --- */}
            <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                
                {/* ランク/役割表示 */}
                <div className="mt-4 px-6 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Legendary Survivor</span>
                </div>
            </div>

            {/* --- バトル開始ボタン (右下) --- */}
            <div className="absolute bottom-10 right-10 z-20">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button asChild className="px-16 py-10 text-2xl font-black bg-red-600 text-white hover:bg-red-500 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] border-2 border-red-400/30 glow-red transition-all">
                        <Link to="/game" className="tracking-[0.2em] flex items-center gap-3">
                            <span>BATTLE START</span>
                        </Link>
                    </Button>
                </motion.div>
            </div>

            {/* --- サブメニュー (左中央) --- */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
                <SideMenuButton to="/shop" icon={<ShoppingBag className="w-5 h-5 text-blue-400" />} label="ショップ" />
                <SideMenuButton to="/tutorial" icon={<BookOpen className="w-5 h-5 text-emerald-400" />} label="チュートリアル" />
            </div>

            {/* --- ログアウトエリア (左下) --- */}
            <div className="absolute left-10 bottom-10 z-20">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="px-4 py-2 flex items-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors group"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-[10px]">Logout</span>
                </Button>
            </div>
        </div>
    );
}

function SideMenuButton({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
    return (
        <motion.div whileHover={{ x: 10 }}>
            <Link to={to}>
                <Button variant="ghost" className="w-48 justify-start gap-4 h-16 glass-morphism border-slate-700/50 hover:border-slate-400 hover:bg-white/5 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative flex items-center w-full gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                            {icon}
                        </div>
                        <span className="text-sm font-black tracking-wider text-slate-200">{label}</span>
                        <ChevronRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                </Button>
            </Link>
        </motion.div>
    );
}
