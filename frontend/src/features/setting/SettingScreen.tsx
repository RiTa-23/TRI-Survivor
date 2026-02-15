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

  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "",
    displayName: "Gemini User"
  });

  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);
  const [isSaved, setIsSaved] = useState(false);

  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  const handleSave = () => {
    console.log("Settings saved:", {
      username: user.displayName,
      bgm: bgmVolume[0],
      se: seVolume[0]
    });
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 relative">
      
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-black/40 bg-black/10 hover:bg-black/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-4xl font-bold mb-8 text-yellow-600">
        Setting
      </h1>
      
      {/* 修正：全体の space-y を 10 -> 4 に変更してカード同士を接近 */}
      <div className="w-full max-w-md space-y-4">
        
        {/* ユーザーネーム設定カード */}
        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-yellow-500 shadow-sm">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xl">
              {user.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="input-username" className="text-sm font-bold text-slate-600">
                ユーザーネーム
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

        {/* 音量設定カード */}
        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">BGM Volume</span>
              <span className="text-sm font-mono font-bold text-yellow-600">{bgmVolume}%</span>
            </div>
            <Slider
              value={bgmVolume}
              onValueChange={(val) => {
                setBgmVolume(val);
                handleValueChange();
              }}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">SE Volume</span>
              <span className="text-sm font-mono font-bold text-yellow-600">{seVolume}%</span>
            </div>
            <Slider
              value={seVolume}
              onValueChange={(val) => {
                setSeVolume(val);
                handleValueChange();
              }}
              max={100}
              step={1}
            />
          </div>
        </div>

        {/* 保存ボタン：カードとの距離を少し開けるために MT（Margin Top）を調整 */}
        <div className="pt-2">
          <button
            onClick={handleSave}
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