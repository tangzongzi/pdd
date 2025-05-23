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
  const [showResults, setShowResults] = useState<boolean>(false);
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
    } else {
      setShowResults(false);
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

  return (
    <div className="douyin-coupon-page">
      <Card title="抖音外漏优惠券计算器" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={valuesChange}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              label={
                <span className="input-label">
                  供应商价格（元）
                  <Tooltip title="从供应商处获得商品的成本价">
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
                  期望成交价（元）
                  <Tooltip title="您希望用户最终购买的价格">
                    <InfoCircleOutlined className="info-icon" />
                  </Tooltip>
                </span>
              }
              name="expectedPrice"
              rules={[{ required: true, message: '请输入期望售价' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                precision={2}
                placeholder="请输入期望售价(成本+利润)"
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

        {showResults ? (
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
                        在抖音后台设置此上架价格
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
                          valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 'bold' }}
                        />
                        <div className="discount-description">
                          开启限时折扣活动时的价格
                        </div>
                      </Card>
                    </Col>
                  )}

                  {/* 优惠券金额 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="coupon-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="coupon-title">
                            <TagOutlined className="coupon-icon" />
                            <span>优惠券金额</span>
                          </div>
                        }
                        value={couponAmount}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="coupon-description">
                        设置此金额的全店通用券
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 新人价格 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="new-user-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="new-user-title">
                            <UserOutlined className="new-user-icon" />
                            <span>新人到手价</span>
                          </div>
                        }
                        value={newUserPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="new-user-description">
                        新用户领券后的到手价
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
                            <ShoppingOutlined className="profit-icon" />
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
                      <div className="profit-description">
                        新人到手价 - 供货价
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 利润率 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="profit-rate-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="profit-rate-title">
                            <CalculatorOutlined className="profit-rate-icon" />
                            <span>利润率</span>
                          </div>
                        }
                        value={profitRate}
                        precision={1}
                        suffix="%"
                        valueStyle={{ 
                          color: profitRate >= 0 ? '#722ed1' : '#ff4d4f', 
                          fontSize: '28px', 
                          fontWeight: 'bold' 
                        }}
                      />
                      <div className="profit-rate-description">
                        利润 ÷ 供货价 × 100%
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
              
              <Divider style={{ margin: '24px 0 16px' }} />
              
              <Alert
                className="info-alert"
                type="info"
                message="抖音外漏优惠券说明"
                description={
                  <Space direction="vertical">
                    <Text>1. 在抖音后台将商品价格设置为 ¥{listingPrice.toFixed(2)}</Text>
                    {enableLimitedDiscount && (
                      <Text>2. 开启限时折扣活动，价格设为 ¥{limitedTimePrice.toFixed(2)}（原价的7折）</Text>
                    )}
                    <Text>{enableLimitedDiscount ? '3' : '2'}. 设置全店通用券，金额为 ¥{couponAmount.toFixed(2)}</Text>
                    <Text>{enableLimitedDiscount ? '4' : '3'}. 利用抖音平台自带的新人礼金机制（¥{NEW_USER_DISCOUNT}），最终新人到手价为 ¥{newUserPrice.toFixed(2)}</Text>
                    <Text>{enableLimitedDiscount ? '5' : '4'}. 最终利润 = 新人到手价 - 供货价 = ¥{profit.toFixed(2)}</Text>
                  </Space>
                }
              />
              
              <div className="strategy-explanation">
                <Title level={5} className="strategy-title">
                  <SettingOutlined /> 策略说明
                </Title>
                <Paragraph className="strategy-content">
                  此计算器帮助您设置抖音外漏低价策略。通过设置高于实际期望售价的优惠券，触发抖音外漏低价机制，吸引新客户。同时，利用抖音平台的新人礼金机制，进一步降低新用户的购买门槛。
                </Paragraph>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-container">
            <Empty 
              description="请输入供货价和期望售价获取计算结果" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DouyinCouponCalculator; 