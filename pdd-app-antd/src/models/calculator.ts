import { create } from 'zustand';
import { useHistoryStore } from '@/models/history';

interface CalculatorState {
  supplyPrice: number;
  groupPrice: number;
  priceAddition: number;
  
  // 计算结果
  backendGroupPrice: number;
  singlePrice: number;
  groupPlatformFee: number;
  singlePlatformFee: number;
  groupProfit: number;
  singleProfit: number;
  discountPrice: number;
  discountProfit: number;

  // 操作方法
  setSupplyPrice: (price: number) => void;
  setGroupPrice: (price: number) => void;
  setPriceAddition: (amount: number) => void;
  recalculate: () => void;
  saveToHistory: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // 初始状态
  supplyPrice: 0,
  groupPrice: 0,
  priceAddition: 6,
  
  backendGroupPrice: 0,
  singlePrice: 0,
  groupPlatformFee: 0,
  singlePlatformFee: 0,
  groupProfit: 0,
  singleProfit: 0,
  discountPrice: 0,
  discountProfit: 0,

  // 设置供货价
  setSupplyPrice: (price: number) => {
    set({ supplyPrice: price >= 0 ? price : 0 });
    get().recalculate();
  },

  // 设置拼单价
  setGroupPrice: (price: number) => {
    set({ groupPrice: price >= 0 ? price : 0 });
    get().recalculate();
  },
  
  // 设置加价金额
  setPriceAddition: (amount: number) => {
    set({ priceAddition: amount >= 0 ? amount : 0 });
    get().recalculate();
  },

  // 重新计算所有值
  recalculate: () => {
    const { supplyPrice, groupPrice, priceAddition } = get();
    
    // 计算后台拼单价和单买价
    const backendGroupPrice = groupPrice + priceAddition;
    const singlePrice = Math.ceil(backendGroupPrice + priceAddition);
    
    // 计算手续费
    const groupPlatformFee = groupPrice * 0.006;
    const singlePlatformFee = singlePrice * 0.006;
    
    // 计算利润
    const groupProfit = groupPrice - supplyPrice - groupPlatformFee;
    const singleProfit = singlePrice - supplyPrice - singlePlatformFee;
    
    // 计算99折价格和利润 - 修正计算逻辑
    // 1. 后台拼单价(拼单价+6元)打99折
    const backendDiscount = backendGroupPrice * 0.99;
    // 2. 减去6元得到实际售价
    const discountPrice = backendDiscount - priceAddition;
    // 3. 计算手续费（按实际售价计算）
    const discountPlatformFee = discountPrice * 0.006;
    // 4. 计算最终利润：实际售价 - 供货价 - 手续费
    const discountProfit = discountPrice - supplyPrice - discountPlatformFee;

    set({
      backendGroupPrice,
      singlePrice,
      groupPlatformFee,
      singlePlatformFee,
      groupProfit,
      singleProfit,
      discountPrice,
      discountProfit,
    });
  },
  
  // 保存到历史记录
  saveToHistory: () => {
    const { 
      supplyPrice, groupPrice, priceAddition,
      backendGroupPrice, singlePrice, groupProfit, discountPrice
    } = get();
    
    // 检查是否有输入，以避免保存空白记录
    if (supplyPrice > 0 || groupPrice > 0) {
      const addSingleCalculation = useHistoryStore.getState().addSingleCalculation;
      
      addSingleCalculation({
        supplyPrice,
        groupPrice,
        priceAddition,
        backendGroupPrice,
        singlePrice,
        discountPrice,
        profit: groupProfit,
      });
    }
  }
})); 