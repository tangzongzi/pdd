import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip, Slider, Space } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  TagOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform } from '@/types/history';
import './index.less';

const { Title, Paragraph, Text } = Typography;

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
  const { addRecord } = useHistoryStore();
  
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

        // 添加到历史记录
        addRecord({
          type: CalculationType.DOUYIN_PRICE,
          platform: Platform.DOUYIN,
          supplyPrice,
          originalPrice: calculatedOriginalPrice,
          sellerViewPrice: calculatedSellerViewPrice,
          couponAmount: recommendedCoupon > 0 ? recommendedCoupon : 0,
          finalPrice: retailPrice,
          profit: retailPrice - supplyPrice,
          platformFee: 0, // 为满足类型要求
        } as any);
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
        
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  新人礼金/优惠券（元）
                  <Tooltip title="设置的优惠券金额，新人在领取后可抵扣此金额">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={0}
                max={sellerViewPrice}
                step={0.01}
                placeholder="自动计算/手动调整"
                value={couponAmount}
                onChange={handleCouponAmountChange}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-input"
                size="middle"
                style={{ width: '100%' }}
              />
              <Slider
                min={0}
                max={maxCouponAmount}
                step={0.01}
                value={couponAmount}
                onChange={handleCouponSliderChange}
                tooltipVisible={false}
                disabled={sellerViewPrice <= 0}
              />
              <div className="formula-text">推荐值：卖家价格 - 目标零售价</div>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="input-label">
                  最终售价（元）
                  <Tooltip title="消费者实际支付的价格 = 卖家价格 - 新人礼金">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                disabled
                placeholder="自动计算"
                value={finalPrice}
                prefix={<DollarOutlined />}
                precision={2}
                className="price-result final-price"
                size="middle"
                style={{ width: '100%' }}
              />
              <div className="formula-text">计算公式：卖家价格 - 新人礼金</div>
              {retailPrice > 0 && (
                <div className={`price-adjustment ${adjustment > 0 ? 'price-high' : adjustment < 0 ? 'price-low' : ''}`}>
                  {adjustment > 0 ? `高于目标价：+${adjustment.toFixed(2)}元` : 
                   adjustment < 0 ? `低于目标价：${adjustment.toFixed(2)}元` : 
                   '价格符合目标'}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
        
        <Divider className="section-divider" />
        
        <div className="profit-section">
          <Card title="利润分析" bordered={false} className="profit-card">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="profit-item">
                  <span className="profit-label">利润金额：</span>
                  <span className={`profit-value ${finalPrice - supplyPrice >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                    ¥{(finalPrice - supplyPrice).toFixed(2)}
                  </span>
                </div>
                <div className="profit-formula">计算公式：最终售价 - 供货价</div>
              </Col>
              <Col xs={24} md={12}>
                <div className="profit-item">
                  <span className="profit-label">利润率：</span>
                  <span className={`profit-value ${supplyPrice > 0 && (finalPrice - supplyPrice) / supplyPrice * 100 >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                    {supplyPrice > 0 ? ((finalPrice - supplyPrice) / supplyPrice * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="profit-formula">计算公式：利润 ÷ 供货价 × 100%</div>
              </Col>
            </Row>
          </Card>
        </div>
        
        <Alert
          message="计算器说明"
          description={
            <Space direction="vertical">
              <Text>1. 抖音设置价格 = 供货价 × 3，这是您在抖音后台设置的价格</Text>
              <Text>2. 卖家看到的价格 = 抖音设置价格 × 0.5，这是卖家实际看到的价格</Text>
              <Text>3. 通过设置合适的新人礼金/优惠券，可以将最终售价控制在目标零售价附近</Text>
              <Text>4. 利润 = 最终售价 - 供货价</Text>
            </Space>
          }
          type="info"
          style={{ marginTop: '20px' }}
        />
      </Form>
    </div>
  );
};

export const DyPricing: React.FC = () => {
  return (
    <div className="dy-pricing-page">
      <DyPriceCalculator />
    </div>
  );
};

export default DyPricing; 