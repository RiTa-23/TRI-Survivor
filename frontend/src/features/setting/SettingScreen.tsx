// src/features/setting/SettingScreen.tsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Volume1, Volume2, VolumeOff } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function SettingScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "", 
    displayName: "Player"
  });

  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);
  const [isSaved, setIsSaved] = useState(false);

  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  // --- 音量を1ずつ調整するハンドラ ---
  const adjustVolume = (
    current: number[], 
    delta: number, 
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    const newValue = Math.max(0, Math.min(100, current[0] + delta));
    setter([newValue]);
    handleValueChange();
  };

  const handleMute = (setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    setter([0]);
    handleValueChange();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatarUrl: reader.result as string });
        handleValueChange();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolumeInputChange = (
    val: string, 
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    const num = parseInt(val);
    const clampedVal = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    setter([clampedVal]);
    handleValueChange();
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

      <h1 className="text-4xl font-bold mb-8 text-yellow-600 font-mono tracking-tighter">
        Setting
      </h1>
      
      <div className="w-full max-w-md space-y-4">
        
        {/* ユーザープロフィール設定カード */}
        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="h-20 w-20 border-2 border-yellow-500 shadow-sm transition-opacity group-hover:opacity-80">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} className="object-cover" />
              <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xl">
                {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "??"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/40 rounded-full p-2 text-white">
                <Camera size={20} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="input-username" className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                user name
              </label>
              <Input 
                id="input-username" 
                value={user.displayName} 
                onChange={(e) => { setUser({ ...user, displayName: e.target.value }); handleValueChange(); }}
                className="bg-white border-slate-300 focus:border-yellow-500 text-black font-medium h-9"
              />
            </div>
          </div>
        </div>

        {/* ボリューム設定カード */}
        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* BGM Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">BGM Volume</span>
                <button 
                  onClick={() => handleMute(setBgmVolume)}
                  className={`p-1 rounded-full transition-colors ${bgmVolume[0] === 0 ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-200"}`}
                >
                  <VolumeOff size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Input 
                  type="number"
                  value={bgmVolume[0]}
                  onChange={(e) => handleVolumeInputChange(e.target.value, setBgmVolume)}
                  className="w-12 h-8 p-0 text-center font-bold text-yellow-600 border-none bg-transparent"
                />
                <span className="text-xs font-bold text-yellow-600">%</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 修正：1減らすボタン */}
              <button onClick={() => adjustVolume(bgmVolume, -1, setBgmVolume)} className="text-slate-400 hover:text-yellow-600 transition-colors">
                <Volume1 size={20} />
              </button>
              
              <Slider
                value={bgmVolume}
                onValueChange={(val) => { setBgmVolume(val); handleValueChange(); }}
                max={100}
                step={1}
                className="flex-1 py-2"
              />

              {/* 修正：1増やすボタン */}
              <button onClick={() => adjustVolume(bgmVolume, 1, setBgmVolume)} className="text-slate-400 hover:text-yellow-600 transition-colors">
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          {/* SE Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">SE Volume</span>
                <button 
                  onClick={() => handleMute(setSeVolume)}
                  className={`p-1 rounded-full transition-colors ${seVolume[0] === 0 ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-200"}`}
                >
                  <VolumeOff size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Input 
                  type="number"
                  value={seVolume[0]}
                  onChange={(e) => handleVolumeInputChange(e.target.value, setSeVolume)}
                  className="w-12 h-8 p-0 text-center font-bold text-yellow-600 border-none bg-transparent"
                />
                <span className="text-xs font-bold text-yellow-600">%</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 修正：1減らすボタン */}
              <button onClick={() => adjustVolume(seVolume, -1, setSeVolume)} className="text-slate-400 hover:text-yellow-600 transition-colors">
                <Volume1 size={20} />
              </button>
              
              <Slider
                value={seVolume}
                onValueChange={(val) => { setSeVolume(val); handleValueChange(); }}
                max={100}
                step={1}
                className="flex-1 py-2"
              />

              {/* 修正：1増やすボタン */}
              <button onClick={() => adjustVolume(seVolume, 1, setSeVolume)} className="text-slate-400 hover:text-yellow-600 transition-colors">
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-md
              ${isSaved ? "bg-green-500 text-white cursor-default" : "bg-black text-white hover:bg-slate-800"}`}
          >
            {isSaved ? "保存しました！" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}