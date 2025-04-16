import { create } from 'zustand';
import { useHistoryStore } from '@/models/history';

interface CalculatorState {
  supplyPrice: number;
  groupPrice: number;
  priceAddition: number;
  
  // 市场控价 - 新增
  marketMaxPrice: number;
  
  // 价格变更来源标记
  isRateSelectionUpdate: boolean;
  
  // 倍速选择
  priceMultiplier: number;
  
  // 计算结果
  backendGroupPrice: number;
  singlePrice: number;
  groupPlatformFee: number;
  singlePlatformFee: number;
  groupProfit: number;
  singleProfit: number;
  discountPrice: number;
  discountProfit: number;
  currentProfitRate: number; // 当前利润率
  
  // 标记价格是否超出市场控价 - 新增
  isPriceExceedLimit: boolean;

  // 操作方法
  setSupplyPrice: (price: number) => void;
  setGroupPrice: (price: number) => void;
  setPriceAddition: (value: number) => void;
  
  // 设置市场控价 - 新增
  setMarketMaxPrice: (price: number) => void;
  
  // 设置倍速
  setPriceMultiplier: (multiplier: number) => void;
  
  recalculate: () => void;
  saveToHistory: () => void;
  
  // 新增方法
  calculateCurrentProfitRate: () => number; // 计算当前利润率
  setPriceByProfitRate: (rate: number) => void; // 根据利润率设置拼单价

  // 设置价格变更来源标记
  setIsRateSelectionUpdate: (value: boolean) => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // 初始状态
  supplyPrice: 0,
  groupPrice: 0,
  priceAddition: 6,
  
  // 市场控价初始值 - 新增
  marketMaxPrice: 0,
  
  // 价格变更来源标记
  isRateSelectionUpdate: false,
  
  // 倍速选择初始值
  priceMultiplier: 1,
  
  backendGroupPrice: 0,
  singlePrice: 0,
  groupPlatformFee: 0,
  singlePlatformFee: 0,
  groupProfit: 0,
  singleProfit: 0,
  discountPrice: 0,
  discountProfit: 0,
  currentProfitRate: 0.1, // 默认10%利润率
  
  // 标记价格是否超出市场控价 - 新增
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
    
    // 无论是否来自档位选择，都进行完整重新计算
    // 这确保了利润率和所有计算值始终保持同步
    const { supplyPrice, groupPrice, priceAddition, marketMaxPrice, priceMultiplier } = get();
    
    // 计算后台价格和单买价
    const backendGroupPrice = groupPrice + priceAddition;
    const singlePrice = backendGroupPrice + priceAddition;
    
    // 计算平台手续费
    const feeRate = 0.006; // 0.6%
    const groupPlatformFee = groupPrice * feeRate;
    const singlePlatformFee = singlePrice * feeRate;
    
    // 计算利润
    const groupProfit = groupPrice - (supplyPrice * priceMultiplier) - groupPlatformFee;
    const singleProfit = singlePrice - (supplyPrice * priceMultiplier) - singlePlatformFee;
    
    // 计算99折价格及其利润
    const discountPrice = (backendGroupPrice * 0.99) - priceAddition;
    const discountPlatformFee = discountPrice * feeRate;
    const discountProfit = discountPrice - (supplyPrice * priceMultiplier) - discountPlatformFee;
    
    // 计算当前利润率（在供货价基础上的百分比）
    let currentProfitRate = 0;
    if (supplyPrice > 0) {
      // 即使亏损也计算利润率，以便UI能显示正确的负值
      currentProfitRate = groupProfit / (supplyPrice * priceMultiplier);
    }
    
    // 检查是否超出市场控价
    const isPriceExceedLimit = marketMaxPrice > 0 && groupPrice > marketMaxPrice;
    
