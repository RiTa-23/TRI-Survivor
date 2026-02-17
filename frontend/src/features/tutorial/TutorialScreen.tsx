import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const TUTORIAL_PAGES = [
    {
        title: "チュートリアルへようこそ！",
        image: "/assets/images/Trois_3.png",
        description: "ナビゲータマスコットの私と一緒に、このゲームについて\n学びましょう♪",
        hint: "画面をタップして次へ"
    },
    {
        title: "TRI-Survivorとは？",
        image: "/assets/images/Trois_5.png",
        description: "TRI-Survivorは、押し寄せるモンスターを攻撃して、生存を目指すサバイバー系ゲームだよ。",
        hint: "画面をタップして次へ"
    },
    {
        title: "革新的な操作方法",
        image: "/assets/images/Trois_5.png",
        description: "カメラに指をかざしてね！指を向けた方向へキャラクターを操作できるよ。",
        hint: "画面をタップして次へ"
    },
    {
        title: "自動攻撃と必殺技",
        image: "/assets/images/Trois_6.png",
        description: "通常攻撃は自動で行われるよ！特定のジェスチャーによって強力な必殺技を発動することもできるみたい……！？",
        hint: "画面をタップして次へ"
    },
    {
        title: "成長と報酬",
        image: "/assets/images/Trois_5.png",
        description: "経験値を稼いで、レベルアップ！集めたコインは「(トロワの)ショップ」で強化に使用することができるよ。",
        hint: "画面をタップして次へ"
    },
    {
        title: "スコアシステム",
        image: "/assets/images/Trois_5.png",
        description: "「何秒生き残れたか」があなたのスコアとなるよ。\n一秒でも長く生き残ろう!333秒生き残れたらクリアだよ!",
        hint: "画面をタップして次へ"
    },
    {
        title: "勝利の鍵",
        image: "/assets/images/Trois_7.png",
        description: "レベルを上げて、最強の装備を整えたら準備はいいかな？\n最後まで生き残りましょうね!",
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
                
                {/* ナビゲーターキャラクター: トロワ — 少し右下へオフセット */}
                <div className="relative group shrink-0 translate-x-12 translate-y-8 md:translate-x-20 md:translate-y-12">
                    {/* キャラクタースペース */}
                    <div className="relative w-56 h-72 md:w-72 md:h-[450px] flex items-center justify-center">
                        <img 
                            src={TUTORIAL_PAGES[currentPage].image} 
                            alt="Trois" 
                            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-[float-breathing_5s_ease-in-out_infinite] scale-[1.75] origin-bottom translate-y-64 md:translate-y-80"
                        />
                        
                        {/* キャラクター名バッジ — 吹き出しの邪魔にならないよう足元（左側、大幅に下）に配置 */}
                        <div className="absolute -bottom-36 left-0 wood-panel px-6 py-2 rounded-full font-black text-sm text-amber-100 shadow-xl border-2 border-[#2d1b18] z-20">
                            トロワ
                        </div>
                    </div>
                </div>

                {/* 説明文エリア — 実物の羊皮紙に見えるリアルなパネル */}
                <div className="flex-1 w-full max-w-4xl space-y-6 flex flex-col items-center md:items-start">
                    {/* タイトルは吹き出しの外（上部）へ */}
                    <h1 
                        className="text-3xl md:text-5xl font-bold tracking-tight font-serif text-[#2d2318] mb-4 md:pl-4"
                        style={{ textShadow: '1px 1px 0px #d2b88b, 2px 2px 0px #5d4037, 3px 3px 5px rgba(0,0,0,0.3)' }}
                    >
                        {TUTORIAL_PAGES[currentPage].title}
                    </h1>

                    <div className="w-full parchment-realistic p-12 md:p-20 relative">
                        {/* 尻尾は羊皮紙の色味で控えめに */}
                        <div className="hidden md:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[#efe1b8] border-l-2 border-b-2 border-[#d2b88b] rotate-45" />

                        {/* overlays for realistic texture */}
                        <div className="fibers" aria-hidden />
                        <div className="wrinkles" aria-hidden />
                        <div className="wave" aria-hidden />
                        <div className="ink-bleed one" aria-hidden />
                        <div className="ink-bleed two" aria-hidden />
                        <div className="corner-wear" aria-hidden />
                        <div className="curl" aria-hidden />

                        <div className="relative z-20 content">
                            <div className="inner-band" />
                            <p className="text-xl md:text-3xl leading-relaxed font-medium parchment-text whitespace-pre-line">
                                {TUTORIAL_PAGES[currentPage].description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ナビゲーションエリア --- */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-8 pb-4 z-10">
                {/* 左側: 戻る案内 */}
                <div className="w-40 flex justify-start">
                    {!isFirstPage && (
                        <div 
                            className="flex flex-col items-center gap-2 text-amber-300 hover:text-white transition-all px-4 py-2 group/back"
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
                        <div className="flex flex-col items-center gap-2 text-amber-300 hover:text-white transition-all px-4 py-2 pointer-events-auto group/next">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">TAP TO NEXT</span>
                            <ChevronRight className="w-5 h-5 transition-transform group-hover/next:translate-x-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* ヒントメッセージ (画面最下部) */}
            {!isLastPage && (
                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-amber-200 text-xs font-black tracking-[0.4em] uppercase z-10">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/30" />
                    <span>{TUTORIAL_PAGES[currentPage].hint}</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/30" />
                </div>
            )}
        </div>
    );
}
