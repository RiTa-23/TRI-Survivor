import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Settings } from "lucide-react";

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
        <div className="relative min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">

            <h1 className="text-4xl font-bold mb-2">TRI Survivor</h1>
            {user && <p className="text-slate-400 mb-6">ログイン中: {user.email}</p>}

            <p className="text-slate-400 mb-8">ようこそ！</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="px-12 py-8 text-xl font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20">
                    <Link to="/game">
                        GAME START
                    </Link>
                </Button>
                <div className="absolute top-4 left-4">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="px-8 py-6 text-lg font-bold border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                        ログアウト
                    </Button>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild className="px-8 py-6 text-lg font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                    <Link to="/shop">
                        ショップ
                    </Link>
                </Button>
                <div className="absolute top-4 right-4">
                    <Button asChild className="p-2 text-white rounded bg-black/50 hover:bg-black/75">
                        <Link to="/setting">
                            <Settings className="w-8 h-8 opacity-50 hover:opacity-100" />
                        </Link>
                    </Button>
                </div>
                <Button asChild className="px-8 py-6 text-lg font-bold bg-yellow-600 text-white hover:bg-yellow-500 shadow-lg shadow-yellow-500/20">
                    <Link to="/tutorial">
                        チュートリアル
                    </Link>
                </Button>
            </div>
        </div>
    );
}
