import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Divider,
  Alert,
  Typography,
  Space,
  Empty,
  Row,
  Col,
  Statistic,
  Button,
  Tooltip,
  Switch
} from 'antd';
import {
  DollarOutlined,
  TagOutlined,
  ShoppingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  SettingOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import './index.less';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform } from '@/types/history';

const { Title, Text, Paragraph } = Typography;

interface FormData {
  supplierPrice: number; // 供货价/成本
  expectedPrice: number; // 期望售价
}

// 默认定价参数
const PRICE_MULTIPLIER = 2; // 200%倍率
const PRICE_ADDITION = 1; // 加1元
const NEW_USER_DISCOUNT = 8; // 新人优惠8元
const LIMITED_DISCOUNT_RATE = 0.7; // 限时7折

const DouyinCouponCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0); // 上架价格
  const [limitedTimePrice, setLimitedTimePrice] = useState<number>(0); // 限时7折价格
  const [couponAmount, setCouponAmount] = useState<number>(0); // 优惠券金额
  const [newUserPrice, setNewUserPrice] = useState<number>(0); // 新人价格
  const [showResults, setShowResults] = useState<boolean>(true); // 默认显示结果区域
  const [sellerPrice, setSellerPrice] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [profitRate, setProfitRate] = useState<number>(0);
  const [enableLimitedDiscount, setEnableLimitedDiscount] = useState<boolean>(true); // 是否启用限时折扣
  const { addRecord } = useHistoryStore();

  // 当表单值变化时自动计算
  const valuesChange = (changedValues: any, allValues: FormData) => {
    if (allValues.supplierPrice && allValues.expectedPrice && 
        allValues.supplierPrice > 0 && allValues.expectedPrice > 0) {
      calculateResults(allValues);
      setShowResults(true);
    }
  };

  const calculateResults = (values: FormData) => {
    const { supplierPrice, expectedPrice } = values;
    
    // 计算上架价格 = 期望售价 × 200% + 1元
    const calculatedListingPrice = Math.ceil(expectedPrice * PRICE_MULTIPLIER + PRICE_ADDITION);
    
    // 计算限时7折价格
    const calculatedLimitedTimePrice = Math.round(calculatedListingPrice * LIMITED_DISCOUNT_RATE * 100) / 100;
    
    // 计算商家价格 = 上架价格 × 0.5 或 限时折扣价格 × 0.5
    const basePrice = enableLimitedDiscount ? calculatedLimitedTimePrice : calculatedListingPrice;
    const calculatedSellerPrice = Math.round(basePrice * 0.5 * 100) / 100;
    
    // 计算优惠券金额 = 商家价格 - 期望售价 + 额外金额(确保优惠券金额>期望售价)
    // 这里取1元作为额外金额，可以根据需要调整
    const calculatedCouponAmount = calculatedSellerPrice - expectedPrice + 1;
    
    // 计算新人价格 = 商家价格 - 优惠券金额 - 新人优惠
    const calculatedNewUserPrice = Math.max(0.01, calculatedSellerPrice - calculatedCouponAmount - NEW_USER_DISCOUNT);

    // 计算利润：新用户价格 - 供应商价格
    const calculatedProfit = Math.round((calculatedNewUserPrice - supplierPrice) * 100) / 100;

    // 添加到历史记录
    addRecord({
      type: CalculationType.DOUYIN_COUPON,
      platform: Platform.DOUYIN,
      supplyPrice: supplierPrice,
      listingPrice: calculatedListingPrice,
      limitedTimePrice: enableLimitedDiscount ? calculatedLimitedTimePrice : undefined,
      couponAmount: calculatedCouponAmount,
      newUserPrice: calculatedNewUserPrice,
      profit: calculatedProfit,
      platformFee: 0, // 为满足类型要求
    } as any);

    setFormData(values);
    setListingPrice(calculatedListingPrice);
    setLimitedTimePrice(calculatedLimitedTimePrice);
    setCouponAmount(calculatedCouponAmount);
    setNewUserPrice(calculatedNewUserPrice);
    setSellerPrice(calculatedSellerPrice);
    setProfit(calculatedProfit);

    // 计算利润率：利润 / 供应商价格
    const calculatedProfitRate = supplierPrice > 0 ? (calculatedProfit / supplierPrice) * 100 : 0;
    setProfitRate(Math.round(calculatedProfitRate * 10) / 10);
  };

  // 切换限时折扣状态
  const handleToggleLimitedDiscount = (checked: boolean) => {
    setEnableLimitedDiscount(checked);
    if (formData) {
      calculateResults(formData);
    }
  };

  // 重置计算
  const handleReset = () => {
    const supplierPrice = form.getFieldValue('supplierPrice');
    const expectedPrice = form.getFieldValue('expectedPrice');
    
    if (supplierPrice && expectedPrice && 
        supplierPrice > 0 && expectedPrice > 0) {
      calculateResults({
        supplierPrice,
        expectedPrice
      });
    } else {
      form.resetFields();
      setShowResults(true);
    }
  };

  return (
    <div className="douyin-coupon-page">
      <div className="page-header">
        <Title level={4} className="header-title">
          <CalculatorOutlined className="header-icon" />
          抖音外漏优惠券计算器
        </Title>
      </div>
      
      <Row gutter={[24, 24]} className="content-row">
        {/* 左侧表单 */}
        <Col xs={24} md={10}>
          <Card className="form-card" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={valuesChange}
              className="calc-form"
        >
            <Form.Item
              label={
                  <span className="form-label">
                    <DollarOutlined />供应商价格
                  <Tooltip title="从供应商处获得商品的成本价">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
              name="supplierPrice"
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
                    <ShoppingOutlined />期望成交价
                  <Tooltip title="您希望用户最终购买的价格">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
              name="expectedPrice"
              rules={[{ required: true, message: '请输入期望售价' }]}
            >
              <InputNumber
                min={0.01}
                precision={2}
                placeholder="请输入期望售价(成本+利润)"
                  style={{ width: '100%' }}
                addonBefore="¥"
              />
            </Form.Item>
            
              <Form.Item className="buttons-container">
                <Button 
                  type="primary" 
                  onClick={handleReset}
                  block
                >
                  开始计算
                </Button>
            </Form.Item>
        </Form>

            <div className="strategy-info">
              <Alert
                className="info-alert"
                type="info"
                message="抖音外漏优惠券说明"
                description={
                  <Space direction="vertical" size={2}>
                    <Text>1. 上架价格: ¥{listingPrice ? listingPrice.toFixed(2) : '30.00'} {formData ? `(期望价×2+1元)` : '(期望价×2+1元)'}</Text>
                    <Text>2. 限时7折价: ¥{limitedTimePrice ? limitedTimePrice.toFixed(2) : '21.00'} {formData ? `(上架价×0.7)` : '(上架价×0.7)'}</Text>
                    <Text>3. 优惠券金额: ¥{couponAmount ? couponAmount.toFixed(2) : '3.50'} {formData ? `(确保领券后价格接近期望价)` : '(确保领券后价格接近期望价)'}</Text>
                    <Text>4. 新人到手价: ¥{newUserPrice ? newUserPrice.toFixed(2) : '6.00'} {formData ? `(含8元新人礼金)` : '(含8元新人礼金)'}</Text>
                    <Text>5. 最终利润 = 新人到手价 - 供货价 = ¥{profit ? profit.toFixed(2) : '？？'}</Text>
                    <Text>6. 建议：新品前5-10天使用超低价引流，之后关闭新人礼金转为正常价格</Text>
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
              <CalculatorOutlined className="title-icon" />
              <span>计算结果</span>
            </div>
            
            {/* 上架价格 */}
            <div className="result-item item-red">
              <DollarOutlined className="item-icon" />
              <span className="item-label">上架价格</span>
              <span className="item-value">¥{listingPrice ? listingPrice.toFixed(2) : '30.00'}</span>
              <span className="item-desc">{formData ? `(期望价×2+1元)` : '(示例)'}</span>
            </div>
            
            {/* 限时折扣价格 */}
            <div className="result-item item-blue">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">限时7折</span>
              <span className="item-value">¥{limitedTimePrice ? limitedTimePrice.toFixed(2) : '21.00'}</span>
              <span className="item-desc">{formData ? '(上架价×0.7)' : '(示例)'}</span>
              <div className="switch-container">
                <Switch 
                  checked={enableLimitedDiscount} 
                  onChange={handleToggleLimitedDiscount}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  size="small"
                />
              </div>
            </div>
            
            {/* 优惠券金额 */}
            <div className="result-item item-purple">
              <TagOutlined className="item-icon" />
              <span className="item-label">优惠券</span>
              <span className="item-value">¥{couponAmount ? couponAmount.toFixed(2) : '3.50'}</span>
              <span className="item-desc">{formData ? '(自动计算)' : '(示例)'}</span>
            </div>
            
            {/* 新人价格 */}
            <div className="result-item item-orange">
              <UserOutlined className="item-icon" />
              <span className="item-label">新人价格</span>
              <span className="item-value">¥{newUserPrice ? newUserPrice.toFixed(2) : '9.50'}</span>
              <span className="item-desc">{formData ? '(含8元新人礼金)' : '(示例)'}</span>
            </div>
            
            <Divider className="divider" />
            
            {/* 利润区域 */}
            <div className="profit-result">
              <div className="formula">
                <CalculatorOutlined className="formula-icon" />
                <span>利润 = 新人到手价 - 供货价</span>
              </div>
              <div className={profit >= 0 ? "final-profit positive" : "final-profit negative"}>
                ¥{profit ? profit.toFixed(2) : '0.00'} ({profitRate ? profitRate.toFixed(1) : '0.0'}%)
              </div>
            </div>
            
            {!showResults && (
              <div className="empty-result">
                <Alert
                  message="请输入供货价和期望售价获取计算结果"
                  type="info"
                  showIcon
            />
          </div>
        )}
      </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DouyinCouponCalculator; 