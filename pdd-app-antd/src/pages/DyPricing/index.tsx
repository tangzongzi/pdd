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
  Button 
} from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  TagOutlined,
  DollarOutlined,
  ShopOutlined,
  PercentageOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform } from '@/types/history';
import './index.less';

const { Title, Text } = Typography;

// 抖音价格计算器组件
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
  const { addRecord } = useHistoryStore();
  
  // 当表单值变化时计算价格
  const handleFormChange = (changedValues: any, allValues: any) => {
    const { supplyPrice, retailPrice } = allValues;
    
    if (supplyPrice) {
      setSupplyPrice(supplyPrice);
      calculatePrices(supplyPrice, retailPrice);
    }
    
    if (retailPrice !== undefined) {
      setRetailPrice(retailPrice);
    }
  };
  
  // 计算所有价格
  const calculatePrices = (supply: number, retail: number | null) => {
    if (supply > 0) {
      // 根据公式计算抖音设置价格: 供货价 * 3
      const calculatedOriginalPrice = Math.round(supply * 3 * 100) / 100;
      setOriginalPrice(calculatedOriginalPrice);
      
      // 计算卖家看到的价格: 抖音设置价格 * 0.5
      const calculatedSellerViewPrice = Math.round((calculatedOriginalPrice * 0.5) * 100) / 100;
      setSellerViewPrice(calculatedSellerViewPrice);
      
      if (retail && retail > 0) {
        // 计算所需新人礼金：使最终售价等于目标零售价
        // 新人礼金 = 卖家看到的价格 - 目标零售价
        const recommendedCoupon = Math.round((calculatedSellerViewPrice - retail) * 100) / 100;
        setCouponAmount(recommendedCoupon > 0 ? recommendedCoupon : 0);
        
        // 设置最终售价（等于目标零售价）
        setFinalPrice(retail);
        
        // 计算价格差额
        const calculatedAdjustment = Math.round((calculatedSellerViewPrice - recommendedCoupon - retail) * 100) / 100;
        setAdjustment(calculatedAdjustment);
        
        // 计算利润
        const calculatedProfit = Math.round((retail - supply) * 100) / 100;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = Math.round((calculatedProfit / supply) * 100 * 10) / 10;
        setProfitRate(calculatedProfitRate);

        // 添加到历史记录
        addRecord({
          type: CalculationType.DOUYIN_PRICE,
          platform: Platform.DOUYIN,
          supplyPrice: supply,
          originalPrice: calculatedOriginalPrice,
          sellerViewPrice: calculatedSellerViewPrice,
          couponAmount: recommendedCoupon > 0 ? recommendedCoupon : 0,
          finalPrice: retail,
          profit: calculatedProfit,
          platformFee: 0, // 为满足类型要求
        } as any);
      } else {
        // 如果没有设置零售价，则最终售价为卖家看到的价格
        setFinalPrice(calculatedSellerViewPrice);
        setCouponAmount(0);
        setAdjustment(0);
        
        // 计算利润
        const calculatedProfit = Math.round((calculatedSellerViewPrice - supply) * 100) / 100;
        setProfit(calculatedProfit);
        
        // 计算利润率
        const calculatedProfitRate = Math.round((calculatedProfit / supply) * 100 * 10) / 10;
        setProfitRate(calculatedProfitRate);
      }
    }
  };
  
  // 当优惠券金额改变时，更新最终售价
  const handleCouponChange = (value: number) => {
    setCouponAmount(value);
    
    if (sellerViewPrice > 0) {
      // 计算最终售价（扣除新人礼金）
      const calculatedFinalPrice = Math.max(0.01, Math.round((sellerViewPrice - value) * 100) / 100);
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
      }
    }
  };
  
  // 处理原始价格手动调整
  const handleOriginalPriceChange = (value: number | null) => {
    if (value !== null) {
      setOriginalPrice(value);
      
      // 更新卖家看到的价格
      const calculatedSellerViewPrice = Math.round((value * 0.5) * 100) / 100;
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
      }
    }
  };
  
  // 重置计算
  const handleReset = () => {
    const supplyPrice = form.getFieldValue('supplyPrice');
    const retailPrice = form.getFieldValue('retailPrice');
    
    if (supplyPrice) {
      calculatePrices(supplyPrice, retailPrice);
    } else {
      form.resetFields();
    }
  };
  
  // 计算滑块的最大值
  const maxCouponAmount = sellerViewPrice > 0 ? sellerViewPrice - 0.01 : 10;
  
  return (
    <div className="douyin-pricing-page">
      <div className="page-header">
        <div className="header-content">
          <CalculatorOutlined className="header-icon" />
          <Title level={4} className="header-title">抖音价格计算器</Title>
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
                    <ShopOutlined />供货价
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
                message="抖音价格计算说明"
                description={
                  <Space direction="vertical" size={2}>
                    <Text>1. 抖音设置价格: ¥{originalPrice ? originalPrice.toFixed(2) : '90.00'} {supplyPrice ? `(供货价×3)` : '(供货价×3)'}</Text>
                    <Text>2. 卖家看到的价格: ¥{sellerViewPrice ? sellerViewPrice.toFixed(2) : '45.00'} {supplyPrice ? `(抖音设置价×0.5)` : '(抖音设置价×0.5)'}</Text>
                    <Text>3. 新人礼金/优惠券: ¥{couponAmount ? couponAmount.toFixed(2) : '15.00'} {supplyPrice ? `(可调整)` : '(可调整)'}</Text>
                    <Text>4. 最终售价: ¥{finalPrice ? finalPrice.toFixed(2) : '30.00'} {supplyPrice ? `(卖家价-礼金)` : '(卖家价-礼金)'}</Text>
                    <Text>5. 利润 = 最终售价 - 供货价 = ¥{profit ? profit.toFixed(2) : '？？'}</Text>
                    <Text>6. 通过调整新人礼金/优惠券，可以将最终售价控制在目标零售价附近</Text>
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
              <span className="item-desc">{supplyPrice ? '(供货价×3)' : '(示例)'}</span>
            </div>
            
            {/* 卖家价格 */}
            <div className="result-item item-blue">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">卖家价格</span>
              <span className="item-value">¥{sellerViewPrice ? sellerViewPrice.toFixed(2) : '45.00'}</span>
              <span className="item-desc">{supplyPrice ? '(抖音价×0.5)' : '(示例)'}</span>
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
              <span className="item-value">¥{finalPrice ? finalPrice.toFixed(2) : '30.00'}</span>
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
            {supplyPrice && supplyPrice > 0 && (
              <div className="slider-control">
                <div className="slider-title">
                  <TagOutlined className="slider-icon" />
                  <span>调整新人礼金金额</span>
                </div>
                <div className="slider-container">
                  <Slider
                    min={0}
                    max={maxCouponAmount}
                    step={0.01}
                    value={couponAmount}
                    onChange={handleCouponChange}
                    tooltip={{
                      formatter: (val: number | undefined) => {
                        return val !== undefined ? `¥${val.toFixed(2)}` : '¥0.00';
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