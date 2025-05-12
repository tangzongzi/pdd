import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip, Slider, Space } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  TagOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import './index.less';

const { Title, Paragraph } = Typography;

// 抖音价格计算器组件
const DyPriceCalculator: React.FC = () => {
  // 状态定义
  const [supplyPrice, setSupplyPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0); // 抖音设置价格
  const [sellerViewPrice, setSellerViewPrice] = useState<number>(0); // 卖家看到的价格
  const [couponAmount, setCouponAmount] = useState<number>(0); // 新人礼金
  const [finalPrice, setFinalPrice] = useState<number>(0); // 最终售价
  const [adjustment, setAdjustment] = useState<number>(0); // 调整金额
  
  // 当供货价或零售价改变时，重新计算价格
  useEffect(() => {
    if (supplyPrice > 0) {
      // 根据公式计算抖音设置价格: 供货价 * 3
      const calculatedOriginalPrice = Math.round(supplyPrice * 3 * 100) / 100;
      setOriginalPrice(calculatedOriginalPrice);
      
      // 计算卖家看到的价格: 抖音设置价格 * 0.5
      const calculatedSellerViewPrice = Math.round((calculatedOriginalPrice * 0.5) * 100) / 100;
      setSellerViewPrice(calculatedSellerViewPrice);
      
      if (retailPrice > 0) {
        // 计算所需新人礼金：使最终售价等于目标零售价
        // 新人礼金 = 卖家看到的价格 - 目标零售价
        const recommendedCoupon = Math.round((calculatedSellerViewPrice - retailPrice) * 100) / 100;
        setCouponAmount(recommendedCoupon > 0 ? recommendedCoupon : 0);
        
        // 设置最终售价（等于目标零售价）
        setFinalPrice(retailPrice);
        
        // 计算价格差额
        const calculatedAdjustment = Math.round((calculatedSellerViewPrice - recommendedCoupon - retailPrice) * 100) / 100;
        setAdjustment(calculatedAdjustment);
      } else {
        // 如果没有设置零售价，则最终售价为卖家看到的价格
        setFinalPrice(calculatedSellerViewPrice);
        setCouponAmount(0);
        setAdjustment(0);
      }
    }
  }, [supplyPrice, retailPrice]);
  
  // 当优惠券金额改变时，更新最终售价
  useEffect(() => {
    if (sellerViewPrice > 0) {
      // 计算最终售价（扣除新人礼金）
      const calculatedFinalPrice = Math.round((sellerViewPrice - couponAmount) * 100) / 100;
      setFinalPrice(calculatedFinalPrice > 0 ? calculatedFinalPrice : 0);
      
      // 更新价格差额
      if (retailPrice > 0) {
        const calculatedAdjustment = Math.round((finalPrice - retailPrice) * 100) / 100;
        setAdjustment(calculatedAdjustment);
      }
    }
  }, [couponAmount, sellerViewPrice, retailPrice, finalPrice]);
  
  // 处理供货价变化
  const handleSupplyPriceChange = (value: number | null) => {
    setSupplyPrice(value || 0);
  };
  
  // 处理零售价变化
  const handleRetailPriceChange = (value: number | null) => {
    setRetailPrice(value || 0);
  };
  
  // 处理原始价格手动调整
  const handleOriginalPriceChange = (value: number | null) => {
    setOriginalPrice(value || 0);
    
    // 更新卖家看到的价格
    const newValue = value || 0;
    const calculatedSellerViewPrice = Math.round((newValue * 0.5) * 100) / 100;
    setSellerViewPrice(calculatedSellerViewPrice);
  };
  
  // 处理新人礼金变化
  const handleCouponAmountChange = (value: number | null) => {
    const newValue = value || 0;
    setCouponAmount(newValue);
  };
  
  // 优惠券滑块变化处理函数
  const handleCouponSliderChange = (value: number) => {
    setCouponAmount(value);
  };
  
  // 计算滑块的最大值
  const maxCouponAmount = sellerViewPrice > 0 ? sellerViewPrice : 10;
  
  return (
    <div className="dy-price-calculator">
      <div className="calculator-header">
        <TagOutlined className="calculator-icon" /> 
        <span className="calculator-title">抖音价格计算器</span>
      </div>
      
      <Form layout="vertical" className="calculator-form">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  供货价（元）
                  <Tooltip title="您从供应商处获得商品的成本价">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="输入供货价"
                value={supplyPrice}
                onChange={handleSupplyPriceChange}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-input"
                size="middle"
                style={{ width: '100%' }}
              />
              <div className="input-example">例如：23元</div>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  目标零售价（元）
                  <Tooltip title="您希望消费者最终购买的价格">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="输入目标零售价"
                value={retailPrice}
                onChange={handleRetailPriceChange}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-input"
                size="middle"
                style={{ width: '100%' }}
              />
              <div className="input-example">例如：29.9元</div>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider className="section-divider" />
        
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  抖音设置价格（元）
                  <Tooltip title="在抖音平台上设置的原始价格，计算公式：供货价×3">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="自动计算"
                value={originalPrice}
                onChange={handleOriginalPriceChange}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-result"
                size="middle"
                style={{ width: '100%' }}
              />
              <div className="formula-text">计算公式：供货价×3</div>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  卖家看到的价格（元）
                  <Tooltip title="卖家在未扣除新人礼金时看到的价格，计算公式：抖音设置价格×0.5">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                disabled
                placeholder="自动计算"
                value={sellerViewPrice}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-result"
                size="middle"
                style={{ width: '100%' }}
              />
              <div className="formula-text">计算公式：抖音设置价格×0.5</div>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider className="section-divider" />
        
        <Form.Item
          label={
            <span className="input-label">
              新人礼金（元）
              <Tooltip title="平台优惠券金额，用于调整最终售价接近目标零售价">
                <InfoCircleOutlined className="info-icon" />
              </Tooltip>
            </span>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <InputNumber
              min={0}
              max={sellerViewPrice}
              step={0.1}
              placeholder="自动计算"
              value={couponAmount}
              onChange={handleCouponAmountChange}
              prefix={<TagOutlined />}
              precision={2}
              className="coupon-input"
              size="middle"
              style={{ width: '100%' }}
            />
            <Slider
              min={0}
              max={maxCouponAmount > 0 ? maxCouponAmount : 10}
              step={0.1}
              value={couponAmount}
              onChange={handleCouponSliderChange}
              tooltip={{ formatter: (value) => `${value}元` }}
              className="coupon-slider"
            />
          </Space>
        </Form.Item>
      </Form>
      
      <div className="results-section">
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <div className="result-card price-card">
              <div className="result-title">最终售价</div>
              <div className="result-value">¥{finalPrice.toFixed(2)}</div>
              <div className="result-formula">
                卖家看到的价格 - 新人礼金 = 最终售价<br />
                {sellerViewPrice.toFixed(2)} - {couponAmount.toFixed(2)} = {finalPrice.toFixed(2)}
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="result-card comparison-card">
              <div className="result-title">价格比较</div>
              <div className={`price-diff ${Math.abs(finalPrice - retailPrice) < 0.01 ? 'match' : 'mismatch'}`}>
                {Math.abs(finalPrice - retailPrice) < 0.01 ? 
                  <span>完全匹配 ✓</span> : 
                  <span>相差: ¥{Math.abs(finalPrice - retailPrice).toFixed(2)}</span>
                }
              </div>
              <div className="price-details">
                <div>目标零售价: <span>¥{retailPrice.toFixed(2)}</span></div>
                <div>最终售价: <span>¥{finalPrice.toFixed(2)}</span></div>
                <div>卖家看到的价格: <span>¥{sellerViewPrice.toFixed(2)}</span></div>
                <div>价格差额: <span className={adjustment > 0 ? 'profit' : (adjustment < 0 ? 'loss' : '')}>
                  {adjustment > 0 ? '+' : ''}{adjustment.toFixed(2)}
                </span></div>
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="result-card profit-card">
              <div className="result-title">预计利润</div>
              <div className={`profit-amount ${finalPrice - supplyPrice > 0 ? 'profit' : 'loss'}`}>
                {finalPrice - supplyPrice > 0 ? '+' : ''}
                ¥{(finalPrice - supplyPrice).toFixed(2)}
              </div>
              <div className="profit-rate">
                利润率：
                <span className={finalPrice > 0 && supplyPrice > 0 ? ((finalPrice - supplyPrice) / supplyPrice > 0 ? 'profit' : 'loss') : ''}>
                  {finalPrice > 0 && supplyPrice > 0 ? 
                    `${(((finalPrice - supplyPrice) / supplyPrice) * 100).toFixed(1)}%` : 
                    '0.0%'}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      <Alert
        type="info"
        showIcon
        message={
          <div className="pricing-guide">
            <div className="guide-title">
              <InfoCircleOutlined /> 抖音定价说明
            </div>
            <ul className="guide-list">
              <li>抖音设置价格 = <b>供货价 × 3</b></li>
              <li>卖家看到的价格 = <b>抖音设置价格 × 0.5</b></li>
              <li>最终售价 = <b>卖家看到的价格 - 新人礼金</b></li>
              <li>新人礼金建议值 = <b>卖家看到的价格 - 目标零售价</b></li>
              <li>调整新人礼金，使最终售价尽可能接近目标零售价</li>
              <li>利润 = 最终售价 - 供货价</li>
              <li>利润率 = 利润 ÷ 供货价 × 100%</li>
            </ul>
          </div>
        }
        className="pricing-alert"
      />
    </div>
  );
};

// 主组件
export const DyPricing: React.FC = () => {
  // 初始化时重置所有值
  useEffect(() => {
    // 获取状态方法
    const setState = useCalculatorStore.setState;
    
    // 重置所有输入值
    setState({
      supplyPrice: 0,
      groupPrice: 0,
      priceAddition: 6,
      marketMaxPrice: 0,
      
      // 重置计算结果
      backendGroupPrice: 0,
      singlePrice: 0,
      groupPlatformFee: 0,
      singlePlatformFee: 0,
      groupProfit: 0,
      singleProfit: 0,
      discountPrice: 0,
      discountProfit: 0,
      currentProfitRate: 0.1
    });
  }, []);
  
  return (
    <div className="calculator-container">
      <Card className="calculator-card compact-card" bordered={false}>
        <div className="page-header compact-header">
          <CalculatorOutlined className="header-icon" />
          <div className="header-content">
            <Title level={4} className="header-title">抖音定价</Title>
            <Paragraph className="header-subtitle">快速计算抖音价格和优惠券设置，轻松达到目标零售价</Paragraph>
          </div>
        </div>
        
        <Divider className="header-divider" />
        
        <DyPriceCalculator />
      </Card>
    </div>
  );
}; 