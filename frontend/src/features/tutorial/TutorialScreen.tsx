import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const TUTORIAL_PAGES = [
    {
        title: "TRI-Survivorへようこそ",
        description: "このゲームは、押し寄せる幾何学的な敵から生き残るサバイバルゲームです。",
        hint: "画面をタップして次へ"
    },
    {
        title: "革新的な操作方法",
        description: "カメラに指をかざしてください。指で刺している方向にキャラクターが自在に移動します。",
        hint: "画面をタップして次へ"
    },
    {
        title: "自動攻撃と必殺技",
        description: "通常攻撃は自動で行われますが、特定のジェスチャーを繰り出すことで強力な「必殺技」を発動できます。",
        hint: "画面をタップして次へ"
    },
    {
        title: "成長と報酬",
        description: "敵を倒して経験値を稼ぎ、レベルアップで強くなりましょう。集めたコインはショップでの強化に使えます。",
        hint: "画面をタップして次へ"
    },
    {
        title: "スコアシステム",
        description: "幾何学の混沌の中で「何秒生き残れたか」があなたのスコアとなります。一秒でも長く生存しましょう。",
        hint: "画面をタップして次へ"
    },
    {
        title: "勝利の鍵",
        description: "レベルを上げ、最強の装備を整えて、世界の記録を塗り替えましょう。準備はいいですか？",
        hint: ""
    }
];

export default function TutorialScreen() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === TUTORIAL_PAGES.length - 1;

    const handleNext = () => {
        if (!isLastPage) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleBack = (e: React.MouseEvent) => {
        e.stopPropagation(); // 画面全体のクリックイベントを発火させない
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div 
            className="min-h-screen forest-bg text-white flex flex-col cursor-pointer overflow-hidden relative"
            onClick={handleNext}
        >
            {/* --- 上部バー (木製パネル) --- */}
            <div className="h-16 w-full wood-panel z-30 flex items-center justify-between px-6 border-t-0 border-x-0">
                {/* ホームに戻るボタン */}
                <Button 
                    variant="ghost"
                    className="flex items-center gap-2 px-4 py-2 text-amber-200/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate("/home");
                    }}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-sm">ホームへ</span>
                </Button>

                {/* ページ進捗インジケーター */}
                <div className="flex gap-2">
                    {TUTORIAL_PAGES.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1.5 w-8 md:w-12 rounded-full transition-colors ${
                                index === currentPage ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-[#1b110e]"
                            }`}
                        />
                    ))}
                </div>

                {/* スペーサー */}
                <div className="w-24" />
            </div>

            {/* --- メインコンテンツ --- */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 md:px-16 py-8 relative z-10">
                
                {/* ナビゲーターキャラクター: トロワ */}
                <div className="relative group shrink-0">
                    {/* 背後の光輪エフェクト */}
                    <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full" />
                    
                    {/* キャラクター画像配置用エリア */}
                    <div className="relative w-48 h-64 md:w-64 md:h-[360px] rounded-3xl border-2 border-dashed border-amber-900/30 bg-white/5 backdrop-blur-[2px] flex flex-col items-center justify-center text-amber-200/30 transition-all hover:border-amber-400/50">
                        <div className="text-center space-y-2">
                            <span className="text-2xl font-black tracking-widest block">trois</span>
                            <span className="text-xs font-bold uppercase tracking-tighter opacity-50">Image Placeholder</span>
                        </div>
                        
                            {/* キャラクター名バッジ */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 wood-panel px-6 py-2 rounded-full font-black text-sm text-amber-100 shadow-xl border-2 border-[#2d1b18]">
                                トロワ
                            </div>
                    </div>
                    
                        {/* decorative ornament removed per request */}
                </div>

                {/* 説明文エリア — 羊皮紙風の装飾パネル */}
                <div className="flex-1 w-full max-w-2xl space-y-8 parchment-panel p-8 md:p-12 rounded-[2rem] relative">
                    {/* 尻尾はデザイン的に小さめの羊皮紙色 */}
                    <div className="hidden md:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[#f3e7c2] border-l-4 border-b-4 border-[#d5b48b] rotate-45" />

                    <div className="space-y-6 relative z-10">
                        <div className="inner-band" />
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight parchment-title leading-tight parchment-text">
                            {TUTORIAL_PAGES[currentPage].title}
                        </h1>
                        <p className="text-base md:text-xl leading-relaxed font-medium parchment-text">
                            {TUTORIAL_PAGES[currentPage].description}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- ナビゲーションエリア --- */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-8 pb-4 z-10">
                {/* 左側: 戻る案内 */}
                <div className="w-40 flex justify-start">
                    {!isFirstPage && (
                        <div 
                            className="flex flex-col items-center gap-2 text-amber-200/50 hover:text-white transition-all px-4 py-2 group/back"
                            onClick={handleBack}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">TAP TO BACK</span>
                            <ChevronLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-1" />
                        </div>
                    )}
                </div>

                {/* 右側: 次へ案内 */}
                <div className="w-40 flex justify-end">
                    {!isLastPage && (
                        <div className="flex flex-col items-center gap-2 text-amber-200/50 hover:text-white transition-all px-4 py-2 pointer-events-auto group/next">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">TAP TO NEXT</span>
                            <ChevronRight className="w-5 h-5 transition-transform group-hover/next:translate-x-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* ヒントメッセージ (画面最下部) */}
            {!isLastPage && (
                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-amber-300/60 text-xs font-black tracking-[0.4em] uppercase z-10">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/30" />
                    <span>{TUTORIAL_PAGES[currentPage].hint}</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/30" />
                </div>
            )}
        </div>
    );
}
