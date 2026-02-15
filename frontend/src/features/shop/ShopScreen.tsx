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
  LockKeyhole,
  LockKeyholeOpen,
  ArrowLeft,
  Axe,
  BicepsFlexed
} from "lucide-react"

import { useState } from "react"

// -----------------------------
// 型定義 (Item Type)
// -----------------------------
interface ShopItem {
  name: string;
  price: number;
  image: string;
  description: string;
}

// -----------------------------
// 商品カードコンポーネント
// -----------------------------
interface ShopItemCardProps extends ShopItem {
  coins: number;
  onHover: (item: ShopItem | null) => void;
}

export function ShopItemCard({
  name,
  price,
  image,
  description,
  coins,
  onHover,
}: ShopItemCardProps) {
  const [purchased, setPurchased] = useState(false)

  const handlePurchase = () => {
    setPurchased(true)
  }

  // 自身をオブジェクトとして渡すためのヘルパー
  const currentItem: ShopItem = { name, price, image, description };

  return (
    <Card
      onMouseEnter={() => onHover(currentItem)}
      onMouseLeave={() => onHover(null)}
      className={`
        w-[180px] h-[250px]
        flex flex-col justify-between
        rounded-xl cursor-pointer
        border border-yellow-500/70
        shadow-none
        hover:shadow-[0_0_28px_rgba(255,215,0,0.8)]
        transition-all
        ${purchased ? "bg-gray-200" : "bg-white"}
      `}
    >
      <CardHeader className="text-center py-1">
        <CardTitle className="text-sm font-bold text-black">
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center items-center h-[70px] pt-1">
        <img
          src={image}
          alt={name}
          className="w-14 h-14 object-contain"
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-1 pb-2 px-2">
        <div className="text-center text-sm font-bold flex items-center justify-center gap-1 text-yellow-300">
          <span className="text-yellow-200 text-lg">🪙</span>
          <span className={price > coins && !purchased ? "text-red-500" : ""}>{price}</span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="
                w-full text-xs py-2 flex items-center justify-center gap-2 font-bold
                bg-black/70 text-white
                border border-yellow-500/60
                hover:bg-black
                transition-all
                disabled:opacity-50
              "
              disabled={purchased || price > coins}
            >
              {purchased ? (
                <><LockKeyholeOpen size={14} />購入済み</>
              ) : price > coins ? (
                <><LockKeyhole size={14} />コイン不足</>
              ) : (
                <><LockKeyhole size={14} />購入する</>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-white text-black border border-yellow-500">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-yellow-600 font-bold">購入しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                {name} を {price} コインで購入します。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white">いいえ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-white border border-yellow-500 text-yellow-600 font-bold hover:bg-yellow-50"
                onClick={handlePurchase}
              >
                はい
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

// -----------------------------
// ショップ画面
// -----------------------------
export default function ShopScreen() {
  const navigate = useNavigate();

  // State の型定義
  const [hoverItem, setHoverItem] = useState<ShopItem | null>(null)
  const [coins] = useState(200)

  // アイテムリストの型定義
  const weaponItems: ShopItem[] = [
    { name: "レジェンドソード", price: 500, image: "/images/item-legend.png", description: "古代の英雄が使ったとされる伝説の剣。攻撃力 +50。" },
    { name: "エピックボウ", price: 300, image: "/images/item-epic.png", description: "遠距離攻撃に優れた弓。クリティカル率が上昇する。" },
    { name: "レアダガー", price: 150, image: "/images/item-rare.png", description: "素早い攻撃が可能な短剣。スピード +10。" },
    { name: "ノーマルシールド", price: 80, image: "/images/item-normal.png", description: "基本的な盾。防御力を少し上げる。" },
    { name: "ウルトラランス", price: 600, image: "/images/item-ultra.png", description: "強力な突き攻撃が可能な槍。攻撃力 +40。" },
    { name: "マジックロッド", price: 250, image: "/images/item-rod.png", description: "魔法攻撃力を上げる杖。MP 回復速度が上昇。" },
    { name: "ファイアソード", price: 400, image: "/images/item-fire.png", description: "炎の力を宿した剣。追加で火属性ダメージを与える。" },
    { name: "アイスボウ", price: 350, image: "/images/item-ice.png", description: "氷の矢を放つ弓。敵の動きを遅くする効果あり。" },
  ].sort((a, b) => a.price - b.price)

  const statusItems: ShopItem[] = [
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

      {/* 所持コイン枠：アイコンは残し、数値だけ消去 */}
      <div className="absolute top-7 right-7 bg-white border border-yellow-500 rounded-lg px-4 py-2 flex items-center gap-2 min-w-[60px] justify-center h-[46px]">
        <span className="text-yellow-500 text-xl">🪙</span>
        {/* <span className="font-bold text-black text-lg">{coins}</span> */}
      </div>

      {/* 詳細パネル */}
      <div className="absolute top-44 left-12 w-64 bg-white text-black border border-black rounded-lg p-4">
        {hoverItem ? (
          <>
            <div className="font-bold text-yellow-600 mb-2">{hoverItem.name}</div>
            <div className="text-sm">{hoverItem.description}</div>
          </>
        ) : (
          <div className="text-sm text-gray-500 text-center">なに買うの～？</div>
        )}
      </div>

      {/* キャラ画像 */}
      <img
        src="/images/character.png"
        alt="character"
        className="absolute bottom-40 left-[8.75rem] w-48"
      />

      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 p-2 rounded-lg border border-black/40 bg-black/10 hover:bg-black/20 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-3xl font-bold mb-6 text-yellow-600">Shop</h1>

      <div className="w-full flex justify-end">
        <Tabs defaultValue="weapon" className="max-w-4xl w-full">
          <TabsList className="flex justify-end w-full pr-6 mb-4 bg-black/10 rounded-full p-1">
            <TabsTrigger value="weapon" className="px-6 py-2 rounded-full data-[state=active]:bg-green-300/30 data-[state=active]:text-green-700">
              <Axe size={18} /> 武器
            </TabsTrigger>
            <TabsTrigger value="status" className="px-6 py-2 rounded-full data-[state=active]:bg-green-300/30 data-[state=active]:text-green-700">
              <BicepsFlexed size={18} /> ステータス
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weapon">
            <ScrollArea className="h-[360px] w-full rounded-md border border-black/20 bg-black/5 p-4">
              <div className="flex flex-row flex-wrap justify-center gap-5 mt-6">
                {weaponItems.map((item) => (
                  <ShopItemCard key={item.name} {...item} coins={coins} onHover={setHoverItem} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="status">
            <ScrollArea className="h-[360px] w-full rounded-md border border-black/20 bg-black/5 p-4">
              <div className="flex flex-row flex-wrap justify-center gap-5 mt-6">
                {statusItems.map((item) => (
                  <ShopItemCard key={item.name} {...item} coins={coins} onHover={setHoverItem} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}