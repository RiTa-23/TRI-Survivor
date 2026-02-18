// src/features/shop/ShopScreen.tsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Axe,
  BicepsFlexed,
  Coins as CoinIcon,
  Home,
  LockKeyhole,
  LockKeyholeOpen,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
const troisImage = "/assets/images/Trois(SD1).png";
const placeholderImg = "/assets/images/box_black_1.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// -----------------------------
// 型定義 (ShopItem Interface)
// -----------------------------
interface ShopItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: "weapon" | "status";
}

// -----------------------------
// 商品カードコンポーネント (RPGテーマ)
// -----------------------------
interface ShopItemCardProps extends ShopItem {
  onHover: (item: ShopItem | null) => void;
}

function ShopItemCard({
  id,
  name,
  price,
  image,
  description,
  category,
  onHover,
}: ShopItemCardProps) {
  const { coins, addCoins } = useGameStore();
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    if (coins >= price) {
      addCoins(-price);
      setPurchased(true);
    }
  };

  const item: ShopItem = { id, name, price, image, description, category };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      className={`
        w-[160px] h-[240px]
        flex flex-col
        rounded-xl relative
        border-2 border-[#8d6e63]/30
        bg-[#e8d9b4]/20 backdrop-blur-sm
        hover:border-amber-500/50 hover:bg-[#e8d9b4]/40
        transition-all duration-300
        overflow-hidden
        ${purchased ? "opacity-80 grayscale-[0.5]" : ""}
      `}
    >
      <div className="bg-[#3e2723]/10 py-2 border-b border-[#8d6e63]/20">
        <h3 className="text-xs font-black text-center text-[#5d4037] truncate px-2 font-serif uppercase tracking-wider">
          {name}
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImg;
          }}
        />
      </div>

      <div className="p-3 bg-[#3e2723]/5 space-y-2">
        <div className="flex items-center justify-center gap-1.5">
          <CoinIcon size={14} className="text-yellow-600" />
          <span className={`text-sm font-black font-mono tracking-tighter ${coins < price && !purchased ? "text-red-700" : "text-[#5d4037]"}`}>
            {price.toLocaleString()}
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className={`
                w-full h-9 text-[10px] font-black tracking-widest uppercase
                transition-all border-b-4
                ${purchased
                  ? "bg-[#5d4037]/20 text-[#5d4037]/50 border-transparent cursor-default shadow-none"
                  : coins < price
                    ? "bg-[#3e2723]/10 text-[#3e2723]/40 border-[#3e2723]/20 shadow-none cursor-not-allowed"
                    : "btn-fantasy-red border-red-900 active:border-b-0 active:translate-y-1"
                }
              `}
              disabled={purchased || coins < price}
            >
              {purchased ? (
                <span className="flex items-center gap-1.5"><LockKeyholeOpen size={12} /> 購入済み</span>
              ) : coins < price ? (
                <span className="flex items-center gap-1.5"><LockKeyhole size={12} /> コイン不足</span>
              ) : (
                <span className="flex items-center gap-1.5"><LockKeyhole size={12} /> 購入する</span>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-[#e8d9b4] border-4 border-[#3e2723] rounded-2xl font-serif">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-[#3e2723] tracking-wider uppercase">購入しますか？</AlertDialogTitle>
              <AlertDialogDescription className="text-[#5d4037] text-lg font-medium leading-relaxed">
                <span className="font-black underline">{name}</span> を <span className="font-black text-red-800">{price} コイン</span> で購入します。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4">
              <AlertDialogCancel className="bg-transparent border-2 border-[#8d6e63] text-[#5d4037] hover:bg-[#3e2723]/10 font-bold px-6">いいえ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#3e2723] text-amber-100 hover:bg-[#2d1b18] font-black px-8 shadow-lg active:translate-y-1 transition-all"
                onClick={handlePurchase}
              >
                はい
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

// -----------------------------
// ショップ画面
// -----------------------------
const WEAPON_ITEMS: ShopItem[] = [
  { id: "w2", name: "盾", price: 150, image: "/images/item-normal.png", description: "受けるダメージを軽減し、さらに自動でHPが少しずつ回復する。", category: "weapon" },
  { id: "w4", name: "アックス", price: 250, image: "/images/item-ultra.png", description: "自分の周りを高速で回転し続け、接近する敵をなぎ倒す。", category: "weapon" },
  { id: "w3", name: "弓", price: 300, image: "/images/item-epic.png", description: "遠距離から敵を自動で射抜く。安全な距離を保って攻撃可能。", category: "weapon" },
  { id: "w5", name: "魔導書", price: 400, image: "/images/item-rod.png", description: "進行方向に向かって、すべてを貫通する強力なビームを放つ。", category: "weapon" },
  { id: "w1", name: "魔剣", price: 500, image: "/images/item-legend.png", description: "近距離のオート攻撃に加え、攻撃方向に強力な斬撃を放つ。", category: "weapon" },
  { id: "w6", name: "魔法陣", price: 600, image: "/images/item-circle.png", description: "周囲に強力な魔法陣を展開し、範囲内の敵に絶大なダメージを与える。", category: "weapon" },
];

const STATUS_ITEMS: ShopItem[] = [
  { id: "s4", name: "スピードアップ", price: 120, image: "/images/status-speed.png", description: "移動速度と攻撃速度が上昇。", category: "status" },
  { id: "s3", name: "防御力アップ", price: 150, image: "/images/status-def.png", description: "防御力が上昇。受けるダメージを軽減。", category: "status" },
  { id: "s2", name: "攻撃力アップ", price: 180, image: "/images/status-atk.png", description: "攻撃力が上昇。物理攻撃が強くなる。", category: "status" },
  { id: "s1", name: "HPアップ", price: 200, image: "/images/status-hp.png", description: "最大HPが上昇する。耐久力が大幅にアップ。", category: "status" },
];

export default function ShopScreen() {
  const navigate = useNavigate();
  const { coins } = useGameStore();
  const [hoverItem, setHoverItem] = useState<ShopItem | null>(null);

  return (
    <div className="relative min-h-screen w-full forest-bg overflow-hidden flex flex-col items-center">

      {/* --- 上部バー (木製パネル) --- */}
      <div className="h-20 w-full wood-panel z-30 flex items-center justify-between px-6 border-t-0 border-x-0 relative shadow-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-4 py-2 text-amber-200/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold group"
        >
          <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-sm font-serif uppercase tracking-widest leading-none">ホームへ</span>
        </Button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif uppercase">
          トロワ SHOP
        </h1>

        <div className="flex items-center gap-4 bg-black/40 px-5 py-2 rounded-full border-2 border-amber-900/40 shadow-inner">
          <CoinIcon className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          <span className="text-lg font-mono font-black tracking-widest text-yellow-100">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* --- メインコンテンツ --- */}
      <div className="flex-1 w-full max-w-6xl px-4 pt-2 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 z-10 animate-in fade-in slide-in-from-bottom-5 duration-700 overflow-hidden">

        {/* 左側: 商品リストエリア */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="weapon" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-[#3e2723]/30 p-1 rounded-2xl border border-[#8d6e63]/20 backdrop-blur-md">
                <TabsTrigger
                  value="weapon"
                  className="px-8 py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all data-[state=active]:bg-[#e8d9b4] data-[state=active]:text-[#3e2723] data-[state=active]:shadow-lg flex items-center gap-2"
                >
                  <Axe size={16} /> 武器
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="px-8 py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all data-[state=active]:bg-[#e8d9b4] data-[state=active]:text-[#3e2723] data-[state=active]:shadow-lg flex items-center gap-2"
                >
                  <BicepsFlexed size={16} /> ステータス
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(100vh-180px)] max-h-[640px] min-h-[380px] w-full parchment-realistic pl-4 pr-2 lg:pl-[400px] lg:pr-4 rounded-3xl relative">
              {/* Parchment decorative elements */}
              <div className="fibers" aria-hidden />
              <div className="wrinkles" aria-hidden />
              <div className="wave" aria-hidden />
              <div className="ink-bleed one" aria-hidden />
              <div className="corner-wear" aria-hidden />
              <div className="inner-band" />

              <TabsContent value="weapon" className="m-0 focus-visible:outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-10">
                  {WEAPON_ITEMS.map((item) => (
                    <ShopItemCard key={item.id} {...item} onHover={setHoverItem} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="status" className="m-0 focus-visible:outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-10">
                  {STATUS_ITEMS.map((item) => (
                    <ShopItemCard key={item.id} {...item} onHover={setHoverItem} />
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* 右側: 詳細・キャラクターエリア */}
        <div className="flex flex-col gap-6">
          {/* 詳細パネル (羊皮紙) / 常に吹き出しとして表示 */}
          <div className="parchment-realistic p-6 h-[160px] flex flex-col items-center justify-center relative group shadow-xl">
            {/* 吹き出しの尻尾 (挨拶時のみ表示) */}
            {!hoverItem && (
              <div className="absolute -bottom-3 right-20 w-6 h-6 bg-[#f0deb2] rotate-45 border-r border-b border-[#8d6e63]/30 z-0 shadow-lg" />
            )}

            <div className="inner-band" />
            <div className="fibers opacity-40" />

            <AnimatePresence mode="wait">
              {hoverItem ? (
                <motion.div
                  key={hoverItem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full relative z-10"
                >
                  <h3 className="text-[10px] font-black text-[#5d4037] border-b border-[#8d6e63]/30 pb-1.5 mb-3 flex items-center gap-2 uppercase tracking-tighter leading-none">
                    <Info size={14} className="text-[#8d6e63]" /> アイテム詳細
                  </h3>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-[#3e2723] font-serif leading-tight">
                      {hoverItem.name}
                    </div>
                    <div className="text-[#5d4037] text-xs leading-relaxed font-serif italic">
                      {hoverItem.description}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-2 relative z-10"
                >
                  <p className="text-sm font-black text-[#3e2723] font-serif leading-relaxed tracking-wider">
                    「アン・ドゥ・トロワ♪<br />トロワのショップにようこそ！」
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* キャラクタープレビュー */}
          <div className="flex-1 bg-[#1b110e]/40 backdrop-blur-md rounded-3xl border-2 border-amber-900/30 relative flex flex-col items-center justify-end p-0 overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />

            {/* 装飾光エフェクト */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full group-hover:bg-amber-500/15 transition-all duration-1000" />

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              <img
                src={troisImage}
                alt="character"
                className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] scale-125 origin-bottom translate-y-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/images/player.png";
                }}
              />
              <div className="mt-4 wood-panel px-6 py-2 rounded-xl text-amber-100 text-[10px] font-black tracking-[0.3em] uppercase border-2 border-[#3e2723] shadow-lg leading-none">
                トロワ
              </div>
            </motion.div>

            {/* 足元の影 */}
            <div className="absolute bottom-12 w-32 h-6 bg-black/50 blur-xl rounded-full scale-x-150 z-0" />
          </div>
        </div>
      </div>
    </div>
  );
}