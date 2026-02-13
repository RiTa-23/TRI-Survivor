// 1. 必要な機能をインポートします
import { useNavigate } from "react-router-dom"; // 画面遷移に使う
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

// 2. コンポーネント関数を定義します (ファイル名と同じにするのが基本)
export default function SettingScreen() {
    // 画面遷移のためのフックを使えるようにする
    const navigate = useNavigate();

    // 3. 画面の見た目 (HTMLっぽいJSX) を返します
    return (
        // Tailwind CSS でスタイリング (背景色: slate-950, 文字色: white, 画面いっぱい: min-h-screen)
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">

            {/* タイトル */}
            <h1 className="text-4xl font-bold mb-6 text-yellow-400">
            Setting
            </h1>
            
            {/* スライダー 1 */}
            <div className="flex items-center w-full max-w-xs mx-auto mb-8 gap-4">
                <span className="text-slate-200 text-sm font-medium whitespace-nowrap">bgm_volume</span>
                <Slider
                    defaultValue={[75]}
                    max={100}
                    step={1}
                    inverted
                    className="w-full"
                />
            </div>

            {/* スライダー 2 */}
            <div className="flex items-center w-full max-w-xs mx-auto mb-8 gap-4">
                <span className="text-slate-200 text-sm font-medium whitespace-nowrap">SE_volume</span>
                <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    inverted
                    className="w-full"
                />
            </div>

            {/* Avatar & ID Input Area */}
            <div className="flex items-center gap-8 mb-8">
                {/* Avatars */}
                <div className="flex flex-row flex-wrap items-center gap-6 md:gap-12">
                    <Avatar>
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                            className="grayscale"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    
                </div>

                {/* ID Input */}
                <div className="w-full max-w-xs text-left">
                    <div className="grid w-full items-center gap-1.5">
                        <label htmlFor="input-id" className="text-sm font-medium leading-none text-slate-200">
                            ID
                        </label>
                        <Input id="input-id" type="text" placeholder="Enter your ID" />
                        <p className="text-sm text-slate-400">
                            Please enter your ID.
                        </p>
                    </div>
                </div>
            </div>

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
    );
}