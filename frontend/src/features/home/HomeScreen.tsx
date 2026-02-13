import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Settings, LogOut, Coins } from "lucide-react";

export default function HomeScreen() {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();

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
        /* 親要素に relative を指定し、画面全体の中央寄せを維持 */
        <div className="relative min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">

            {/* --- 絶対配置のコントロール要素を外側へ移動 --- */}

            <div className="absolute top-4 right-4 flex items-center gap-4">
                {/* コイン表示 */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-inner">
                    <Coins className="w-4 h-4 text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                    <span className="text-sm font-mono font-bold tracking-wider">0</span>
                </div>

                <Button asChild className="p-2 text-white rounded bg-black/50 hover:bg-black/75 shadow-lg">
                    <Link to="/setting">
                        <Settings className="w-8 h-8 opacity-50 hover:opacity-100" />
                    </Link>
                </Button>
            </div>
            {/* ------------------------------------------ */}

            {/* メインコンテンツ（Flexコンテナ内の要素） */}
            {/* ユーザー情報 (左上に配置) */}
            <div className="absolute top-4 left-4">
                {user && <p className="text-slate-400 text-sm font-medium">ログイン中: {user.user_metadata?.full_name || user.email}</p>}
            </div>


            {/* バトル開始ボタン (右下に配置) */}
            <div className="absolute bottom-8 right-8">
                <Button asChild className="px-12 py-8 text-xl font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20">
                    <Link to="/game">
                        BATTLE START
                    </Link>
                </Button>
            </div>

            {/* サブメニュー (左中央に配置) */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                <Button asChild className="px-8 py-6 text-lg font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                    <Link to="/shop">
                        ショップ
                    </Link>
                </Button>
                
                <Button asChild className="px-8 py-6 text-lg font-bold bg-yellow-600 text-white hover:bg-yellow-500 shadow-lg shadow-yellow-500/20">
                    <Link to="/tutorial">
                        チュートリアル
                    </Link>
                </Button>
            </div>

            {/* ログアウトエリア (左下に配置) */}
            <div className="absolute left-8 bottom-8">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="px-4 py-2 flex items-center gap-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider text-xs">Logout</span>
                </Button>
            </div>
        </div>
    );
}