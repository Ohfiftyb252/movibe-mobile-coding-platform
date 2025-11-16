export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Player {
  id: string;
  name: string;
  ovCoin: number;
  inventory: {
    hats: string[];
  };
}