export interface PlayerStats {
    coins: number;
    exp: number;
    hp: number;
    maxHp: number;
    level: number;
    nextLevelExp: number;
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

export interface SkillData {
    name: string;
    description: string;
    maxLevel: number;
    icon: string;
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
        name: "Attack Up",
        description: "Increases attack damage by 20%.",
        maxLevel: 5,
        icon: "/assets/images/skills/attack_up.png",
    },
    [SkillType.DEFENSE_UP]: {
        name: "Defense Up",
        description: "Reduces incoming damage by 10%.",
        maxLevel: 5,
        icon: "/assets/images/skills/defense_up.png",
    },
    [SkillType.SPEED_UP]: {
        name: "Speed Up",
        description: "Increases movement speed by 10%.",
        maxLevel: 5,
        icon: "/assets/images/skills/speed_up.png",
    },
    [SkillType.COOLDOWN_DOWN]: {
        name: "Rapid Fire",
        description: "Reduces attack cooldown by 10%.",
        maxLevel: 5,
        icon: "/assets/images/skills/cooldown_down.png",
    },
    [SkillType.MULTI_SHOT]: {
        name: "Multi Shot",
        description: "Fires an additional projectile.",
        maxLevel: 3, // Lower max level for powerful skill
        icon: "/assets/images/skills/multi_shot.png",
    },
    [SkillType.MAGNET_UP]: {
        name: "Magnet Range",
        description: "Increases item collection range by 25%.",
        maxLevel: 5,
        icon: "/assets/images/skills/magnet_up.png",
    },
    [SkillType.EXP_UP]: {
        name: "Growth",
        description: "Increases experience gain by 10%.",
        maxLevel: 5,
        icon: "/assets/images/skills/exp_up.png",
    },
    [SkillType.HEAL]: {
        name: "Recovery",
        description: "Restores 30 HP immediately.",
        maxLevel: 999,
        icon: "/assets/images/heal.png",
    },
    [SkillType.GET_COIN]: {
        name: "Treasure",
        description: "Get 50 Coins immediately.",
        maxLevel: 999,
        icon: "/assets/images/coin.png",
    },
    // Weapons
    [SkillType.GUN]: {
        name: "Pistol",
        description: "Fires bullets at the nearest enemy.",
        maxLevel: 5,
        icon: "/assets/images/skills/gun.png", // Placeholder path
    },
    [SkillType.SWORD]: {
        name: "Katana",
        description: "Slashes enemies in front of you.",
        maxLevel: 5,
        icon: "/assets/images/skills/sword.png", // Placeholder path
    },
};
