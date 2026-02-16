// src/features/setting/SettingScreen.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function SettingScreen() {
  const navigate = useNavigate();

  // 1. ユーザー情報のステート (avatarUrlは本番環境の実際の値を受け取れるよう空に)
  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "", // 外部URLを削除し、実際のパスを参照するように修正
    displayName: "Player"
  });

  // 2. 音量管理用のステート (Sliderは配列形式を想定)
  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);

  // 3. 保存状態の管理
  const [isSaved, setIsSaved] = useState(false);

  // 値が変更されたら「保存しました！」状態を解除する共通ハンドラ
  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  // スライダーと同期させるための数値入力ハンドラ
  const handleVolumeInputChange = (
    val: string, 
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    const num = parseInt(val);
    const clampedVal = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    setter([clampedVal]);
    handleValueChange();
  };

  // 保存処理
  const handleSave = () => {
    console.log("Settings saved for:", user.id, {
      displayName: user.displayName,
      bgm: bgmVolume[0],
      se: seVolume[0]
    });
    // 保存完了フラグをオンにする
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 relative">
      
      {/* 戻るボタン */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-black/40 bg-black/10 hover:bg-black/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-4xl font-bold mb-8 text-yellow-600">
        Setting
      </h1>
      
      {/* 設定カードのコンテナ (space-y-4 で各カードを接近) */}
      <div className="w-full max-w-md space-y-4">
        
        {/* ユーザープロフィール設定カード */}
        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-yellow-500 shadow-sm">
            {/* サンプルURLを削除し、ステートのavatarUrlを参照。なければFallbackへ */}
            <AvatarImage 
              src={user.avatarUrl || undefined} 
              alt={user.displayName} 
            />
            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xl">
              {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="input-username" className="text-sm font-bold text-slate-600">
                user name
              </label>
              <Input 
                id="input-username" 
                type="text" 
                value={user.displayName} 
                onChange={(e) => {
                  setUser({ ...user, displayName: e.target.value });
                  handleValueChange();
                }}
                className="bg-white border-slate-300 focus:border-yellow-500 text-black font-medium"
              />
            </div>
          </div>
        </div>

        {/* ボリューム設定カード */}
        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* BGM Volume */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">BGM Volume</span>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  value={bgmVolume[0]}
                  onChange={(e) => handleVolumeInputChange(e.target.value, setBgmVolume)}
                  className="w-16 h-8 p-1 text-center font-bold text-yellow-600 border-none bg-transparent"
                />
                <span className="text-sm font-mono font-bold text-yellow-600">%</span>
              </div>
            </div>
            <Slider
              value={bgmVolume}
              onValueChange={(val) => {
                setBgmVolume(val);
                handleValueChange();
              }}
              max={100}
              step={1}
              className="py-2"
            />
          </div>

          {/* SE Volume */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">SE Volume</span>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  value={seVolume[0]}
                  onChange={(e) => handleVolumeInputChange(e.target.value, setSeVolume)}
                  className="w-16 h-8 p-1 text-center font-bold text-yellow-600 border-none bg-transparent"
                />
                <span className="text-sm font-mono font-bold text-yellow-600">%</span>
              </div>
            </div>
            <Slider
              value={seVolume}
              onValueChange={(val) => {
                setSeVolume(val);
                handleValueChange();
              }}
              max={100}
              step={1}
              className="py-2"
            />
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-md
              ${isSaved 
                ? "bg-green-500 text-white cursor-default" 
                : "bg-black text-white hover:bg-slate-800"
              }`}
          >
            {isSaved ? "保存しました！" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}