    // 更新所有计算结果 - 始终包括currentProfitRate
    set({
      backendGroupPrice,
      singlePrice,
      groupPlatformFee,
      singlePlatformFee,
      groupProfit,
      singleProfit,
      discountPrice,
      discountProfit,
      currentProfitRate,
      isPriceExceedLimit
    });
    
    // 使用setTimeout确保状态已更新后再触发通知
    setTimeout(() => {
      // 打印日志，以便调试
      console.log('价格已更新，计算结果:', {
        supplyPrice,
        groupPrice,
        profit: groupProfit.toFixed(2),
        profitRate: (currentProfitRate * 100).toFixed(1) + '%',
        timestamp: new Date().toISOString()
      });
    }, 0);
  },
  
  // 设置加价金额
  setPriceAddition: (value: number) => {
    set({ priceAddition: value });
    get().recalculate();
  },
  
  // 设置市场控价 - 新增
  setMarketMaxPrice: (price: number) => {
    set({ marketMaxPrice: price });
    get().recalculate();
  },

  // 设置倍速
  setPriceMultiplier: (multiplier: number) => {
    set({ priceMultiplier: multiplier });
    // 修改倍数后不会触发供货价更新，仅重新计算结果
    get().recalculate();
  },

  // 重新计算所有值
  recalculate: () => {
    const { supplyPrice, groupPrice, priceAddition, marketMaxPrice, priceMultiplier } = get();
    
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
    const groupProfit = groupPrice - (supplyPrice * priceMultiplier) - groupPlatformFee;
    const singleProfit = singlePrice - (supplyPrice * priceMultiplier) - singlePlatformFee;
    
    // 计算99折价格及其利润
    const discountPrice = (backendGroupPrice * 0.99) - priceAddition;
    const discountPlatformFee = discountPrice * feeRate;
    const discountProfit = discountPrice - (supplyPrice * priceMultiplier) - discountPlatformFee;
    
    // 计算当前利润率（在供货价基础上的百分比）
    let currentProfitRate = 0;
    if (supplyPrice > 0) {
      // 即使亏损也计算利润率，以便UI能显示正确的负值
      currentProfitRate = groupProfit / (supplyPrice * priceMultiplier);
    }
    
    // 检查是否超出市场控价 - 新增
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
      currentProfitRate,
      isPriceExceedLimit
    });
  },
  
  // 保存到历史记录
  saveToHistory: () => {
    const { 
      supplyPrice, groupPrice, priceAddition, 
      groupProfit, currentProfitRate, marketMaxPrice,
      backendGroupPrice, singlePrice, discountPrice
    } = get();
    
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
  },

  // 计算当前利润率
  calculateCurrentProfitRate: () => {
    const { supplyPrice, groupProfit } = get();
    return supplyPrice > 0 ? (groupProfit / supplyPrice) : 0;
  },
  
  // 根据利润率设置拼单价
  setPriceByProfitRate: (rate: number) => {
    const { supplyPrice, marketMaxPrice } = get();
    if (supplyPrice <= 0) return;
    
    // 计算手续费系数
    const feeRate = 0.006;
    
    // 计算新的拼单价
    let newGroupPrice = Math.ceil((supplyPrice * (1 + rate)) / (1 - feeRate) * 100) / 100;
    
    // 如果有市场控价且计算价格超过市场控价，则限制为市场控价
    if (marketMaxPrice > 0 && newGroupPrice > marketMaxPrice) {
      newGroupPrice = marketMaxPrice;
    }
    
    // 直接使用setGroupPrice来统一更新所有状态
    // 这确保了无论通过哪种方式设置价格，所有计算都是一致的
    get().setGroupPrice(newGroupPrice);
    
    // 打印档位选择日志
    console.log('设置档位价格:', {
      rate: (rate * 100).toFixed(1) + '%',
      price: newGroupPrice.toFixed(2)
    });
  },

  // 设置价格变更来源标记
  setIsRateSelectionUpdate: (value: boolean) => {
    set({ isRateSelectionUpdate: value });
  }
})); 