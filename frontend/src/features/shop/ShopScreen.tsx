// src/features/shop/ShopScreen.tsx

import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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
} from "@/components/ui/alert-dialog"

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

import {
  LockKeyhole,
  LockKeyholeOpen,
  ArrowLeft,
  Axe,
  BicepsFlexed
} from "lucide-react"

import { useState } from "react"

// -----------------------------
// 商品カードコンポーネント
// -----------------------------
export function ShopItemCard({
  name,
  price,
  image,
  description,
}: {
  name: string;
  price: number;
  image: string;
  description: string;
}) {
  const [purchased, setPurchased] = useState(false)
  const [open, setOpen] = useState(false)

  const closeHover = () => setOpen(false)

  const handlePurchase = () => {
    setPurchased(true)
    closeHover()
  }

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={50} closeDelay={100}>
      <HoverCardTrigger
        asChild
        tabIndex={-1}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={closeHover}
      >
        <Card
          className={`
            w-[180px] h-[250px]
            flex flex-col justify-between
            rounded-xl cursor-pointer
            border border-yellow-500/70
            shadow-[0_0_20px_rgba(255,215,0,0.4)]
            hover:shadow-[0_0_28px_rgba(255,215,0,0.8)]
            transition-all

            ${purchased ? "bg-black/40" : "bg-slate-900/90"}
          `}
        >
          <CardHeader className="text-center py-1">
            <CardTitle className="text-sm font-bold text-yellow-400 drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">
              {name}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center items-center h-[70px] pt-1">
            <img
              src={image}
              alt={name}
              className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-1 pb-2 px-2">
            <div className="text-center text-sm font-bold flex items-center justify-center gap-1 text-yellow-300 drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">
              <span className="text-yellow-200 text-lg drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">🪙</span>
              {price}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="
                    w-full text-xs py-2 flex items-center justify-center gap-2 font-bold
                    bg-black/70 text-yellow-300
                    border border-yellow-500/60
                    hover:bg-black
                    drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]
                    transition-all
                  "
                  disabled={purchased}
                  onClick={closeHover}
                >
                  {purchased ? (
                    <>
                      <LockKeyholeOpen size={14} />
                      購入済み
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={14} />
                      購入する
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-slate-900 text-white border border-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.7)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-yellow-300 drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">
                    購入しますか？
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {name} を {price} コインで購入します。
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogAction
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    onClick={handlePurchase}
                  >
                    はい
                  </AlertDialogAction>
                  <AlertDialogCancel
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                    onClick={closeHover}
                  >
                    いいえ
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent
        side="top"
        sideOffset={10}
        className="
          w-64 text-sm
          bg-slate-900/95 text-white
          border border-yellow-500
          shadow-[0_0_20px_rgba(255,215,0,0.7)]
          rounded-lg p-4
        "
      >
        <div className="font-bold mb-1 text-yellow-300 drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">
          {name}
        </div>
        <div>{description}</div>
      </HoverCardContent>
    </HoverCard>
  );
}

// -----------------------------
// ショップ画面
// -----------------------------
export default function ShopScreen() {
  const navigate = useNavigate();

  const weaponItems = [
    { name: "レジェンドソード", price: 500, image: "/images/item-legend.png", description: "古代の英雄が使ったとされる伝説の剣。攻撃力 +50。" },
    { name: "エピックボウ", price: 300, image: "/images/item-epic.png", description: "遠距離攻撃に優れた弓。クリティカル率が上昇する。" },
    { name: "レアダガー", price: 150, image: "/images/item-rare.png", description: "素早い攻撃が可能な短剣。スピード +10。" },
    { name: "ノーマルシールド", price: 80, image: "/images/item-normal.png", description: "基本的な盾。防御力を少し上げる。" },
    { name: "ウルトラランス", price: 600, image: "/images/item-ultra.png", description: "強力な突き攻撃が可能な槍。攻撃力 +40。" },
    { name: "マジックロッド", price: 250, image: "/images/item-rod.png", description: "魔法攻撃力を上げる杖。MP 回復速度が上昇。" },
    { name: "ファイアソード", price: 400, image: "/images/item-fire.png", description: "炎の力を宿した剣。追加で火属性ダメージを与える。" },
    { name: "アイスボウ", price: 350, image: "/images/item-ice.png", description: "氷の矢を放つ弓。敵の動きを遅くする効果あり。" },
  ].sort((a, b) => a.price - b.price)

  const statusItems = [
    { name: "HPアップ", price: 200, image: "/images/status-hp.png", description: "最大HPが上昇する。耐久力が大幅にアップ。" },
    { name: "攻撃力アップ", price: 180, image: "/images/status-atk.png", description: "攻撃力が上昇。物理攻撃が強くなる。" },
    { name: "防御力アップ", price: 150, image: "/images/status-def.png", description: "防御力が上昇。受けるダメージを軽減。" },
    { name: "スピードアップ", price: 120, image: "/images/status-speed.png", description: "移動速度と攻撃速度が上昇。" },
    { name: "クリティカル率アップ", price: 220, image: "/images/status-crit.png", description: "クリティカル発生率が上昇。大ダメージを狙える。" },
    { name: "回避率アップ", price: 160, image: "/images/status-dodge.png", description: "敵の攻撃を回避しやすくなる。" },
    { name: "魔法耐性アップ", price: 190, image: "/images/status-magic.png", description: "魔法攻撃に対する耐性が上昇。" },
    { name: "スタミナアップ", price: 140, image: "/images/status-stamina.png", description: "スタミナが増加し、長時間戦えるようになる。" },
  ].sort((a, b) => a.price - b.price)

  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col items-center p-6">
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-black/40 bg-black/10 hover:bg-black/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-3xl font-bold mb-6 text-yellow-600 drop-shadow-[0_0_6px_rgba(255,255,200,0.9)]">
        Shop
      </h1>

      <Tabs defaultValue="weapon" className="w-full max-w-4xl">
        <TabsList className="flex justify-center mb-4 bg-black/10 rounded-full p-1">
          <TabsTrigger
            value="weapon"
            className="
              px-6 py-2 text-sm md:text-base flex items-center gap-2 rounded-full
              data-[state=active]:bg-green-300/30
              data-[state=active]:text-green-700
              data-[state=active]:shadow-[0_0_10px_rgba(74,222,128,0.7)]
            "
          >
            <Axe size={18} /> 武器
          </TabsTrigger>

          <TabsTrigger
            value="status"
            className="
              px-6 py-2 text-sm md:text-base flex items-center gap-2 rounded-full
              data-[state=active]:bg-green-300/30
              data-[state=active]:text-green-700
              data-[state=active]:shadow-[0_0_10px_rgba(74,222,128,0.7)]
            "
          >
            <BicepsFlexed size={18} /> ステータス
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weapon">
          <ScrollArea className="h-[360px] w-full rounded-md border border-black/20 bg-black/5 p-4">
            <div className="flex flex-row flex-wrap justify-center gap-5">
              {weaponItems.map((item) => (
                <ShopItemCard key={item.name} {...item} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="status">
          <ScrollArea className="h-[360px] w-full rounded-md border border-black/20 bg-black/5 p-4">
            <div className="flex flex-row flex-wrap justify-center gap-5">
              {statusItems.map((item) => (
                <ShopItemCard key={item.name} {...item} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}