import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Divider,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Tooltip,
  Slider,
  Switch,
  Radio
} from 'antd';
import {
  DollarOutlined,
  TagOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  EditOutlined
} from '@ant-design/icons';
import './index.less';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform, DouyinLowPriceRecord } from '@/types/history';

const { Text } = Typography;

interface FormData {
  supplierPrice: number; // 供货价/成本
}

// 定价参数
const PRICE_MULTIPLIER = 2; // 2倍
const PRICE_ADDITION = 10; // 加10元
const DEFAULT_MIN_PROFIT = 1; // 默认保本+1元利润
const LIMITED_DISCOUNT_RATE = 0.7; // 限时7折

// 平台扣点比例
const PLATFORM_FEE_RATE = 0.02; // 2%

const DouyinLowPrice: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0); // 上架价格
  const [limitedTimePrice, setLimitedTimePrice] = useState<number>(0); // 限时7折价格
  const [showResults, setShowResults] = useState<boolean>(false);
  const [platformFee, setPlatformFee] = useState<number>(0); // 平台扣点
  const [newUserCoupon, setNewUserCoupon] = useState<number>(0); // 新人券金额
  const [finalPrice, setFinalPrice] = useState<number>(0); // 最终价格
  const [profit, setProfit] = useState<number>(0); // 利润
  const [profitRate, setProfitRate] = useState<number>(0); // 利润率
  const [enableLimitedDiscount, setEnableLimitedDiscount] = useState<boolean>(true); // 是否启用限时折扣
  const { addRecord } = useHistoryStore();

  // 当表单值变化时自动计算
  const valuesChange = (changedValues: any, allValues: FormData) => {
    if (allValues.supplierPrice && allValues.supplierPrice > 0) {
      calculateResults(allValues);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // 新人券金额变化时重新计算
  const handleCouponChange = (value: number) => {
    if (formData?.supplierPrice) {
      setNewUserCoupon(value);
      
      // 重新计算最终价格
      const basePrice = enableLimitedDiscount ? limitedTimePrice : listingPrice;
      const newFinalPrice = Math.max(0.01, basePrice - value);
      setFinalPrice(newFinalPrice);
      
      // 重新计算平台扣点
      const newPlatformFee = newFinalPrice * PLATFORM_FEE_RATE;
      setPlatformFee(newPlatformFee);
      
      // 重新计算利润
      const newProfit = newFinalPrice - formData.supplierPrice - newPlatformFee;
      setProfit(newProfit);
      
      // 重新计算利润率
      const newProfitRate = (newProfit / formData.supplierPrice) * 100;
      setProfitRate(newProfitRate);
      
      // 添加到历史记录
      addRecord({
        type: CalculationType.DOUYIN_LOW_PRICE,
        platform: Platform.DOUYIN,
        supplyPrice: formData.supplierPrice,
        listingPrice: listingPrice,
        couponAmount: value,
        newUserPrice: newFinalPrice,
        profit: newProfit,
        platformFee: newPlatformFee,
      } as Omit<DouyinLowPriceRecord, 'id' | 'timestamp'>);
    }
  };

  // 切换限时折扣状态
  const handleToggleLimitedDiscount = (checked: boolean) => {
    setEnableLimitedDiscount(checked);
    if (formData) {
      calculateResults(formData);
    }
  };

  const calculateResults = (values: FormData) => {
    const { supplierPrice } = values;
    
    // 计算上架价格 = 供货价 × 2 + 10元
    const calculatedListingPrice = supplierPrice * PRICE_MULTIPLIER + PRICE_ADDITION;
    
    // 计算限时7折价格
    const calculatedLimitedTimePrice = Math.round(calculatedListingPrice * LIMITED_DISCOUNT_RATE * 100) / 100;
    
    // 根据是否启用限时折扣选择基础价格
    const basePrice = enableLimitedDiscount ? calculatedLimitedTimePrice : calculatedListingPrice;
    
    // 根据保本+1元利润计算默认新人券金额
    // 售价 - 新人券 = 供货价 + 平台扣点 + 1元利润
    // 新人券 = 售价 - 供货价 - 平台扣点 - 1元利润
    const minPrice = supplierPrice + (supplierPrice * PLATFORM_FEE_RATE) + DEFAULT_MIN_PROFIT;
    const calculatedCoupon = Math.round(Math.max(0, basePrice - minPrice));
    
    // 计算最终价格 = 基础价格 - 新人券
    const calculatedFinalPrice = Math.max(0.01, basePrice - calculatedCoupon);
    
    // 计算平台扣点
    const calculatedPlatformFee = calculatedFinalPrice * PLATFORM_FEE_RATE;
    
    // 计算利润 = 最终价格 - 供货价 - 平台扣点
    const calculatedProfit = calculatedFinalPrice - supplierPrice - calculatedPlatformFee;
    
    // 计算利润率 = 利润 / 供货价 * 100%
    const calculatedProfitRate = (calculatedProfit / supplierPrice) * 100;

    // 更新状态
    setFormData(values);
    setListingPrice(calculatedListingPrice);
    setLimitedTimePrice(calculatedLimitedTimePrice);
    setNewUserCoupon(calculatedCoupon);
    setFinalPrice(calculatedFinalPrice);
    setPlatformFee(calculatedPlatformFee);
    setProfit(calculatedProfit);
    setProfitRate(calculatedProfitRate);

    // 添加到历史记录
    addRecord({
      type: CalculationType.DOUYIN_LOW_PRICE,
      platform: Platform.DOUYIN,
      supplyPrice: supplierPrice,
      listingPrice: calculatedListingPrice,
      couponAmount: calculatedCoupon,
      newUserPrice: calculatedFinalPrice,
      profit: calculatedProfit,
      platformFee: calculatedPlatformFee,
    } as Omit<DouyinLowPriceRecord, 'id' | 'timestamp'>);
  };

  // 计算新人券可调范围
  const getMaxCoupon = () => {
    if (!formData?.supplierPrice || !listingPrice) return 0;
    
    // 根据是否启用限时折扣选择基础价格
    const basePrice = enableLimitedDiscount ? limitedTimePrice : listingPrice;
    
    // 最大值为基础价格 - 0.01元(保证最低价0.01元)
    return Math.floor(basePrice - 0.01);
  };

  return (
    <div className="douyin-low-price-page">
      <Card title="抖音低价起价计算器" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={valuesChange}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              label={
                <span className="input-label">
                  供货价(¥)
                  <Tooltip title="商品的基础成本价">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
              name="supplierPrice"
              rules={[{ required: true, message: '请输入供货价' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                precision={2}
                placeholder="请输入供货价/成本"
                addonBefore="¥"
              />
            </Form.Item>
            
            <Form.Item
              label={
                <span className="input-label">
                  启用限时7折
                  <Tooltip title="前5-10天使用限时7折价格进行快速拉新">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <Switch 
                checked={enableLimitedDiscount} 
                onChange={handleToggleLimitedDiscount}
                checkedChildren="已启用"
                unCheckedChildren="已关闭"
              />
            </Form.Item>
          </Space>
        </Form>

        {showResults && (
          <>
            <Divider />
            
            <div className="result-section">
              {/* 主要计算结果卡片 */}
              <div className="key-results-container">
                <Row gutter={[16, 16]} className="key-results">
                  {/* 上架价格 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="price-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="price-title">
                            <DollarOutlined className="price-icon" />
                            <span>抖音上架价格</span>
                          </div>
                        }
                        value={listingPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="price-description">
                        在抖音后台设置此上架价格 (供货价×2+10元)
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 限时折扣价格 */}
                  {enableLimitedDiscount && (
                    <Col xs={24} sm={12}>
                      <Card 
                        className="discount-card" 
                        bordered={false}
                      >
                        <Statistic
                          title={
                            <div className="discount-title">
                              <PercentageOutlined className="discount-icon" />
                              <span>限时7折价格</span>
                            </div>
                          }
                          value={limitedTimePrice}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="discount-description">
                          前5-10天显示的折扣价格
                        </div>
                      </Card>
                    </Col>
                  )}
                  
                  {/* 新人券金额 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="coupon-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="coupon-title">
                            <TagOutlined className="coupon-icon" />
                            <span>新人券金额</span>
                          </div>
                        }
                        value={newUserCoupon}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="coupon-description">
                        默认设置保本+1元利润
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 调整优惠券 */}
                  <Col span={24}>
                    <Card 
                      className="adjust-card" 
                      bordered={false}
                      title="调整新人券金额"
                    >
                      <div className="slider-container">
                        <Slider
                          min={0}
                          max={getMaxCoupon()}
                          onChange={handleCouponChange}
                          value={newUserCoupon}
                          step={1}
                          tooltip={{ formatter: value => `¥${value}` }}
                        />
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 最终价格 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="final-price-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="final-price-title">
                            <ShoppingCartOutlined className="final-price-icon" />
                            <span>最终价格</span>
                          </div>
                        }
                        value={finalPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="final-price-description">
                        用户实际支付价格({enableLimitedDiscount ? '7折价' : '上架价'}-新人券)
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 利润 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="profit-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="profit-title">
                            <RiseOutlined className="profit-icon" />
                            <span>利润</span>
                          </div>
                        }
                        value={profit}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ 
                          color: profit >= 0 ? '#52c41a' : '#ff4d4f', 
                          fontSize: '28px', 
                          fontWeight: 'bold' 
                        }}
                      />
                      <div className="profit-rate">
                        利润率: <span className={profitRate >= 0 ? 'positive' : 'negative'}>{profitRate.toFixed(1)}%</span>
                      </div>
                      <div className="platform-fee-info">
                        平台扣点: <span>{PLATFORM_FEE_RATE * 100}%</span> (¥{platformFee.toFixed(2)})
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
              
              <Alert
                className="info-alert"
                type="info"
                message={`抖音低价起价策略说明`}
                description={
                  <Space direction="vertical">
                    <Text>1. 上架价格: ¥{listingPrice.toFixed(2)} (供货价×2+10元)</Text>
                    {enableLimitedDiscount && <Text>2. 前5-10天：上架价格{listingPrice.toFixed(2)}元 → 限时7折至{limitedTimePrice.toFixed(2)}元</Text>}
                    <Text>{enableLimitedDiscount ? '3' : '2'}. 新人券金额: ¥{newUserCoupon.toFixed(2)}</Text>
                    <Text>{enableLimitedDiscount ? '4' : '3'}. 最终价格: ¥{finalPrice.toFixed(2)}</Text>
                    <Text>{enableLimitedDiscount ? '5' : '4'}. 平台扣点({PLATFORM_FEE_RATE * 100}%): ¥{platformFee.toFixed(2)}（按最终价格计算）</Text>
                    <Text>{enableLimitedDiscount ? '6' : '5'}. 实际利润 = 最终价格 - 供货价 - 平台扣点 = ¥{profit.toFixed(2)}</Text>
                    <Text>{enableLimitedDiscount ? '7' : '6'}. 建议：新品前5-10天使用超低价引流，之后关闭新人礼金转为正常价格</Text>
                    {enableLimitedDiscount && <Text>8. 活动截止后：立即关闭礼金 → 恢复原价 → 开放阶梯立减券</Text>}
                  </Space>
                }
                showIcon
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default DouyinLowPrice; 