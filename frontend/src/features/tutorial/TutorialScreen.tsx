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
            className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 md:p-8 cursor-pointer overflow-hidden relative"
            onClick={handleNext}
        >
            {/* バックグラウンド効果 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-slate-900 to-[#020617] z-0" />

            {/* ホームに戻るボタン (左上に移動) */}
            <div className="absolute top-6 left-6 z-30">
                <Button 
                    variant="ghost"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl glass-morphism border-slate-700/30 transition-all font-bold"
                    onClick={() => navigate("/home")}
                >
                    <Home className="w-5 h-5" />
                    <span>ホームへ</span>
                </Button>
            </div>

            <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-12">
                
                {/* ページ番号表示 (上部に配置) */}
                <div className="flex gap-2">
                    {TUTORIAL_PAGES.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1.5 w-12 rounded-full transition-colors ${
                                index === currentPage ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-800"
                            }`}
                        />
                    ))}
                </div>

                {/* メインレイアウト: キャラクターと説明文 (中央寄せに修正) */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full py-4">
                    
                    {/* ナビゲーターキャラクター: トロワ (プレースホルダー) */}
                    <div className="relative group shrink-0">
                        {/* 背後の光輪エフェクト */}
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                        
                        {/* キャラクター画像配置用エリア */}
                        <div className="relative w-64 h-80 md:w-80 md:h-[450px] glass-morphism rounded-3xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center text-slate-500 transition-all hover:border-indigo-500/50">
                            <div className="text-center space-y-2">
                                <span className="text-2xl font-black tracking-widest block">trois</span>
                                <span className="text-xs font-bold uppercase tracking-tighter opacity-50">Image Placeholder</span>
                            </div>
                            
                            {/* キャラクター名バッジ */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 px-6 py-2 rounded-full font-black text-sm shadow-xl">
                                トロワ
                            </div>
                        </div>
                    </div>

                    {/* 説明文エリア (吹き出し/パネル風) */}
                    <div className="flex-1 w-full max-w-2xl space-y-8 glass-morphism p-8 md:p-12 rounded-[2.5rem] border-slate-700/30 relative">
                        {/* 吹き出しの尻尾 (左側、デスクトップ用: 中央に配置) */}
                        <div className="hidden md:block absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 glass-morphism border-r-0 border-t-0 rotate-45 border-slate-700/30" />
                        
                        <div className="space-y-6">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                                {TUTORIAL_PAGES[currentPage].title}
                            </h1>
                            <p className="text-lg md:text-2xl text-slate-400 leading-relaxed font-medium">
                                {TUTORIAL_PAGES[currentPage].description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ナビゲーションエリア: 左右に案内を配置 */}
                <div className="flex items-center justify-between w-full max-w-4xl px-8">
                    {/* 左側: 戻る案内 */}
                    <div className="w-40 flex justify-start">
                        {!isFirstPage && (
                            <div 
                                className="flex flex-col items-center gap-3 text-indigo-400/80 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all px-4 py-2 group/back"
                                onClick={handleBack}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] group-hover/back:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">TAP TO BACK</span>
                                <ChevronLeft className="w-6 h-6 transition-transform group-hover/back:-translate-x-1" />
                            </div>
                        )}
                    </div>

                    {/* 右側: 次へ案内 (最終ページ以外) */}
                    <div className="w-40 flex justify-end">
                        {!isLastPage && (
                            <div className="flex flex-col items-center gap-3 text-indigo-400 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all px-4 py-2 pointer-events-auto group/next">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] group-hover/next:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">TAP TO NEXT</span>
                                <ChevronRight className="w-6 h-6 transition-transform group-hover/next:translate-x-1" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ヒントメッセージ (画面最下部: 視認性を向上し、動的な光を復活) */}
            {!isLastPage && (
                <div className="absolute bottom-10 md:bottom-12 flex items-center gap-4 text-indigo-400 text-sm font-black tracking-[0.4em] uppercase animate-pulse">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500/50" />
                    <span className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">
                        {TUTORIAL_PAGES[currentPage].hint}
                    </span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500/50" />
                </div>
            )}
        </div>
    );
}
