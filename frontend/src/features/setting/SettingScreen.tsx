// src/features/setting/SettingScreen.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Volume1,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  User as UserIcon,
  Music,
  Speaker,
  Home
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 状態管理 ---
  // 設定を復元するための初期化ロジック
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.user || { id: "Gamer_01", avatarUrl: "", displayName: "Player" };
    }
    return { id: "Gamer_01", avatarUrl: "", displayName: "Player" };
  });

  const [bgmVolume, setBgmVolume] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    return saved ? JSON.parse(saved).bgmVolume || [75] : [75];
  });

  const [seVolume, setSeVolume] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    return saved ? JSON.parse(saved).seVolume || [50] : [50];
  });

  const [isSaved, setIsSaved] = useState(false);

  // トースト管理
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  // --- テーマ定義 (ファンタジー風) ---
  const theme = {
    // forest-bg は index.css で定義済み
    text: "text-[#2d2318]", // 羊皮紙上のテキスト色 (濃い茶色)
    label: "text-[#5d4037]", // ラベル色
    input: "bg-[#e8d9b4]/50 border-[#8d6e63] text-[#3e2723] placeholder:text-[#8d6e63]/50 focus:border-[#d7ccc8]",
    slider: "[&>span:first-child]:bg-[#3e2723]/20 [&_[role=slider]]:bg-[#3e2723] [&_[role=slider]]:border-[#e8d9b4]",
  };

  // --- ハンドラ ---
  const handleValueChange = () => {
    if (isSaved) setIsSaved(false);
  };

  // 保存処理
  const handleSave = () => {
    // 1. 空白チェック
    if (!user.displayName.trim()) {
      setToastType("error");
      setToastMessage("名前を入力してください");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // 2. 永続化 (localStorage)
      const settings = { user, bgmVolume, seVolume };
      localStorage.setItem("app_settings", JSON.stringify(settings));

      // 3. 成功トースト表示
      setToastType("success");
      setToastMessage("設定を保存しました");
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

  // アバター操作
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
    <div className="relative min-h-screen w-full forest-bg overflow-hidden flex flex-col items-center">

      {/* トースト通知 */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-24 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg border-2 backdrop-blur-sm wood-panel ${toastType === "error"
                ? "border-red-800 text-red-200 bg-red-950/80"
                : "border-green-800 text-green-100 bg-green-950/80"
              }`}
          >
            {toastType === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold text-sm tracking-wide font-serif">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 上部バー (木製パネル) --- */}
      <div className="h-20 w-full wood-panel z-30 flex items-center justify-between px-6 border-t-0 border-x-0 relative">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-4 py-2 text-amber-200/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">ホームへ</span>
        </Button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-serif uppercase">
          Settings
        </h1>

        {/* 右側のバランス用ダミー (ホームのコイン表示位置と合わせるなら何か置いてもいいが今回は空白) */}
        <div className="w-24" />
      </div>

      {/* --- メインコンテンツ --- */}
      <div className="flex-1 w-full max-w-2xl px-4 py-8 md:py-12 flex flex-col gap-6 z-10 animate-in fade-in zoom-in duration-500">

        {/* 設定カード (羊皮紙風) */}
        <div className="parchment-realistic w-full relative group">

          {/* 羊皮紙の装飾オーバーレイ */}
          <div className="fibers" aria-hidden />
          <div className="wrinkles" aria-hidden />
          <div className="wave" aria-hidden />
          <div className="ink-bleed one" aria-hidden />
          {/* <div className="ink-bleed two" aria-hidden /> */}
          <div className="corner-wear" aria-hidden />
          <div className="curl" aria-hidden />
          <div className="inner-band" />

          <div className="relative z-20 space-y-10">

            {/* ユーザー設定セクション */}
            <div>
              <h2 className="text-lg font-black tracking-wider text-[#5d4037] mb-6 flex items-center gap-2 border-b border-[#8d6e63]/30 pb-2">
                <UserIcon size={18} className="text-[#8d6e63]" />
                PROFILE IDENTITY
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div
                    className="relative group/avatar cursor-pointer"
                    onClick={handleAvatarClick}
                    onKeyDown={handleAvatarKeyDown}
                    role="button"
                    tabIndex={0}
                  >
                    {/* アバターの枠: 木製風 */}
                    <div className="absolute -inset-1 rounded-full bg-[#3e2723] shadow-lg" />
                    <Avatar className="h-24 w-24 border-4 border-[#8d6e63] shadow-inner relative z-10 bg-[#e8d9b4]">
                      <AvatarImage src={user.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-[#3e2723] text-[#e8d9b4] font-black text-2xl font-serif">
                        {user.displayName?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all bg-black/40 rounded-full">
                      <Camera size={24} className="text-[#e8d9b4] drop-shadow-md" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUser({ ...user, avatarUrl: reader.result as string });
                        handleValueChange();
                      };
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <label className="text-xs font-bold text-[#5d4037] uppercase tracking-wider ml-1">Adventurer Name</label>
                  <Input
                    value={user.displayName}
                    onChange={(e) => {
                      setUser({ ...user, displayName: e.target.value });
                      handleValueChange();
                    }}
                    className={`font-serif font-bold tracking-wide h-12 text-lg rounded-lg shadow-inner ${theme.input} focus-visible:ring-[#8d6e63]`}
                    placeholder="Enter Name"
                  />
                  <p className="text-[10px] text-[#8d6e63] ml-1 font-serif italic">
                    This name will be known throughout the realm.
                  </p>
                </div>
              </div>
            </div>

            {/* オーディオ設定セクション */}
            <div>
              <h2 className="text-lg font-black tracking-wider text-[#5d4037] mb-6 flex items-center gap-2 border-b border-[#8d6e63]/30 pb-2">
                <Music size={18} className="text-[#8d6e63]" />
                AUDIO SETTINGS
              </h2>

              <div className="space-y-8">
                {/* BGM Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-[#5d4037] uppercase tracking-widest">Background Music</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={bgmVolume[0]}
                        onChange={(e) => handleVolumeInputChange(e.target.value, setBgmVolume)}
                        className="w-12 h-6 p-0 text-center border-none bg-transparent font-black text-[#3e2723] font-serif tracking-widest text-lg focus:ring-0 appearance-none"
                      />
                      <span className="text-xs opacity-50 font-bold text-[#5d4037]">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleMute(setBgmVolume)} className="text-[#8d6e63] hover:text-[#3e2723] transition-colors p-2 hover:bg-[#3e2723]/5 rounded-full">
                      <VolumeX size={18} />
                    </button>
                    <Slider
                      value={bgmVolume}
                      onValueChange={(v) => { setBgmVolume(v); handleValueChange(); }}
                      max={100}
                      step={1}
                      className={`flex-1 ${theme.slider}`}
                    />
                    <button onClick={() => adjustVolume(bgmVolume, 10, setBgmVolume)} className="text-[#8d6e63] hover:text-[#3e2723] transition-colors p-2 hover:bg-[#3e2723]/5 rounded-full">
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {/* SE Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-[#5d4037] uppercase tracking-widest">Sound Effects</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={seVolume[0]}
                        onChange={(e) => handleVolumeInputChange(e.target.value, setSeVolume)}
                        className="w-12 h-6 p-0 text-center border-none bg-transparent font-black text-[#3e2723] font-serif tracking-widest text-lg focus:ring-0 appearance-none"
                      />
                      <span className="text-xs opacity-50 font-bold text-[#5d4037]">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleMute(setSeVolume)} className="text-[#8d6e63] hover:text-[#3e2723] transition-colors p-2 hover:bg-[#3e2723]/5 rounded-full">
                      <VolumeX size={18} />
                    </button>
                    <Slider
                      value={seVolume}
                      onValueChange={(v) => { setSeVolume(v); handleValueChange(); }}
                      max={100}
                      step={1}
                      className={`flex-1 ${theme.slider}`}
                    />
                    <button onClick={() => adjustVolume(seVolume, 10, setSeVolume)} className="text-[#8d6e63] hover:text-[#3e2723] transition-colors p-2 hover:bg-[#3e2723]/5 rounded-full">
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 保存ボタンエリア (カードの外) */}
        <div className="pt-2 pb-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full md:w-auto px-12 py-8 rounded-xl font-black text-xl tracking-[0.2em] transition-all shadow-xl font-serif
                ${isSaved
                ? "bg-[#4e342e] text-[#a1887f] cursor-default border-2 border-[#3e2723]"
                : "btn-fantasy-red hover:scale-105"
              }`}
          >
            <div className="flex items-center gap-3">
              {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} />}
              {isSaved ? "SAVED" : "SAVE SETTINGS"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}