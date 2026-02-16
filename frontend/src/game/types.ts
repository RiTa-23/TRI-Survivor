export interface PlayerStats {
    coins: number;
    exp: number;
    hp: number;
    maxHp: number;
    level: number;
    nextLevelExp: number;
    weapons: { type: SkillType; level: number }[];
    passives: { type: SkillType; level: number }[];
    time: number; // Elapsed time in seconds
    killCount: number; // Number of enemies defeated
}

export const SkillType = {
    ATTACK_UP: "ATTACK_UP",
    DEFENSE_UP: "DEFENSE_UP",
    SPEED_UP: "SPEED_UP",
    COOLDOWN_DOWN: "COOLDOWN_DOWN",
    MULTI_SHOT: "MULTI_SHOT",
    MAGNET_UP: "MAGNET_UP",
    EXP_UP: "EXP_UP",
    HEAL: "HEAL",
    GET_COIN: "GET_COIN",
    // Weapons
    GUN: "GUN",
    SWORD: "SWORD",
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

export const WEAPON_TYPES: Set<SkillType> = new Set([SkillType.GUN, SkillType.SWORD]);

export interface SkillData {
    name: string;
    description: string;
    maxLevel: number;
    icon: string;
    value?: number; // For instant skills like Heal or Coin
    // Base stats or increment per level can be defined here if needed data-driven
}

export interface SkillOption {
    type: SkillType;
    name: string;
    description: string;
    icon: string;
    level: number; // Current level + 1 (the level you are getting)
}

export const SKILL_DEFINITIONS: Record<SkillType, SkillData> = {
    [SkillType.ATTACK_UP]: {
        name: "攻撃力アップ",
        description: "攻撃力が 2 上昇します",
        maxLevel: 5,
        icon: "/assets/images/skills/attack_up.png",
    },
    [SkillType.DEFENSE_UP]: {
        name: "防御力アップ",
        description: "受けるダメージを 10% 軽減します",
        maxLevel: 5,
        icon: "/assets/images/skills/defense_up.png",
    },
    [SkillType.SPEED_UP]: {
        name: "スピードアップ",
        description: "移動速度が 10% 上昇します",
        maxLevel: 5,
        icon: "/assets/images/skills/speed_up.png",
    },
    [SkillType.COOLDOWN_DOWN]: {
        name: "ラピッドファイア",
        description: "攻撃間隔が 10% 短縮されます",
        maxLevel: 5,
        icon: "/assets/images/skills/cooldown_down.png",
    },
    [SkillType.MULTI_SHOT]: {
        name: "マルチショット",
        description: "発射数が 1 増加します",
        maxLevel: 1, // Lower max level for powerful skill
        icon: "/assets/images/skills/multi_shot.png",
    },
    [SkillType.MAGNET_UP]: {
        name: "マグネット範囲",
        description: "アイテム回収範囲が 25% 広がります",
        maxLevel: 5,
        icon: "/assets/images/skills/magnet_up.png",
    },
    [SkillType.EXP_UP]: {
        name: "成長促進",
        description: "経験値獲得量が 10% 増加します",
        maxLevel: 5,
        icon: "/assets/images/skills/exp_up.png",
    },
    [SkillType.HEAL]: {
        name: "回復",
        description: "HPを 30 回復します",
        maxLevel: 999,
        icon: "/assets/images/heal.png",
        value: 30, // HP restore amount
    },
    [SkillType.GET_COIN]: {
        name: "宝物",
        description: "コインを 50 獲得します",
        maxLevel: 999,
        icon: "/assets/images/coin.png",
        value: 50, // Coin amount
    },
    // Weapons
    [SkillType.GUN]: {
        name: "ピストル",
        description: "近くの敵を自動で攻撃します",
        maxLevel: 5,
        icon: "/assets/images/skills/gun.png",
    },
    [SkillType.SWORD]: {
        name: "カタナ",
        description: "前方の敵を斬りつけます",
        maxLevel: 5,
        icon: "/assets/images/skills/sword.png",
    },
};
