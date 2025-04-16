import { create } from 'zustand';
import { useHistoryStore } from '@/models/history';

interface CalculatorState {
  supplyPrice: number;
  groupPrice: number;
  priceAddition: number;
  
  // 市场控价
  marketMaxPrice: number;
  
  // 计算结果
  backendGroupPrice: number;
  singlePrice: number;
  groupPlatformFee: number;
  singlePlatformFee: number;
  groupProfit: number;
  singleProfit: number;
  discountPrice: number;
  discountProfit: number;
  
  // 标记价格是否超出市场控价
  isPriceExceedLimit: boolean;

  // 操作方法
  setSupplyPrice: (price: number) => void;
  setGroupPrice: (price: number) => void;
  setPriceAddition: (value: number) => void;
  setMarketMaxPrice: (price: number) => void;
  recalculate: () => void;
  saveToHistory: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // 初始状态
  supplyPrice: 0,
  groupPrice: 0,
  priceAddition: 6,
  marketMaxPrice: 0,
  
  backendGroupPrice: 0,
  singlePrice: 0,
  groupPlatformFee: 0,
  singlePlatformFee: 0,
  groupProfit: 0,
  singleProfit: 0,
  discountPrice: 0,
  discountProfit: 0,
  
  // 标记价格是否超出市场控价
  isPriceExceedLimit: false,

  // 设置供货价
  setSupplyPrice: (price: number) => {
    set({ supplyPrice: price });
    get().recalculate();
  },

  // 设置拼单价
  setGroupPrice: (price: number) => {
    // 先设置价格
    set({ groupPrice: price });
    
    // 进行完整重新计算
    const { supplyPrice, groupPrice, priceAddition, marketMaxPrice } = get();
    
    // 计算后台价格和单买价
    const backendGroupPrice = groupPrice + priceAddition;
    const singlePrice = backendGroupPrice + priceAddition;
    
    // 计算平台手续费
    const feeRate = 0.006; // 0.6%
    const groupPlatformFee = groupPrice * feeRate;
    const singlePlatformFee = singlePrice * feeRate;
    
    // 计算利润
    const groupProfit = groupPrice - supplyPrice - groupPlatformFee;
    const singleProfit = singlePrice - supplyPrice - singlePlatformFee;
    
    // 计算99折价格及其利润
    const discountPrice = (backendGroupPrice * 0.99) - priceAddition;
    const discountPlatformFee = discountPrice * feeRate;
    const discountProfit = discountPrice - supplyPrice - discountPlatformFee;
    
    // 检查是否超出市场控价
    const isPriceExceedLimit = marketMaxPrice > 0 && groupPrice > marketMaxPrice;
    
    // 更新所有计算结果
    set({
      backendGroupPrice,
      singlePrice,
      groupPlatformFee,
      singlePlatformFee,
      groupProfit,
      singleProfit,
      discountPrice,
      discountProfit,
      isPriceExceedLimit
    });
  },
  
  // 设置加价金额
  setPriceAddition: (value: number) => {
    set({ priceAddition: value });
    get().recalculate();
  },
  
  // 设置市场控价
  setMarketMaxPrice: (price: number) => {
    set({ marketMaxPrice: price });
    get().recalculate();
  },

  // 重新计算所有值
  recalculate: () => {
    const { supplyPrice, groupPrice, priceAddition, marketMaxPrice } = get();
    
    // 如果没有有效输入，则不计算
    if (supplyPrice <= 0 || groupPrice <= 0) {
      return;
    }
    
    // 计算后台价格和单买价
    const backendGroupPrice = groupPrice + priceAddition;
    const singlePrice = backendGroupPrice + priceAddition;
    
    // 计算平台手续费
    const feeRate = 0.006; // 0.6%
    const groupPlatformFee = groupPrice * feeRate;
    const singlePlatformFee = singlePrice * feeRate;
    
    // 计算利润
    const groupProfit = groupPrice - supplyPrice - groupPlatformFee;
    const singleProfit = singlePrice - supplyPrice - singlePlatformFee;
    
    // 计算99折价格及其利润
    const discountPrice = (backendGroupPrice * 0.99) - priceAddition;
    const discountPlatformFee = discountPrice * feeRate;
    const discountProfit = discountPrice - supplyPrice - discountPlatformFee;
    
    // 检查是否超出市场控价
    const isPriceExceedLimit = marketMaxPrice > 0 && groupPrice > marketMaxPrice;
    
    // 更新所有计算结果
    set({
      backendGroupPrice,
      singlePrice,
      groupPlatformFee,
      singlePlatformFee,
      groupProfit,
      singleProfit,
      discountPrice,
      discountProfit,
      isPriceExceedLimit
    });
  },
  
  // 保存到历史记录
  saveToHistory: () => {
    const { 
      supplyPrice, groupPrice, priceAddition, 
      groupProfit, marketMaxPrice,
      backendGroupPrice, singlePrice, discountPrice
    } = get();
    
    // 计算当前利润率（在供货价基础上的百分比）
    const currentProfitRate = supplyPrice > 0 ? (groupProfit / supplyPrice) : 0;
    
    // 检查必要数据是否有效
    if (supplyPrice <= 0 || groupPrice <= 0) {
      return; // 数据无效不保存
    }
    
    // 使用历史记录store保存
    const historyStore = useHistoryStore.getState();
    
    // 调用新增的addCalculation方法
    historyStore.addCalculation({
      timestamp: Date.now(),
      supplyPrice,
      groupPrice,
      priceAddition,
      profit: groupProfit,
      profitRate: currentProfitRate,
      marketMaxPrice
    });
    
    // 在控制台记录保存信息
    console.log('计算结果已保存到历史记录', {
      supplyPrice, groupPrice, profit: groupProfit
    });
  }
})); 