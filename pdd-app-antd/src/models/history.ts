import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 单个计算历史记录
export interface CalculationRecord {
  timestamp: number;
  supplyPrice: number;
  groupPrice: number;
  priceAddition: number;
  profit: number;
  profitRate: number;
  marketMaxPrice?: number; // 市场控价（可选）
}

// 单个计算历史记录结构
export interface SingleCalculationHistory {
  id: string;
  type: 'single';
  timestamp: number;
  supplyPrice: number;
  groupPrice: number;
  priceAddition: number;
  backendGroupPrice: number;
  singlePrice: number;
  discountPrice: number;
  profit: number;
}

// 批量计算历史记录结构
export interface BatchCalculationHistory {
  id: string;
  type: 'batch';
  timestamp: number;
  priceAddition: number;
  productCount: number;
  products: {
    spec: string;
    supplyPrice: number;
    sellPrice: number;
  }[];
}

// 历史记录类型
export type CalculationHistory = SingleCalculationHistory | BatchCalculationHistory;

// 历史记录状态接口
interface HistoryState {
  history: CalculationHistory[];
  
  // 添加单个计算记录
  addSingleCalculation: (calculation: Omit<SingleCalculationHistory, 'id' | 'type' | 'timestamp'>) => void;
  
  // 添加批量计算记录
  addBatchCalculation: (calculation: Omit<BatchCalculationHistory, 'id' | 'type' | 'timestamp'>) => void;
  
  // 添加计算记录 (新接口 - 兼容calculator模型)
  addCalculation: (calculation: {
    timestamp: number;
    supplyPrice: number;
    groupPrice: number;
    priceAddition: number;
    profit: number;
    profitRate: number;
    marketMaxPrice?: number;
  }) => void;
  
  // 清空历史记录
  clearHistory: () => void;
}

// 创建历史记录状态存储
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      
      // 添加单个计算记录
      addSingleCalculation: (calculation) => {
        const newRecord: SingleCalculationHistory = {
          id: `single-${Date.now()}`,
          type: 'single',
          timestamp: Date.now(),
          ...calculation
        };
        
        set((state) => ({
          history: [newRecord, ...state.history].slice(0, 50) // 只保留最近50条记录
        }));
      },
      
      // 添加批量计算记录
      addBatchCalculation: (calculation) => {
        const newRecord: BatchCalculationHistory = {
          id: `batch-${Date.now()}`,
          type: 'batch',
          timestamp: Date.now(),
          ...calculation
        };
        
        set((state) => ({
          history: [newRecord, ...state.history].slice(0, 50) // 只保留最近50条记录
        }));
      },
      
      // 添加计算记录 (新方法 - 兼容calculator模型)
      addCalculation: (calculation) => {
        const { timestamp, supplyPrice, groupPrice, priceAddition, profit, marketMaxPrice } = calculation;
        
        // 计算后台拼单价和单买价
        const backendGroupPrice = groupPrice + priceAddition;
        const singlePrice = backendGroupPrice + priceAddition;
        
        // 计算99折价格
        const discountPrice = (backendGroupPrice * 0.99) - priceAddition;
        
        const newRecord: SingleCalculationHistory = {
          id: `single-${timestamp}`,
          type: 'single',
          timestamp,
          supplyPrice,
          groupPrice,
          priceAddition,
          backendGroupPrice,
          singlePrice,
          discountPrice,
          profit
        };
        
        set((state) => ({
          history: [newRecord, ...state.history].slice(0, 50) // 只保留最近50条记录
        }));
      },
      
      // 清空历史记录
      clearHistory: () => {
        set({ history: [] });
      }
    }),
    {
      name: 'pdd-calculation-history', // localStorage的键名
      partialize: (state) => ({ history: state.history }), // 只存储history字段
    }
  )
); 