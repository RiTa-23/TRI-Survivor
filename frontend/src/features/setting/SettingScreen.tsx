// src/features/setting/SettingScreen.tsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Camera, Volume1, Volume2, VolumeOff, X} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function SettingScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ステート管理 ---
  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "", 
    displayName: "Player"
  });

  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);
  const [isSaved, setIsSaved] = useState(false);

  // 共通のボタンスタイル（ホールド時に黒くなる設定）
  const iconBtnStyle = "p-1.5 rounded-full transition-all active:bg-black active:bg-opacity-20 active:opacity-70 text-slate-400 hover:bg-slate-200";

  // --- ハンドラ ---
  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  const adjustVolume = (current: number[], delta: number, setter: React.Dispatch<React.SetStateAction<number[]>>) => {
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

  const handleVolumeInputChange = (val: string, setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    const num = parseInt(val);
    const clampedVal = isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
    setter([clampedVal]);
    handleValueChange();
  };

  const handleSave = () => {
    console.log("Settings saved:", user, { bgm: bgmVolume[0], se: seVolume[0] });
    setIsSaved(true);
  };

  return (
    /* 背景オーバーレイ */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* モーダル本体 */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-yellow-600 font-mono tracking-tighter">
              Setting
            </h1>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          
          {/* ユーザー設定セクション */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-16 w-16 border-2 border-yellow-500 shadow-sm transition-opacity group-hover:opacity-90">
                <AvatarImage src={user.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                  {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                <Camera size={16} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 block">User Name</label>
              <Input 
                value={user.displayName} 
                onChange={(e) => { setUser({ ...user, displayName: e.target.value }); handleValueChange(); }}
                className="bg-white border-slate-200 h-9 text-sm focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          {/* ボリューム設定エリア */}
          <div className="space-y-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            
            {/* BGM Volume */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">BGM Volume</span>
                  <button 
                    onClick={() => handleMute(setBgmVolume)} 
                    className={`p-1 rounded-full transition-all active:bg-black active:bg-opacity-30 ${bgmVolume[0] === 0 ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-200"}`}
                  >
                    <VolumeOff size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                  <Input 
                    type="number"
                    value={bgmVolume[0]}
                    onChange={(e) => handleVolumeInputChange(e.target.value, setBgmVolume)}
                    className="w-10 h-6 p-0 text-center border-none bg-transparent font-bold focus:ring-0"
                  />
                  <span className="text-[10px]">%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-1">
                <button onClick={() => adjustVolume(bgmVolume, -1, setBgmVolume)} className={iconBtnStyle}>
                  <Volume1 size={20} />
                </button>
                <Slider value={bgmVolume} onValueChange={(val) => { setBgmVolume(val); handleValueChange(); }} max={100} step={1} className="flex-1 py-4" />
                <button onClick={() => adjustVolume(bgmVolume, 1, setBgmVolume)} className={iconBtnStyle}>
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            {/* SE Volume */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">SE Volume</span>
                  <button 
                    onClick={() => handleMute(setSeVolume)} 
                    className={`p-1 rounded-full transition-all active:bg-black active:bg-opacity-30 ${seVolume[0] === 0 ? "text-red-500 bg-red-50" : "text-slate-400 hover:bg-slate-200"}`}
                  >
                    <VolumeOff size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                  <Input 
                    type="number"
                    value={seVolume[0]}
                    onChange={(e) => handleVolumeInputChange(e.target.value, setSeVolume)}
                    className="w-10 h-6 p-0 text-center border-none bg-transparent font-bold focus:ring-0"
                  />
                  <span className="text-[10px]">%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-1">
                <button onClick={() => adjustVolume(seVolume, -1, setSeVolume)} className={iconBtnStyle}>
                  <Volume1 size={20} />
                </button>
                <Slider value={seVolume} onValueChange={(val) => { setSeVolume(val); handleValueChange(); }} max={100} step={1} className="flex-1 py-4" />
                <button onClick={() => adjustVolume(seVolume, 1, setSeVolume)} className={iconBtnStyle}>
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* フッター（保存ボタン） */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.97] shadow-lg
              ${isSaved 
                ? "bg-green-500 text-white cursor-default shadow-green-200" 
                : "bg-black text-white hover:bg-slate-800 shadow-slate-200"
              }`}
          >
            {isSaved ? "保存しました！" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}