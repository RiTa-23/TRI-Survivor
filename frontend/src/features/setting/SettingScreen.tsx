// src/features/setting/SettingScreen.tsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Camera, Volume1, Volume2, VolumeOff, X, CheckCircle2, Moon, Sun } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function SettingScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ステート管理 ---
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "", 
    displayName: "Player"
  });

  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // テーマ設定
  const theme = {
    bg: darkMode ? "bg-slate-900" : "bg-white",
    card: darkMode ? "bg-slate-800" : "bg-slate-50",
    text: darkMode ? "text-slate-100" : "text-slate-900",
    border: darkMode ? "border-slate-700" : "border-slate-100",
    input: darkMode 
      ? "bg-slate-900 border-slate-600 text-white focus:border-yellow-500" 
      : "bg-white border-slate-200 text-slate-900 focus:border-yellow-500",
    toast: darkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white",
    
    // スライダーの白黒反転設定
    slider: darkMode 
      ? `
        [&_span:nth-child(1)]:bg-slate-950 
        [&_span:nth-child(1)_span]:bg-white 
        [&_[role=slider]]:bg-slate-950 
        [&_[role=slider]]:border-2 
        [&_[role=slider]]:border-white
      `
      : `
        [&_span:nth-child(1)]:bg-white 
        [&_span:nth-child(1)_span]:bg-black 
        [&_[role=slider]]:bg-white 
        [&_[role=slider]]:border-2 
        [&_[role=slider]]:border-black
      `
  };

  // 共通アイコンボタンスタイル（ホバー・アクティブ時の動き）
  const iconBtnStyle = `p-1.5 rounded-full transition-all active:scale-90 ${
    darkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-400 hover:bg-slate-200"
  }`;

  // --- ハンドラ ---
  const handleValueChange = () => { if (isSaved) setIsSaved(false); };

  const handleSave = () => {
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const adjustVolume = (current: number[], delta: number, setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    setter([Math.max(0, Math.min(100, current[0] + delta))]);
    handleValueChange();
  };

  const handleMute = (setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    setter([0]);
    handleValueChange();
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
    setter([isNaN(num) ? 0 : Math.max(0, Math.min(100, num))]);
    handleValueChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {showToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top-full duration-300 ${theme.toast}`}>
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="font-bold text-sm tracking-tight">設定を保存しました！</span>
        </div>
      )}

      <div className={`relative w-full max-w-md ${theme.bg} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border ${theme.border}`}>
        
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-yellow-600 font-mono tracking-tighter">Setting</h1>
            
            {/* ★ 修正ポイント：ダークモード切替ボタンにホバーエフェクトを追加 */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                darkMode 
                  ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <button onClick={() => navigate("/home")} className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className={`p-6 space-y-6 max-h-[70vh] overflow-y-auto ${theme.bg} ${theme.text}`}>
          
          <div className={`flex items-center gap-4 ${theme.card} p-4 rounded-2xl border ${theme.border}`}>
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-16 w-16 border-2 border-yellow-500 shadow-sm transition-opacity group-hover:opacity-90">
                <AvatarImage src={user.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                  {user.displayName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                <Camera size={16} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">User Name</label>
              <Input 
                value={user.displayName} 
                onChange={(e) => { setUser({ ...user, displayName: e.target.value }); handleValueChange(); }}
                className={`h-9 text-sm focus:ring-1 transition-all ${theme.input}`}
              />
            </div>
          </div>

          <div className={`space-y-6 p-4 ${theme.card} rounded-2xl border ${theme.border}`}>
            {[
              { label: "BGM Volume", val: bgmVolume, setter: setBgmVolume },
              { label: "SE Volume", val: seVolume, setter: setSeVolume }
            ].map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <button onClick={() => handleMute(item.setter)} className={iconBtnStyle}><VolumeOff size={16} /></button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className={`flex items-center px-2 py-0.5 rounded-lg border transition-all ${theme.input}`}>
                      <Input 
                        type="number"
                        value={item.val[0]}
                        onChange={(e) => handleVolumeInputChange(e.target.value, item.setter)}
                        className="w-8 h-5 p-0 text-center border-none bg-transparent font-bold text-sm focus:ring-0"
                      />
                      <span className="text-[10px] font-bold opacity-70">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <button onClick={() => adjustVolume(item.val, -1, item.setter)} className={iconBtnStyle}><Volume1 size={20} /></button>
                  <Slider 
                    value={item.val} 
                    onValueChange={(v) => { item.setter(v); handleValueChange(); }} 
                    max={100} 
                    step={1} 
                    className={`flex-1 py-4 ${theme.slider}`} 
                  />
                  <button onClick={() => adjustVolume(item.val, 1, item.setter)} className={iconBtnStyle}><Volume2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 ${theme.card} border-t ${theme.border}`}>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.97] shadow-lg
              ${isSaved 
                ? "bg-green-500 text-white cursor-default" 
                : darkMode 
                  ? "bg-yellow-600 text-white hover:bg-yellow-500"
                  : "bg-black text-white hover:bg-slate-800"
              }`}
          >
            {isSaved ? "保存完了！" : "設定を保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}