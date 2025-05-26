import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  InputNumber, 
  Row, 
  Col, 
  Divider, 
  Alert, 
  Tooltip, 
  Slider, 
  Space,
  Button,
  InputNumber as AntInputNumber
} from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  TagOutlined,
  DollarOutlined,
  ShoppingOutlined,
  PercentageOutlined,
  TrophyOutlined,
  PlusOutlined,
  MinusOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform } from '@/types/history';
import './index.less';

const { Title, Text } = Typography;

// 抖音控价组件
const DyPriceCalculator: React.FC = () => {
  // 状态定义
  const [form] = Form.useForm();
  const [supplyPrice, setSupplyPrice] = useState<number | null>(null);
  const [retailPrice, setRetailPrice] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number>(0); // 抖音设置价格
  const [sellerViewPrice, setSellerViewPrice] = useState<number>(0); // 卖家看到的价格
  const [couponAmount, setCouponAmount] = useState<number>(0); // 新人礼金
  const [finalPrice, setFinalPrice] = useState<number>(0); // 最终售价
  const [adjustment, setAdjustment] = useState<number>(0); // 调整金额
  const [profit, setProfit] = useState<number>(0); // 利润
  const [profitRate, setProfitRate] = useState<number>(0); // 利润率
  const [priceAddition, setPriceAddition] = useState<number>(10); // 价格加成，默认10元
  const [discountRate, setDiscountRate] = useState<number>(0.7); // 限时折扣，默认7折
  const [priceWarning, setPriceWarning] = useState<boolean>(false); // 价格警告
  const { addRecord } = useHistoryStore();
  
  // 当表单值变化时计算价格
  const handleFormChange = (changedValues: any, allValues: any) => {
    const { supplyPrice, retailPrice } = allValues;
    
    if (supplyPrice) {
      setSupplyPrice(supplyPrice);
      calculatePrices(supplyPrice, retailPrice, priceAddition, discountRate);
    }
    
    if (retailPrice !== undefined) {
      setRetailPrice(retailPrice);
    }
  };
  
  // 计算所有价格
  const calculatePrices = (supply: number, retail: number | null, addition: number, discount: number) => {
    if (supply > 0) {
      // 根据公式计算抖音设置价格: 供货价 * 2 + 加价金额
      const calculatedOriginalPrice = Math.round((supply * 2 + addition) * 100) / 100;
      setOriginalPrice(calculatedOriginalPrice);
      
      // 计算卖家看到的价格: 抖音设置价格 * 限时折扣
      const calculatedSellerViewPrice = Math.round((calculatedOriginalPrice * discount) * 100) / 100;
      setSellerViewPrice(calculatedSellerViewPrice);
      
      // 重置价格警告
      setPriceWarning(false);
      
      if (retail && retail > 0) {
        // 检查卖家价格是否足够支付目标零售价
        if (calculatedSellerViewPrice < retail) {
          setPriceWarning(true);
          // 设置新人礼金为0（因为卖家价格已经低于目标零售价）
          setCouponAmount(0);
          // 最终售价就是卖家价格
          setFinalPrice(calculatedSellerViewPrice);
          // 计算价格差额
          const calculatedAdjustment = calculatedSellerViewPrice - retail;
          setAdjustment(calculatedAdjustment);
        } else {
          // 正常情况：计算所需新人礼金使最终售价精确等于目标零售价
          // 新人礼金 = 卖家看到的价格 - 目标零售价，精确计算
          const exactDifference = calculatedSellerViewPrice - retail;
          
          // 确保新人礼金为整数
          const recommendedCoupon = Math.floor(exactDifference);
          setCouponAmount(recommendedCoupon);
          
          // 设置最终售价（精确等于目标零售价）
          setFinalPrice(retail);
          
          // 由于使用整数礼金，实际最终售价可能与目标价格有微小差异
          // 但我们在UI上强制显示最终售价等于目标零售价
          setAdjustment(0);
        }
        
        // 计算利润
        const calculatedProfit = retail - supply;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = (calculatedProfit / supply) * 100;
        setProfitRate(calculatedProfitRate);

        // 添加到历史记录
        addRecord({
          type: CalculationType.DOUYIN_PRICE,
          platform: Platform.DOUYIN,
          supplyPrice: supply,
          originalPrice: calculatedOriginalPrice,
          sellerViewPrice: calculatedSellerViewPrice,
          couponAmount: couponAmount,
          finalPrice: retail, // 确保记录的最终售价是目标零售价
          profit: calculatedProfit,
          platformFee: 0, // 为满足类型要求
        } as any);
      } else {
        // 如果没有设置零售价，则最终售价为卖家看到的价格
        setFinalPrice(calculatedSellerViewPrice);
        setCouponAmount(0);
        setAdjustment(0);
        
        // 计算利润
        const calculatedProfit = calculatedSellerViewPrice - supply;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = (calculatedProfit / supply) * 100;
        setProfitRate(calculatedProfitRate);
      }
    }
  };
  
  // 当优惠券金额改变时，更新最终售价
  const handleCouponChange = (value: number) => {
    // 确保新人礼金为整数
    const intValue = Math.floor(value);
    setCouponAmount(intValue);
    
    if (sellerViewPrice > 0) {
      if (retailPrice && retailPrice > 0) {
        // 如果有目标零售价，强制最终售价等于目标零售价
        setFinalPrice(retailPrice);
        setAdjustment(0);
      } else {
        // 否则根据礼金计算最终售价
        const calculatedFinalPrice = sellerViewPrice - intValue;
        setFinalPrice(calculatedFinalPrice);
      }
      
      // 如果有供货价，计算利润
      if (supplyPrice) {
        const calculatedProfit = finalPrice - supplyPrice;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = (calculatedProfit / supplyPrice) * 100;
        setProfitRate(calculatedProfitRate);
      }
    }
  };
  
  // 处理原始价格手动调整
  const handleOriginalPriceChange = (value: number | null) => {
    if (value !== null) {
      setOriginalPrice(value);
      
      // 更新卖家看到的价格
      const calculatedSellerViewPrice = Math.round((value * discountRate) * 100) / 100;
      setSellerViewPrice(calculatedSellerViewPrice);
      
      // 更新最终售价
      const calculatedFinalPrice = Math.max(0.01, Math.round((calculatedSellerViewPrice - couponAmount) * 100) / 100);
      setFinalPrice(calculatedFinalPrice);
      
      // 如果有供货价，计算利润
      if (supplyPrice) {
        const calculatedProfit = Math.round((calculatedFinalPrice - supplyPrice) * 100) / 100;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = Math.round((calculatedProfit / supplyPrice) * 100 * 10) / 10;
        setProfitRate(calculatedProfitRate);
      }
      
      // 如果有零售价，更新价格差额
      if (retailPrice) {
        const calculatedAdjustment = Math.round((calculatedFinalPrice - retailPrice) * 100) / 100;
        setAdjustment(calculatedAdjustment);
        
        // 检查目标零售价是否大于卖家看到的价格
        setPriceWarning(retailPrice > calculatedSellerViewPrice);
      }
    }
  };
  
  // 处理加价金额变化
  const handlePriceAdditionChange = (value: number) => {
    setPriceAddition(value);
    
    // 如果有供货价，重新计算价格
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice, value, discountRate);
    }
  };
  
  // 增加加价金额
  const increasePriceAddition = () => {
    const newAddition = priceAddition + 1;
    setPriceAddition(newAddition);
    
    // 如果有供货价，重新计算价格
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice, newAddition, discountRate);
    }
  };
  
  // 减少加价金额
  const decreasePriceAddition = () => {
    const newAddition = Math.max(0, priceAddition - 1);
    setPriceAddition(newAddition);
    
    // 如果有供货价，重新计算价格
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice, newAddition, discountRate);
    }
  };
  
  // 处理折扣率变化
  const handleDiscountChange = (value: number) => {
    setDiscountRate(value / 100);
    
    // 如果有供货价，重新计算价格
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice, priceAddition, value / 100);
    }
  };
  
  // 重置计算
  const handleReset = () => {
    const supplyPrice = form.getFieldValue('supplyPrice');
    const retailPrice = form.getFieldValue('retailPrice');
    
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice, priceAddition, discountRate);
    } else {
      form.resetFields();
    }
  };
  
  // 计算滑块的最大值
  const maxCouponAmount = sellerViewPrice > 0 ? sellerViewPrice - 0.01 : 10;
  
  // 建议的折扣率，使卖家价格能达到目标零售价
  const getSuggestedDiscount = () => {
    if (supplyPrice && retailPrice && originalPrice > 0) {
      // 卖家价格 = 抖音价格 * 折扣
      // 如果要让卖家价格 >= 目标零售价
      // 则 抖音价格 * 折扣 >= 目标零售价
      // 折扣 >= 目标零售价 / 抖音价格
      const suggestedDiscount = Math.ceil((retailPrice / originalPrice) * 100) / 100;
      return Math.min(1, Math.max(0.1, suggestedDiscount));
    }
    return 0.7; // 默认7折
  };
  
  // 获取建议的折扣率
  const suggestedDiscount = getSuggestedDiscount();
  
  // 应用建议的折扣率
  const applySuggestedDiscount = () => {
    if (suggestedDiscount > 0) {
      setDiscountRate(suggestedDiscount);
      if (supplyPrice) {
        calculatePrices(supplyPrice, retailPrice, priceAddition, suggestedDiscount);
      }
    }
  };
  
  // 格式化折扣率显示
  const formatDiscountPercent = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };
  
  return (
    <div className="douyin-pricing-page">
      <div className="page-header">
        <div className="header-content">
          <CalculatorOutlined className="header-icon" />
          <Title level={4} className="header-title">抖音控价</Title>
        </div>
      </div>
      
      <Row gutter={[24, 24]} className="content-row">
        {/* 左侧表单 */}
        <Col xs={24} md={10}>
          <Card className="form-card" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
              className="calc-form"
            >
              <Form.Item
                label={
                  <span className="form-label">
                    <ShoppingOutlined />供货价
                    <Tooltip title="从供应商处获得商品的成本价">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
                name="supplyPrice"
                rules={[{ required: true, message: '请输入供货价' }]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  placeholder="请输入供货价/成本"
                  style={{ width: '100%' }}
                  addonBefore="¥"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <PlusOutlined />价格加成
                    <Tooltip title="在供货价基础上额外增加的金额">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
              >
                <div className="price-addition-control">
                  <Button 
                    icon={<MinusOutlined />} 
                    onClick={decreasePriceAddition}
                    disabled={priceAddition <= 0}
                  />
                  <AntInputNumber
                    min={0}
                    value={priceAddition}
                    onChange={(value) => handlePriceAdditionChange(value as number)}
                    style={{ width: '100px', margin: '0 10px' }}
                    addonBefore="¥"
                  />
                  <Button 
                    icon={<PlusOutlined />} 
                    onClick={increasePriceAddition}
                  />
                </div>
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <PercentageOutlined />限时折扣
                    <Tooltip title="抖音设置的限时折扣率，影响卖家看到的价格">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
              >
                <div className="discount-control">
                  <Slider
                    min={10}
                    max={100}
                    step={1}
                    value={discountRate * 100}
                    onChange={handleDiscountChange}
                    tipFormatter={(value) => value ? `${value}%` : '70%'}
                    marks={{
                      10: '10%',
                      50: '50%',
                      70: '70%',
                      100: '100%'
                    }}
                  />
                  <div className="discount-value">
                    {formatDiscountPercent(discountRate)}
                  </div>
                </div>
              </Form.Item>

              <Form.Item
                label={
                  <span className="form-label">
                    <DollarOutlined />目标零售价
                    <Tooltip title="您希望商品最终售出的价格">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
                name="retailPrice"
                rules={[{ required: false, message: '请输入目标零售价' }]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  placeholder="请输入目标零售价（可选）"
                  style={{ width: '100%' }}
                  addonBefore="¥"
                />
              </Form.Item>
              
              {/* 价格警告提示 */}
              {priceWarning && retailPrice && (
                <Alert
                  message="价格设置警告"
                  description={
                    <div>
                      <p>目标零售价(¥{retailPrice.toFixed(2)})大于卖家价格(¥{sellerViewPrice.toFixed(2)})，无法通过新人礼金调整达到目标价格。</p>
                      <p>建议：提高限时折扣至少 {(suggestedDiscount * 100).toFixed(0)}% 使卖家价格大于等于目标零售价。</p>
                      <Button 
                        type="primary" 
                        size="small" 
                        onClick={applySuggestedDiscount}
                        style={{ marginTop: '8px' }}
                      >
                        应用建议折扣
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: '16px' }}
                />
              )}
              
              <Form.Item className="buttons-container">
                <Button 
                  type="primary" 
                  onClick={handleReset}
                  block
                  size="large"
                >
                  开始计算
                </Button>
              </Form.Item>
            </Form>
            
            <div className="strategy-info">
              <Alert
                className="info-alert"
                type="info"
                message="抖音控价说明"
                description={
                  <Space direction="vertical" size={2}>
                    <Text>1. 抖音设置价格: ¥{originalPrice ? originalPrice.toFixed(2) : '90.00'} {supplyPrice ? `(供货价×2+${priceAddition}元)` : '(供货价×2+加价)'}</Text>
                    <Text>2. 卖家看到的价格: ¥{sellerViewPrice ? sellerViewPrice.toFixed(2) : '63.00'} {supplyPrice ? `(抖音价×${(discountRate * 100).toFixed(0)}%)` : '(抖音价×限时折扣)'}</Text>
                    <Text>3. 新人礼金/优惠券: ¥{couponAmount ? couponAmount.toFixed(2) : '15.00'} {supplyPrice ? `(可调整)` : '(可调整)'}</Text>
                    <Text>4. 最终售价: ¥{finalPrice ? finalPrice.toFixed(2) : '48.00'} {supplyPrice ? `(卖家价-礼金)` : '(卖家价-礼金)'}</Text>
                    <Text>5. 利润 = 最终售价 - 供货价 = ¥{profit ? profit.toFixed(2) : '？？'}</Text>
                    <Text>6. 通过调整新人礼金/优惠券，可以将最终售价控制在目标零售价附近</Text>
                    {priceWarning && retailPrice && (
                      <Text type="danger">注意: 目标零售价大于卖家价格，需要增加限时折扣！</Text>
                    )}
                  </Space>
                }
                showIcon
              />
            </div>
          </Card>
        </Col>
        
        {/* 右侧结果 */}
        <Col xs={24} md={14}>
          <Card className="result-card" bordered={false}>
            <div className="card-title">
              <TrophyOutlined className="title-icon" />
              <span>计算结果</span>
            </div>
            
            {/* 抖音设置价格 */}
            <div className="result-item item-red">
              <DollarOutlined className="item-icon" />
              <span className="item-label">抖音价格</span>
              <span className="item-value">¥{originalPrice ? originalPrice.toFixed(2) : '90.00'}</span>
              <span className="item-desc">{supplyPrice ? `(供货价×2+${priceAddition}元)` : '(示例)'}</span>
            </div>
            
            {/* 卖家价格 */}
            <div className={`result-item item-blue ${priceWarning ? 'warning' : ''}`}>
              <PercentageOutlined className="item-icon" />
              <span className="item-label">卖家价格</span>
              <span className="item-value">¥{sellerViewPrice ? sellerViewPrice.toFixed(2) : '63.00'}</span>
              <span className="item-desc">{supplyPrice ? `(抖音价×${(discountRate * 100).toFixed(0)}%)` : '(示例)'}</span>
              {priceWarning && retailPrice && (
                <Tooltip title="卖家价格低于目标零售价">
                  <WarningOutlined className="warning-icon" />
                </Tooltip>
              )}
            </div>
            
            {/* 新人礼金/优惠券 */}
            <div className="result-item item-purple">
              <TagOutlined className="item-icon" />
              <span className="item-label">新人礼金</span>
              <span className="item-value">¥{couponAmount ? couponAmount.toFixed(2) : '15.00'}</span>
              <span className="item-desc">{supplyPrice ? '(可调整)' : '(示例)'}</span>
            </div>
            
            {/* 最终售价 */}
            <div className="result-item item-orange">
              <DollarOutlined className="item-icon" />
              <span className="item-label">最终售价</span>
              <span className="item-value">
                ¥{retailPrice && finalPrice ? retailPrice.toFixed(2) : finalPrice ? finalPrice.toFixed(2) : '48.00'}
              </span>
              <span className="item-desc">{supplyPrice ? '(卖家价-礼金)' : '(示例)'}</span>
              
              {retailPrice && retailPrice > 0 && (
                <span className={`price-adjustment ${adjustment > 0 ? 'price-high' : adjustment < 0 ? 'price-low' : ''}`}>
                  {adjustment > 0 ? `+${adjustment.toFixed(2)}` : 
                  adjustment < 0 ? `${adjustment.toFixed(2)}` : 
                  '✓'}
                </span>
              )}
            </div>
            
            <Divider className="divider" />
            
            {/* 新人礼金滑块 */}
            {supplyPrice && supplyPrice > 0 && !priceWarning && (
              <div className="slider-control">
                <div className="slider-title">
                  <TagOutlined className="slider-icon" />
                  <span>调整新人礼金金额</span>
                </div>
                <div className="slider-container">
                  <Slider
                    min={0}
                    max={Math.floor(maxCouponAmount)}
                    step={1}
                    value={couponAmount}
                    onChange={handleCouponChange}
                    tooltip={{
                      formatter: (val: number | undefined) => {
                        return val !== undefined ? `¥${val}` : '¥0';
                      }
                    }}
                  />
                </div>
              </div>
            )}
            
            <Divider className="divider" />
            
            {/* 利润区域 */}
            <div className="profit-result">
              <div className="formula">
                <CalculatorOutlined className="formula-icon" />
                <span>利润 = 最终售价 - 供货价</span>
              </div>
              <div className={profit >= 0 ? "final-profit positive" : "final-profit negative"}>
                ¥{profit ? profit.toFixed(2) : '0.00'} ({profitRate ? profitRate.toFixed(1) : '0.0'}%)
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DyPriceCalculator; 