import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AuthScreen() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
            <div className="w-full max-w-md bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
                <p className="text-slate-400 text-center mb-8">Sign in to continue your progress</p>

                <div className="space-y-4">
                    <Button
                        onClick={() => navigate("/home")}
                        className="w-full py-6 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium flex items-center justify-center gap-2"
                    >
                        {/* Mock Discord Icon */}
                        <span className="w-5 h-5 bg-white/20 rounded-full" />
                        Continue with Discord
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate("/home")}
                        className="w-full py-6 bg-white text-slate-900 hover:bg-slate-100 font-medium flex items-center justify-center gap-2 border-slate-200"
                    >
                        {/* Mock Google Icon */}
                        <span className="w-5 h-5 bg-slate-900/20 rounded-full" />
                        Continue with Google
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">Or continue as guest</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/home")}
                        className="w-full py-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                    >
                        Guest Login
                    </Button>
                </div>
            </div>
        </div>
    );
}
