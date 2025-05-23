import React, { useState } from 'react';
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
} from 'antd';
import { DollarOutlined, PercentageOutlined, LineChartOutlined, RiseOutlined } from '@ant-design/icons';
import './index.less';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform } from '@/types/history';

const { Title, Text } = Typography;

interface FormData {
  supplierPrice: number;
  targetPrice: number;
}

// 固定的抖音折扣率
const DEFAULT_DISCOUNT_RATE = 46;

const DouyinDiscount: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [douyinSettingPrice, setDouyinSettingPrice] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(DEFAULT_DISCOUNT_RATE);
  const [discountDisplay, setDiscountDisplay] = useState<string>(`${DEFAULT_DISCOUNT_RATE}% (${DEFAULT_DISCOUNT_RATE/10}折)`);
  const [profit, setProfit] = useState<number>(0);
  const [profitRate, setProfitRate] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const { addRecord } = useHistoryStore();

  // 当表单值变化时自动计算
  const valuesChange = (changedValues: any, allValues: FormData) => {
    if (allValues.targetPrice && allValues.targetPrice > 0 && 
        allValues.supplierPrice !== undefined) {
      calculateResults(allValues);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const calculateResults = (values: FormData) => {
    const { supplierPrice, targetPrice } = values;
    
    // 计算抖音设置价格 = 目标零售价 / (折扣率/100)
    const calculatedSettingPrice = targetPrice / (DEFAULT_DISCOUNT_RATE / 100);
    
    // 计算利润 = 目标零售价 - 供货价
    const calculatedProfit = targetPrice - supplierPrice;
    
    // 利润率 = 利润 / 供货价 * 100%
    const calculatedProfitRate = supplierPrice > 0 
      ? (calculatedProfit / supplierPrice) * 100 
      : 0;

    setFormData(values);
    setDouyinSettingPrice(calculatedSettingPrice);
    setDiscountRate(DEFAULT_DISCOUNT_RATE);
    setDiscountDisplay(`${DEFAULT_DISCOUNT_RATE}% (${DEFAULT_DISCOUNT_RATE/10}折)`);
    setProfit(calculatedProfit);
    setProfitRate(calculatedProfitRate);

    // 添加到历史记录
    addRecord({
      type: CalculationType.DOUYIN_DISCOUNT,
      platform: Platform.DOUYIN,
      supplyPrice: supplierPrice,
      originalPrice: targetPrice,
      discountRate: DEFAULT_DISCOUNT_RATE,
      discountPrice: calculatedSettingPrice,
      profit: calculatedProfit,
      platformFee: 0, // 平台扣点为0
    } as any);
  };

  return (
    <div className="douyin-discount-page">
      <Card title="抖音折扣价计算器" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={valuesChange}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              label="供货价(¥)"
              name="supplierPrice"
              rules={[{ required: true, message: '请输入供货价' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入供货价"
                addonBefore="¥"
              />
            </Form.Item>

            <Form.Item
              label="目标零售价(¥)"
              name="targetPrice"
              rules={[{ required: true, message: '请输入目标零售价' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入目标零售价"
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
                  {/* 抖音设置价格 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="price-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="price-title">
                            <DollarOutlined className="price-icon" />
                            <span>抖音设置价格</span>
                          </div>
                        }
                        value={douyinSettingPrice}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="price-description">
                        在抖音后台设置此价格
                      </div>
                    </Card>
                  </Col>
                  
                  {/* 抖音折扣率 */}
                  <Col xs={24} sm={12}>
                    <Card 
                      className="discount-card" 
                      bordered={false}
                    >
                      <Statistic
                        title={
                          <div className="discount-title">
                            <PercentageOutlined className="discount-icon" />
                            <span>抖音折扣率</span>
                          </div>
                        }
                        value={discountRate}
                        suffix="%"
                        valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="discount-value">
                        {`${DEFAULT_DISCOUNT_RATE/10}折`}
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
                            <LineChartOutlined className="profit-icon" />
                            <span>利润</span>
                          </div>
                        }
                        value={profit}
                        precision={2}
                        prefix="¥"
                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="profit-description">
                        目标零售价 - 供货价
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
                            <RiseOutlined className="profit-rate-icon" />
                            <span>利润率</span>
                          </div>
                        }
                        value={profitRate}
                        precision={2}
                        suffix="%"
                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                      />
                      <div className="profit-rate-description">
                        利润 ÷ 供货价 × 100%
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
              
              <Alert
                className="info-alert"
                type="info"
                message="抖音设置价格说明"
                description={
                  <Space direction="vertical">
                    <Text>1. 在抖音后台将价格设置为¥{douyinSettingPrice.toFixed(2)}，消费者将看到的最终价格为¥{formData?.targetPrice.toFixed(2) || '0.00'}</Text>
                    <Text>2. 最终利润 = 成交价 - 供货价 = ¥{profit.toFixed(2)}</Text>
                  </Space>
                }
              />
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
};

export default DouyinDiscount; 