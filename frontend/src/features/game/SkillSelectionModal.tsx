import React from "react";
import { type SkillOption, SkillType } from "../../game/types";

interface Props {
    options: SkillOption[];
    onSelect: (type: SkillType) => void;
    selectedIndex?: number | null;
}

export const SkillSelectionModal: React.FC<Props> = ({ options, onSelect, selectedIndex }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex w-full max-w-5xl flex-col items-center gap-8 p-4">
                <h2 className="text-5xl font-bold text-yellow-400 drop-shadow-lg animate-pulse">
                    LEVEL UP!
                </h2>

                <div className="text-white text-center mb-4 bg-slate-800/80 p-4 rounded-xl border border-slate-600 animate-pulse">
                    <p className="text-xl font-bold text-yellow-300 mb-2">ジェスチャー操作で選択</p>
                    <div className="flex gap-8 justify-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-700 px-2 py-1 rounded">👈 👉</span>
                            <span>指を左右に動かして選択</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-700 px-2 py-1 rounded">👆</span>
                            <span>指を上に向けて確定</span>
                        </div>
                    </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                    {options.map((option, index) => (
                        <div
                            key={option.type}
                            className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-xl border-2 bg-slate-800/90 p-6 text-white transition-all 
                            ${selectedIndex === index
                                    ? "border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] scale-105 bg-slate-700"
                                    : "border-slate-600 opacity-70"
                                }`}
                        >
                            {/* Card Header & Icon */}
                            <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 shadow-inner">
                                <img
                                    src={option.icon}
                                    alt={option.name}
                                    className="h-16 w-16 object-contain drop-shadow transition-transform"
                                />
                            </div>

                            {/* Skill Info */}
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className={`text-xl font-bold ${selectedIndex === index ? "text-yellow-400" : "text-yellow-100"}`}>
                                    {option.name}
                                </h3>
                                {option.type !== SkillType.HEAL && option.type !== SkillType.GET_COIN && (
                                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-300">
                                        Lv. {option.level}
                                    </span>
                                )}
                                <p className={`mt-2 text-sm ${selectedIndex === index ? "text-white" : "text-slate-300"}`}>
                                    {option.description}
                                </p>
                            </div>

                            {/* Shine Effect (Only on selected) */}
                            {selectedIndex === index && (
                                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent to-white opacity-20 animate-shine" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
