import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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