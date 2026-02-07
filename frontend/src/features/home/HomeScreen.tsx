import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Home Screen</h1>
            <p className="text-slate-400 mb-8">仮のホーム画面です</p>
            <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors"
            >
                開始画面に戻る
            </button>
        </div>
    );
}
