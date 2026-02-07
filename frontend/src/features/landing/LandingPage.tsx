import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function LandingPage() {

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row items-center justify-center text-white relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 to-slate-950 z-0" />

            <div className="z-10 text-center md:text-left space-y-8 p-6 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-around text-white">
                <div className="space-y-6 flex-1 max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse">
                        TRI-Survivor
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 font-light">
                        Survive the geometric chaos. Upgrade your arsenal. Dominate the void.
                    </p>
                </div>

                <div className="pt-8 md:pt-0 flex-none">
                    <Link
                        to="/auth"
                        className={cn(
                            "px-12 py-6 bg-white text-slate-950 text-2xl font-bold rounded-full",
                            "hover:bg-slate-200 hover:scale-105 transition-all duration-200",
                            "shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap inline-block text-center"
                        )}
                    >
                        GAME START
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-4 text-slate-600 text-sm w-full text-center">
                © 2026 TRI-Survivor Project
            </footer>
        </div>
    );
}
