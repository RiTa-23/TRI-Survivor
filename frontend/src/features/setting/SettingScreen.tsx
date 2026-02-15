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

  // 修正：アラートを削除
  const handleSave = () => {
    console.log("Settings saved for:", user.id);
    // 今後、ここにサーバーへの保存処理などを追加します
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8 relative">
      
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-black/40 bg-black/10 hover:bg-black/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-4xl font-bold mb-10 text-yellow-600">
        Setting
      </h1>
      
      <div className="w-full max-w-md space-y-10">
        
        {/* プロフィール設定エリア */}
        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-yellow-500 shadow-sm">
            <AvatarImage
              src={user.avatarUrl || undefined} 
              alt={user.id}
            />
            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xl">
              {user.id.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="input-id" className="text-sm font-bold text-slate-600">
                User ID
              </label>
              <Input 
                id="input-id" 
                type="text" 
                value={user.id} 
                onChange={(e) => setUser({ ...user, id: e.target.value })}
                className="bg-white border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 text-black font-medium"
              />
            </div>
          </div>
        </div>

        {/* ボリューム設定エリア */}
        <div className="space-y-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">BGM Volume</span>
              <span className="text-sm font-mono font-bold text-yellow-600">{bgmVolume}%</span>
            </div>
            <Slider
              value={bgmVolume}
              onValueChange={setBgmVolume}
              max={100}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">SE Volume</span>
              <span className="text-sm font-mono font-bold text-yellow-600">{seVolume}%</span>
            </div>
            <Slider
              value={seVolume}
              onValueChange={setSeVolume}
              max={100}
              step={1}
              className="py-2"
            />
          </div>
        </div>

        {/* 保存ボタン：テキストは「保存する」のみ、アラートや遷移は無し */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md"
        >
          保存する
        </button>
      </div>
    </div>
  );
}