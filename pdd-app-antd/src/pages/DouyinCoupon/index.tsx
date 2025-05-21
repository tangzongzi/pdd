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
  Tooltip
} from 'antd';
import {
  DollarOutlined,
  TagOutlined,
  ShoppingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './index.less';

const { Title, Text, Paragraph } = Typography;

interface FormData {
  supplierPrice: number; // 供货价/成本
  expectedPrice: number; // 期望售价
}

// 默认定价参数
const PRICE_MULTIPLIER = 2; // 200%倍率
const PRICE_ADDITION = 1; // 加1元
const NEW_USER_DISCOUNT = 8; // 新人优惠8元

// 平台扣点比例
const PLATFORM_FEE_RATE = 0.02; // 2%

const DouyinCouponCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0); // 上架价格
  const [couponAmount, setCouponAmount] = useState<number>(0); // 优惠券金额
  const [newUserPrice, setNewUserPrice] = useState<number>(0); // 新人价格
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sellerPrice, setSellerPrice] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [profitRate, setProfitRate] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);

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
    
    // 计算商家价格 = 上架价格 × 0.5
    const calculatedSellerPrice = Math.round(calculatedListingPrice * 0.5 * 100) / 100;
    
    // 计算优惠券金额 = 商家价格 - 期望售价 + 额外金额(确保优惠券金额>期望售价)
    // 这里取1元作为额外金额，可以根据需要调整
    const calculatedCouponAmount = calculatedSellerPrice - expectedPrice + 1;
    
    // 计算新人价格 = 商家价格 - 优惠券金额 - 新人优惠
    const calculatedNewUserPrice = Math.max(0.01, calculatedSellerPrice - calculatedCouponAmount - NEW_USER_DISCOUNT);

    // 计算平台扣点费用
    const calculatedPlatformFee = Math.round((calculatedNewUserPrice * PLATFORM_FEE_RATE) * 100) / 100;

    // 计算利润：新用户价格 - 供应商价格 - 平台扣点
    const calculatedProfit = Math.round((calculatedNewUserPrice - supplierPrice - calculatedPlatformFee) * 100) / 100;

    setFormData(values);
    setListingPrice(calculatedListingPrice);
    setCouponAmount(calculatedCouponAmount);
    setNewUserPrice(calculatedNewUserPrice);
    setSellerPrice(calculatedSellerPrice);
    setProfit(calculatedProfit);
    setPlatformFee(calculatedPlatformFee);

    // 计算利润率：利润 / 供应商价格
    const calculatedProfitRate = supplierPrice > 0 ? (calculatedProfit / supplierPrice) * 100 : 0;
    setProfitRate(Math.round(calculatedProfitRate * 10) / 10);
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
                  
                  {/* 商家价格 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="price-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="price-title">
                            <DollarOutlined className="price-icon" />
                            <span>商家价格</span>
                          </div>
                        }
                        value={sellerPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="price-description">
                        商家看到的价格
                      </div>
                    </Card>
                  </Col>
                  
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
                        设置此金额的满减优惠券
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 老客最终价 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="final-price-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="final-price-title">
                            <ShoppingOutlined className="final-price-icon" />
                            <span>普通客户最终价</span>
                          </div>
                        }
                        value={formData?.expectedPrice || 0}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="final-price-description">
                        优惠后普通客户看到的价格
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 新人最终价 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="new-user-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="new-user-title">
                            <UserOutlined className="new-user-icon" />
                            <span>新人最终价</span>
                          </div>
                        }
                        value={newUserPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="new-user-description">
                        叠加新人优惠后的价格
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 平台扣点 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="platform-fee-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="platform-fee-title">
                            <DollarOutlined className="platform-fee-icon" />
                            <span>平台扣点({PLATFORM_FEE_RATE * 100}%)</span>
                          </div>
                        }
                        value={platformFee}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="platform-fee-description">
                        平台收取的交易手续费
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 实际利润 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="profit-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="profit-title">
                            <TagOutlined className="profit-icon" />
                            <span>实际利润</span>
                          </div>
                        }
                        value={profit}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ 
                          color: profit >= 0 ? '#52c41a' : '#f5222d', 
                          fontSize: '28px', 
                          fontWeight: 'bold' 
                        }}
                      />
                      <div className="profit-description">
                        <div>利润 = 新人价 - 供货价 - 平台扣点</div>
                        <div>利润率：<span className={profitRate >= 0 ? 'profit-positive' : 'profit-negative'}>
                          {profitRate.toFixed(1)}%
                        </span></div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
              
              <Alert
                className="info-alert"
                type="info"
                message="外漏价格策略说明"
                description={
                  <Space direction="vertical">
                    <Text>1. 上架价格已设置为期望售价的{PRICE_MULTIPLIER}倍+{PRICE_ADDITION}元</Text>
                    <Text>2. 优惠券金额高于商品实际期望售价，触发外漏低价机制</Text>
                    <Text>3. 新人价格计算已考虑平台新人券{NEW_USER_DISCOUNT}元</Text>
                    <Text>4. 平台扣点按照最终成交价的{PLATFORM_FEE_RATE * 100}%计算</Text>
                    <Text>5. 实际利润 = 最终成交价 - 供货价 - 平台扣点</Text>
                    <Text>6. 此计算结果仅供参考，实际效果取决于平台当前政策</Text>
                  </Space>
                }
                showIcon
              />
            </div>
          </>
        ) : (
          <div style={{ padding: '40px 0' }}>
            <Empty description="请输入供货价和期望售价获取计算结果" />
          </div>
        )}
      </Card>
    </div>
  );
};

export default DouyinCouponCalculator; 