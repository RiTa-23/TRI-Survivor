import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function AuthScreen() {
    const navigate = useNavigate();
    const { signInWithGoogle, user } = useAuthStore();

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
            <div className="w-full max-w-md bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-center mb-8">Sign in to continue your progress</p>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-full py-6 bg-white text-slate-900 hover:bg-slate-100 font-medium flex items-center justify-center gap-2 border-slate-200 cursor-pointer"
                    >
                        {/* Mock Google Icon */}
                        <span className="w-5 h-5 bg-slate-900/20 rounded-full" />
                        Continue with Google
                    </Button>
                </div>
            </div>
        </div>
    );
}
