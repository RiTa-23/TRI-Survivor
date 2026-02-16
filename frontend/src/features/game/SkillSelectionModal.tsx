import React from "react";
import { type SkillOption, SkillType } from "../../game/types";

interface Props {
    options: SkillOption[];
    onSelect: (type: SkillType) => void;
}

export const SkillSelectionModal: React.FC<Props> = ({ options, onSelect }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex w-full max-w-5xl flex-col items-center gap-8 p-4">
                <h2 className="text-5xl font-bold text-yellow-400 drop-shadow-lg animate-pulse">
                    LEVEL UP!
                </h2>

                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                    {options.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => onSelect(option.type)}
                            className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-xl border-2 border-slate-600 bg-slate-800/90 p-6 text-white transition-all hover:-translate-y-2 hover:border-yellow-400 hover:bg-slate-700 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] active:scale-95"
                        >
                            {/* Card Header & Icon */}
                            <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 shadow-inner group-hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                <img
                                    src={option.icon}
                                    alt={option.name}
                                    className="h-16 w-16 object-contain drop-shadow transition-transform group-hover:scale-110"
                                />
                            </div>

                            {/* Skill Info */}
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-xl font-bold text-yellow-100 group-hover:text-yellow-400">
                                    {option.name}
                                </h3>
                                {option.type !== SkillType.HEAL && option.type !== SkillType.GET_COIN && (
                                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-300">
                                        Lv. {option.level}
                                    </span>
                                )}
                                <p className="mt-2 text-sm text-slate-300 group-hover:text-white">
                                    {option.description}
                                </p>
                            </div>

                            {/* Shine Effect */}
                            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
