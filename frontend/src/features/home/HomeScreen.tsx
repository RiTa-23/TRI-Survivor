import { Link } from "react-router-dom";

export default function HomeScreen() {

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Home Screen</h1>
            <p className="text-slate-400 mb-8">仮のホーム画面です</p>
            <div className="flex gap-4">
                <Link
                    to="/game"
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition-colors shadow-lg shadow-red-500/20 text-center flex items-center justify-center"
                >
                    GAME START
                </Link>
                <Link
                    to="/"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors text-center flex items-center justify-center"
                >
                    開始画面に戻る
                </Link>
            </div>
        </div>
    );
}
