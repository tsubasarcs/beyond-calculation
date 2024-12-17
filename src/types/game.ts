export interface GameStatus {
  health: number;      // 體力值
  spirit: number;      // 精神值
  maxHealth: number;   // 最大體力值
  maxSpirit: number;   // 最大精神值
}

export enum ItemType {
  Recovery = 'recovery',   // 補充類道具
  Normal = 'normal',      // 普通道具
  Weapon = 'weapon',      // 武器道具
  Coin = 'coin'          // 硬幣
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  quantity?: number;      // 數量（針對硬幣）
  uses?: number;          // 使用次數（針對武器）
  effects?: {
    health?: number;      // 回復體力值
    spirit?: number;      // 回復精神值
  };
}

export interface Inventory {
  slots: (Item | null)[];  // 固定4個格子
}