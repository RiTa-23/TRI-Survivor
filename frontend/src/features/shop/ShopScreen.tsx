// src/features/shop/ShopScreen.tsx

// 1. 必要な機能をインポートします
import { useNavigate } from "react-router-dom"; // 画面遷移に使う
import { LockKeyhole } from 'lucide-react';

// 2. コンポーネント関数を定義します (ファイル名と同じにするのが基本)
export default function ShopScreen() {
    // 画面遷移のためのフックを使えるようにする
    const navigate = useNavigate();

    // 3. 画面の見た目 (HTMLっぽいJSX) を返します
    return (
        // Tailwind CSS でスタイリング (背景色: slate-950, 文字色: white, 画面いっぱい: min-h-screen)
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">

            {/* タイトル */}
            <h1 className="text-4xl font-bold mb-6 text-yellow-400">
            Shop
            </h1>
            
            <div className="flex items-center gap-4">
                {/* 解放ボタン */}
                <button
                    // TODO: あとで解放の処理を追加します
                    onClick={() => alert('解放しました！')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-bold flex items-center gap-2"
                >
                    <LockKeyhole size={20} />
                    解放
                </button>
                 {/* 解放ボタン */}
                <button
                    // TODO: あとで解放の処理を追加します
                    onClick={() => alert('解放しました！')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-bold flex items-center gap-2"
                >
                    <LockKeyhole size={20} />
                    解放
                </button>
                 {/* 解放ボタン */}
                <button
                    // TODO: あとで解放の処理を追加します
                    onClick={() => alert('解放しました！')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-bold flex items-center gap-2"
                >
                    <LockKeyhole size={20} />
                    解放
                </button>
                 {/* 解放ボタン */}
                <button
                    // TODO: あとで解放の処理を追加します
                    onClick={() => alert('解放しました！')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-bold flex items-center gap-2"
                >
                    <LockKeyhole size={20} />
                    解放
                </button>

            {/* ホームに戻るボタン */}
            <button
                // クリックされたら /home に移動する
                onClick={() => navigate("/home")}
                // ボタンの見た目
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-bold"
            >
                ホームに戻る
            </button>
            </div>
        </div>
    );
}