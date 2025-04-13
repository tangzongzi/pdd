import { create } from 'zustand';
import { useHistoryStore } from '@/models/history';

interface ProductItem {
  id: string;
  spec: string;
  supplyPrice: number;
  sellPrice: number;
  discountedSellPrice: number;
  groupPrice: number;
  discountedGroupPrice: number;
  profit: number;
  discountedProfit: number;
}

interface BatchAnalysisState {
  inputText: string;
  priceAddition: number;
  products: ProductItem[];
  
  // 操作方法
  setInputText: (text: string) => void;
  setPriceAddition: (amount: number) => void;
  parseProductInfo: () => void;
  updateSellPrice: (id: string, price: number) => void;
  saveToHistory: () => void;
}

export const useBatchAnalysisStore = create<BatchAnalysisState>((set, get) => ({
  // 初始状态
  inputText: '',
  priceAddition: 6,
  products: [],
  
  // 设置输入文本
  setInputText: (text: string) => {
    set({ inputText: text });
  },
  
  // 设置加价金额
  setPriceAddition: (amount: number) => {
    const newAmount = amount >= 0 ? amount : 0;
    set({ priceAddition: newAmount });
    
    // 重新计算所有产品的价格
    const products = get().products.map(product => {
      if (product.sellPrice) {
        return calculateProductPrices(product, newAmount);
      }
      return product;
    });
    
    set({ products });
  },
  
  // 解析产品信息
  parseProductInfo: () => {
    const { inputText, priceAddition } = get();
    const lines = inputText.split('\n');
    const products: ProductItem[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 如果该行不为空且不是以"¥"或数字开头，则认为是产品规格行
      if (line && !line.startsWith('¥') && !/^\d+件可售$/.test(line) && !/^0$/.test(line)) {
        // 下一行应该是价格行
        if (i + 1 < lines.length) {
          const priceLine = lines[i + 1].trim();
          
          // 检查是否为价格行
          if (priceLine.startsWith('¥')) {
            // 提取价格数值
            const price = parseFloat(priceLine.substring(1)) || 0;
            
            // 添加产品
            products.push({
              id: `product-${Date.now()}-${products.length}`,
              spec: line,
              supplyPrice: price,
              sellPrice: 0,
              discountedSellPrice: 0,
              groupPrice: 0,
              discountedGroupPrice: 0,
              profit: 0,
              discountedProfit: 0
            });
          }
        }
      }
    }
    
    set({ products });
  },
  
  // 更新售卖价格并重新计算
  updateSellPrice: (id: string, sellPrice: number) => {
    const { products, priceAddition } = get();
    
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        return calculateProductPrices({
          ...product,
          sellPrice: sellPrice >= 0 ? sellPrice : 0
        }, priceAddition);
      }
      return product;
    });
    
    set({ products: updatedProducts });
  },
  
  // 保存到历史记录
  saveToHistory: () => {
    const { products, priceAddition } = get();
    
    // 只保存有售卖价的产品
    const validProducts = products.filter(p => p.sellPrice > 0);
    
    if (validProducts.length > 0) {
      const addBatchCalculation = useHistoryStore.getState().addBatchCalculation;
      
      addBatchCalculation({
        priceAddition,
        productCount: validProducts.length,
        products: validProducts.map(p => ({
          spec: p.spec,
          supplyPrice: p.supplyPrice,
          sellPrice: p.sellPrice
        }))
      });
    }
  }
}));

// 计算单个产品的所有价格
function calculateProductPrices(product: ProductItem, priceAddition: number): ProductItem {
  const { supplyPrice, sellPrice } = product;

  // 计算拼单价（后台售卖价）
  const groupPrice = sellPrice + priceAddition;
  
  // 计算99折后的销售价（按正确规则计算）
  // 1. 后台拼单价打99折
  const backendDiscount = groupPrice * 0.99;
  // 2. 减去加价金额得到实际售价
  const discountedSellPrice = backendDiscount - priceAddition;
  
  // 计算常规99折价（仅供显示，实际不使用）
  const discountedGroupPrice = groupPrice * 0.99;
  
  // 计算利润（减去0.6%手续费）
  const fee = sellPrice * 0.006;
  const profit = sellPrice - supplyPrice - fee;
  
  // 计算99折后的利润（减去0.6%手续费）
  const discountedFee = discountedSellPrice * 0.006;
  const discountedProfit = discountedSellPrice - supplyPrice - discountedFee;
  
  return {
    ...product,
    discountedSellPrice,
    groupPrice,
    discountedGroupPrice,
    profit,
    discountedProfit
  };
} 