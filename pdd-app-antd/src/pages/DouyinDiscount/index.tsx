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
  Button,
  Tooltip
} from 'antd';
import { 
  DollarOutlined, 
  PercentageOutlined, 
  LineChartOutlined, 
  RiseOutlined, 
  InfoCircleOutlined,
  CalculatorOutlined,
  ShopOutlined
} from '@ant-design/icons';
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
  const [showResults, setShowResults] = useState<boolean>(true); // 默认显示结果区域
  const { addRecord } = useHistoryStore();

  // 当表单值变化时自动计算
  const valuesChange = (changedValues: any, allValues: FormData) => {
    if (allValues.targetPrice && allValues.targetPrice > 0 && 
        allValues.supplierPrice !== undefined && allValues.supplierPrice >= 0) {
      calculateResults(allValues);
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

  // 重置计算
  const handleReset = () => {
    const supplierPrice = form.getFieldValue('supplierPrice');
    const targetPrice = form.getFieldValue('targetPrice');
    
    if (targetPrice && targetPrice > 0 && 
        supplierPrice !== undefined && supplierPrice >= 0) {
      calculateResults({
        supplierPrice,
        targetPrice
      });
    } else {
      form.resetFields();
    }
  };

  return (
    <div className="douyin-discount-page">
      <div className="page-header">
        <Title level={4} className="header-title">
          <CalculatorOutlined className="header-icon" />
          抖音折扣价计算器
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
                    <ShopOutlined />供货价
                    <Tooltip title="从供应商处获得商品的成本价">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
              name="supplierPrice"
              rules={[{ required: true, message: '请输入供货价' }]}
            >
              <InputNumber
                min={0}
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
              name="targetPrice"
              rules={[{ required: true, message: '请输入目标零售价' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="请输入目标零售价"
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

            <div className="discount-info">
              <Alert
                className="info-alert"
                type="info"
                message="抖音折扣价格说明"
                description={
                  <Space direction="vertical" size={2}>
                    <Text>1. 在抖音后台设置价格：¥{douyinSettingPrice ? douyinSettingPrice.toFixed(2) : '100.00'}</Text>
                    <Text>2. 抖音显示折扣：{discountRate}%（{discountRate/10}折）</Text>
                    <Text>3. 消费者实际支付价格：¥{formData?.targetPrice ? formData.targetPrice.toFixed(2) : '46.00'}</Text>
                    <Text>4. 利润 = 实际售价 - 供货价 = ¥{profit ? profit.toFixed(2) : '？？'}</Text>
                    <Text>5. 抖音会将您设置的价格折算为约46%的折扣价展示给用户</Text>
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
            
            {/* 抖音设置价格 */}
            <div className="result-item item-red">
              <DollarOutlined className="item-icon" />
              <span className="item-label">设置价格</span>
              <span className="item-value">¥{douyinSettingPrice ? douyinSettingPrice.toFixed(2) : '100.00'}</span>
              <span className="item-desc">{formData ? '(在抖音后台设置)' : '(示例)'}</span>
            </div>
            
            {/* 抖音折扣率 */}
            <div className="result-item item-blue">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">折扣率</span>
              <span className="item-value">{discountRate}%（{discountRate/10}折）</span>
              <span className="item-desc">{formData ? '(抖音固定折扣)' : '(示例)'}</span>
            </div>
            
            {/* 实际售价 */}
            <div className="result-item item-purple">
              <DollarOutlined className="item-icon" />
              <span className="item-label">实际售价</span>
              <span className="item-value">¥{formData?.targetPrice ? formData.targetPrice.toFixed(2) : '46.00'}</span>
              <span className="item-desc">{formData ? '(消费者支付价格)' : '(示例)'}</span>
            </div>
            
            {/* 供货价 */}
            <div className="result-item item-orange">
              <ShopOutlined className="item-icon" />
              <span className="item-label">供货价</span>
              <span className="item-value">¥{formData?.supplierPrice ? formData.supplierPrice.toFixed(2) : '20.00'}</span>
              <span className="item-desc">{formData ? '(成本价)' : '(示例)'}</span>
            </div>
            
            <Divider className="divider" />
            
            {/* 利润区域 */}
            <div className="profit-result">
              <div className="formula">
                <CalculatorOutlined className="formula-icon" />
                <span>利润 = 实际售价 - 供货价</span>
              </div>
              <div className={profit >= 0 ? "final-profit positive" : "final-profit negative"}>
                ¥{profit ? profit.toFixed(2) : '26.00'} ({profitRate ? profitRate.toFixed(1) : '130.0'}%)
              </div>
            </div>
            
            {!showResults && (
              <div className="empty-result">
                <Alert
                  message="请输入供货价和目标零售价获取计算结果"
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

export default DouyinDiscount; 