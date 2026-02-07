import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomeScreen() {

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Home Screen</h1>
            <p className="text-slate-400 mb-8">仮のホーム画面です</p>
            <div className="flex gap-4">
                <Button asChild className="px-6 py-6 text-lg font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20">
                    <Link to="/game">
                        GAME START
                    </Link>
                </Button>
                <Button asChild className="px-6 py-6 text-lg font-bold bg-indigo-600 text-white hover:bg-indigo-500">
                    <Link to="/">
                        開始画面に戻る
                    </Link>
                </Button>
            </div>
        </div>
    );
}
