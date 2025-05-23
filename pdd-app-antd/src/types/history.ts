// 计算类型
export enum CalculationType {
  PDD_SINGLE = 'PDD_SINGLE', // 拼多多单品计算
  PDD_GROUP = 'PDD_GROUP', // 拼多多团购计算
  DOUYIN_PRICE = 'DOUYIN_PRICE', // 抖音定价计算
  DOUYIN_DISCOUNT = 'DOUYIN_DISCOUNT', // 抖音折扣计算
  DOUYIN_COUPON = 'DOUYIN_COUPON', // 抖音优惠券计算
  DOUYIN_LOW_PRICE = 'DOUYIN_LOW_PRICE', // 抖音低价起价计算
}

// 平台类型
export enum Platform {
  PDD = 'PDD',
  DOUYIN = 'DOUYIN',
}

// 基础记录接口
export interface BaseRecord {
  id: string;
  timestamp: number;
  type: CalculationType;
  platform: Platform;
  supplyPrice: number; // 供货价
}

// 拼多多单品记录
export interface PddSingleRecord extends BaseRecord {
  type: CalculationType.PDD_SINGLE;
  singlePrice: number; // 单买价
  singleProfit: number; // 单买利润
  platformFee: number; // 平台扣点
}

// 拼多多团购记录
export interface PddGroupRecord extends BaseRecord {
  type: CalculationType.PDD_GROUP;
  groupPrice: number; // 团购价
  groupProfit: number; // 团购利润
  platformFee: number; // 平台扣点
}

// 抖音定价记录
export interface DouyinPriceRecord extends BaseRecord {
  type: CalculationType.DOUYIN_PRICE;
  originalPrice: number; // 抖音设置价格
  sellerViewPrice: number; // 卖家看到的价格
  couponAmount: number; // 优惠券金额
  finalPrice: number; // 最终售价
  profit: number; // 利润
  platformFee: number; // 平台扣点
}

// 抖音折扣记录
export interface DouyinDiscountRecord extends BaseRecord {
  type: CalculationType.DOUYIN_DISCOUNT;
  originalPrice: number; // 原价
  discountRate: number; // 折扣率
  discountPrice: number; // 折扣价
  profit: number; // 利润
  platformFee: number; // 平台扣点
}

// 抖音优惠券记录
export interface DouyinCouponRecord extends BaseRecord {
  type: CalculationType.DOUYIN_COUPON;
  listingPrice: number; // 上架价格
  limitedTimePrice?: number; // 限时7折价格
  couponAmount: number; // 优惠券金额
  newUserPrice: number; // 新人价格
  profit: number; // 利润
  platformFee: number; // 平台扣点
}

// 抖音低价起价记录
export interface DouyinLowPriceRecord extends BaseRecord {
  type: CalculationType.DOUYIN_LOW_PRICE;
  listingPrice: number; // 上架价格
  couponAmount: number; // 新人券金额
  newUserPrice: number; // 最终价格
  profit: number; // 利润
  platformFee: number; // 平台扣点
}

// 所有记录类型的联合类型
export type HistoryRecord = 
  | PddSingleRecord 
  | PddGroupRecord 
  | DouyinPriceRecord 
  | DouyinDiscountRecord 
  | DouyinCouponRecord
  | DouyinLowPriceRecord; 