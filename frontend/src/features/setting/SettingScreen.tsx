// src/features/setting/SettingScreen.tsx

import { useState, useRef } from "react"; // useState を確実にインポート
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Volume1,
  Volume2,
  VolumeOff,
  X,
  CheckCircle2,
  AlertCircle, // エラー用アイコン
  Moon,
  Sun
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function SettingScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 状態管理 ---
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState({
    id: "Gamer_01",
    avatarUrl: "",
    displayName: "Player"
  });

  const [bgmVolume, setBgmVolume] = useState([75]);
  const [seVolume, setSeVolume] = useState([50]);
  const [isSaved, setIsSaved] = useState(false);

  // トースト管理
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  // --- テーマ定義 ---
  const theme = {
    bg: darkMode
      ? "bg-[#1a1c2c] bg-[radial-gradient(#2d314d_1px,transparent_1px)] [background-size:30px_30px]"
      : "bg-[#f4ead5] bg-[radial-gradient(#e5d3b3_1px,transparent_1px)] [background-size:20px_20px]",
    card: darkMode ? "bg-[#25283d]/80 border-[#4a4e69]" : "bg-[#ede0c8]/50 border-[#d6c5a0]",
    text: darkMode ? "text-[#c9ada7]" : "text-[#5d4037]",
    accent: darkMode ? "text-[#f2e9e4]" : "text-[#5d4037]",
    border: darkMode ? "border-[#4a4e69]" : "border-[#d6c5a0]",
    input: darkMode ? "bg-[#1a1c2c] border-[#4a4e69] text-[#f2e9e4]" : "bg-[#fdf8ed] border-[#c4b394] text-[#5d4037]",
    toast: darkMode ? "bg-[#f2e9e4] text-[#22223b]" : "bg-[#5d4037] text-[#f4ead5]",
    slider: darkMode
      ? `[&_span:nth-child(1)]:bg-[#1a1c2c] [&_span:nth-child(1)_span]:bg-[#f2e9e4] [&_[role=slider]]:bg-[#f2e9e4] [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#22223b]`
      : `[&_span:nth-child(1)]:bg-white [&_span:nth-child(1)_span]:bg-black [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-black`
  };

  const iconBtnStyle = `p-1.5 rounded-full transition-all active:scale-90 ${darkMode ? "text-[#9a8c98] hover:bg-[#4a4e69] hover:text-[#f2e9e4]" : "text-[#8d6e63] hover:bg-[#e0d3ba]"
    }`;

  // --- ハンドラ ---
  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  // 保存処理
  const handleSave = () => {
    // 1. 空白チェック (トリムして判定)
    if (!user.displayName.trim()) {
      setToastType("error");
      setToastMessage("エラー：名前を入力してください");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // 2. 永続化 (localStorage)
      const settings = { user, bgmVolume, seVolume, darkMode };
      localStorage.setItem("app_settings", JSON.stringify(settings));

      // 3. 成功トースト表示
      setToastType("success");
      setToastMessage("変更を保存しました");
      setIsSaved(true);
      setShowToast(true);
    } catch (e) {
      setToastType("error");
      setToastMessage("保存中にエラーが発生しました");
      setShowToast(true);
    } finally {
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // アバター操作 (アクセシビリティ対応)
  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAvatarClick();
    }
  };

  const handleMute = (setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    setter([0]);
    handleValueChange();
  };

  const adjustVolume = (current: number[], delta: number, setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    setter([Math.max(0, Math.min(100, current[0] + delta))]);
    handleValueChange();
  };

  const handleVolumeInputChange = (val: string, setter: React.Dispatch<React.SetStateAction<number[]>>) => {
    const num = parseInt(val);
    setter([isNaN(num) ? 0 : Math.max(0, Math.min(100, num))]);
    handleValueChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">

      {/* 動的トースト (成功/失敗) */}
      {showToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top-full duration-300 ${toastType === "error" ? "bg-red-500 text-white" : theme.toast
          }`}>
          {toastType === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-bold text-sm tracking-tight">{toastMessage}</span>
        </div>
      )}

      <div className={`relative w-full max-w-md ${theme.bg} rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 border-[3px] ${theme.border}`}>

        <div className="relative">
          {/* ヘッダー */}
          <div className={`flex items-center justify-between px-8 py-5 border-b-2 ${theme.border}`}>
            <div className="flex items-center gap-4">
              <h1 className={`text-xl font-bold font-serif tracking-widest uppercase ${theme.accent}`}>Setting</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 rounded-xl transition-all active:scale-95 shadow-inner ${darkMode ? "bg-[#25283d] text-[#f2e9e4] hover:bg-[#4a4e69]" : "bg-[#e5d3b3] text-[#5d4037] hover:bg-[#d6c5a0]"
                  }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <button onClick={() => navigate("/home")} className={`p-1.5 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-[#9a8c98]" : "hover:bg-red-100 text-[#8d6e63]"}`}>
              <X size={24} />
            </button>
          </div>

          <div className={`p-7 space-y-5 ${theme.text}`}>

            {/* ユーザーエリア (アバター・名前) */}
            <div className={`flex items-center gap-4 ${theme.card} p-4 rounded-[1.25rem] border-2 shadow-lg`}>
              <div
                className="relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                onClick={handleAvatarClick}
                onKeyDown={handleAvatarKeyDown}
                role="button"
                tabIndex={0}
                aria-label="アバターを変更する"
              >
                <Avatar className={`h-14 w-14 border-2 ${darkMode ? "border-[#9a8c98]" : "border-[#8d6e63]"} shadow-md transition-opacity group-hover:opacity-90`}>
                  <AvatarImage src={user.avatarUrl || undefined} className="object-cover" />
                  <AvatarFallback className={`${darkMode ? "bg-[#4a4e69] text-[#f2e9e4]" : "bg-[#d6c5a0] text-[#5d4037]"} font-bold`}>
                    {user.displayName?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                  <Camera size={18} className="text-white" />
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setUser({ ...user, avatarUrl: reader.result as string });
                    reader.readAsDataURL(file);
                    handleValueChange();
                  }
                }} className="hidden" />
              </div>

              <div className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 block opacity-60">Identity</label>
                <Input
                  value={user.displayName}
                  onChange={(e) => { setUser({ ...user, displayName: e.target.value }); handleValueChange(); }}
                  className={`h-9 text-sm font-serif border-2 shadow-inner ${theme.input}`}
                  placeholder="Player Name"
                />
              </div>
            </div>

            {/* 音量設定 */}
            <div className={`p-5 ${theme.card} rounded-[1.25rem] border-2 shadow-lg space-y-6`}>
              {[
                { label: "BGM Ambient", val: bgmVolume, setter: setBgmVolume },
                { label: "Effect Sound", val: seVolume, setter: setSeVolume }
              ].map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{item.label}</span>
                      <button onClick={() => handleMute(item.setter)} className={`${iconBtnStyle} p-1 opacity-70 hover:opacity-100`}>
                        <VolumeOff size={14} />
                      </button>
                    </div>

                    <div className={`flex items-center w-14 px-1 py-1 rounded-full border-2 shadow-inner ${theme.input}`}>
                      <Input
                        type="number"
                        value={item.val[0]}
                        onChange={(e) => handleVolumeInputChange(e.target.value, item.setter)}
                        className="w-full h-4 p-0 text-center border-none bg-transparent font-bold text-xs focus:ring-0 appearance-none"
                      />
                      <span className="text-[8px] font-bold opacity-50 pr-1">%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <button onClick={() => adjustVolume(item.val, -1, item.setter)} className={iconBtnStyle}><Volume1 size={18} /></button>
                    <Slider
                      value={item.val}
                      onValueChange={(v) => { item.setter(v); handleValueChange(); }}
                      max={100}
                      step={1}
                      className={`flex-1 ${theme.slider}`}
                    />
                    <button onClick={() => adjustVolume(item.val, 1, item.setter)} className={iconBtnStyle}><Volume2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div className={`p-7 border-t-2 ${theme.border}`}>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`w-full py-4 rounded-xl font-serif font-bold text-lg tracking-widest transition-all active:scale-[0.98] shadow-md
                ${isSaved
                  ? "bg-[#4a4e69] text-[#f2e9e4] opacity-50"
                  : darkMode ? "bg-[#9a8c98] text-[#22223b] hover:bg-[#f2e9e4]" : "bg-[#5d4037] text-[#f4ead5] hover:bg-[#4e342e]"
                }`}
            >
              {isSaved ? "RECORDS SAVED" : "SAVE SETTINGS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}