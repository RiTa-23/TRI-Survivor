import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-2">Home Screen</h1>
            {user && <p className="text-slate-400 mb-6">ログイン中: {user.email}</p>}

            <p className="text-slate-400 mb-8">仮のホーム画面です</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="px-8 py-6 text-lg font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20">
                    <Link to="/game">
                        GAME START
                    </Link>
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="px-8 py-6 text-lg font-bold border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                    ログアウト
                </Button>
            </div>
        </div>
    );
}
