import React, { useState } from 'react';
import { Card, Form, InputNumber, Button, Typography, Row, Col, Divider } from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  MoneyCollectOutlined, 
  TagOutlined, 
  PercentageOutlined, 
  GiftOutlined, 
  CalculatorOutlined 
} from '@ant-design/icons';
import './index.less';

const { Title } = Typography;

const PROFIT_STEP = 0.1;
const PROFIT_MIN = 0.1;
const PROFIT_MAX = 20;

const ProfitCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [externalPrice, setExternalPrice] = useState<number>(0); // 外漏价
  const [profit, setProfit] = useState<number>(1.5); // 当前利润
  const [targetProfit, setTargetProfit] = useState<number>(1.5); // 目标利润
  const [commission, setCommission] = useState<number>(0); // 扣点
  const [coupon, setCoupon] = useState<number>(0); // 优惠券

  // 自动计算逻辑
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const { supplyPrice = 0, originalPrice = 0, discount = 0.7, coupon: couponInput = 0 } = allValues;
    // 外漏价 = 原价 * 折扣
    const extPrice = originalPrice * discount;
    setExternalPrice(extPrice);
    // 2%扣点
    const comm = extPrice * 0.02;
    setCommission(comm);
    // 自动反推优惠券
    if (supplyPrice > 0 && originalPrice > 0 && discount > 0) {
      // 优惠券 = 外漏价 - 供货价 - 扣点 - 目标利润
      const autoCoupon = extPrice - supplyPrice - comm - targetProfit;
      const couponValue = autoCoupon > 0 ? Math.round(autoCoupon) : 0;
      // 只在不是手动输入优惠券时自动填充
      if (!('coupon' in changedValues)) {
        form.setFieldsValue({ coupon: couponValue });
        setCoupon(couponValue);
        setProfit(targetProfit);
      } else {
        setCoupon(couponInput);
        const realProfit = extPrice - couponInput - supplyPrice - comm;
        setProfit(realProfit);
      }
    } else {
      setCoupon(couponInput);
      const realProfit = extPrice - couponInput - supplyPrice - comm;
      setProfit(realProfit);
    }
  };

  // 利润调控按钮
  const handleProfitChange = (delta: number) => {
    let newProfit = Number((targetProfit + delta).toFixed(2));
    if (newProfit < PROFIT_MIN) newProfit = PROFIT_MIN;
    if (newProfit > PROFIT_MAX) newProfit = PROFIT_MAX;
    setTargetProfit(newProfit);
    // 重新计算优惠券
    const values = form.getFieldsValue();
    const { supplyPrice = 0, originalPrice = 0, discount = 0.7 } = values;
    const extPrice = originalPrice * discount;
    const comm = extPrice * 0.02;
    if (supplyPrice > 0 && originalPrice > 0 && discount > 0) {
      const autoCoupon = extPrice - supplyPrice - comm - newProfit;
      const couponValue = autoCoupon > 0 ? Math.round(autoCoupon) : 0;
      form.setFieldsValue({ coupon: couponValue });
      setCoupon(couponValue);
      setProfit(newProfit);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setProfit(1.5);
    setTargetProfit(1.5);
    setExternalPrice(0);
    setCommission(0);
    setCoupon(0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4} className="page-title">
          <CalculatorOutlined className="header-icon" />
          利润计算器
        </Title>
      </div>
      
      <Row gutter={[24, 24]} className="content-row">
        {/* 左侧表单 */}
        <Col xs={24} md={10}>
          <Card className="form-card" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleValuesChange}
              initialValues={{ supplyPrice: 0, originalPrice: 0, discount: 0.7, coupon: 0 }}
              className="calc-form"
            >
              <Form.Item 
                label={<span className="form-label"><MoneyCollectOutlined />供货价</span>} 
                name="supplyPrice" 
                rules={[{ required: true, message: '请输入供货价' }]}
              > 
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入供货价" />
              </Form.Item>
              
              <Form.Item 
                label={<span className="form-label"><TagOutlined />原价</span>} 
                name="originalPrice" 
                rules={[{ required: true, message: '请输入原价' }]}
              > 
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入原价" />
              </Form.Item>
              
              <Form.Item 
                label={<span className="form-label"><PercentageOutlined />折扣（如0.7）</span>} 
                name="discount" 
                rules={[{ required: true, message: '请输入折扣' }]}
              > 
                <InputNumber min={0} max={1} step={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入折扣" />
              </Form.Item>
              
              <Form.Item 
                label={<span className="form-label"><GiftOutlined />优惠券</span>} 
                name="coupon"
              > 
                <InputNumber min={0} step={1} precision={0} style={{ width: '100%' }} placeholder="自动反推或手动输入" />
              </Form.Item>
              
              <Form.Item className="submit-item">
                <Button type="primary" onClick={handleReset}>重置计算</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        {/* 右侧结果 */}
        <Col xs={24} md={14}>
          <Card className="result-card" bordered={false}>
            <div className="card-title">
              <CalculatorOutlined className="title-icon" />
              <span>计算结果</span>
            </div>
            
            <div className="profit-control">
              <span className="label">目标利润：</span>
              <Button 
                className="control-btn minus-btn" 
                type="default" 
                icon={<MinusOutlined />} 
                onClick={() => handleProfitChange(-PROFIT_STEP)} 
              />
              <span className="profit-value">¥{targetProfit.toFixed(2)}</span>
              <Button 
                className="control-btn plus-btn" 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => handleProfitChange(PROFIT_STEP)} 
              />
            </div>
            
            <Divider className="divider" />
            
            <div className="result-item">
              <TagOutlined className="item-icon" />
              <span className="item-label">外漏价</span>
              <span className="item-value">¥{externalPrice.toFixed(2)}</span>
              <span className="item-desc">(原价 × 折扣)</span>
            </div>
            
            <div className="result-item">
              <MoneyCollectOutlined className="item-icon" />
              <span className="item-label">供货价</span>
              <span className="item-value">¥{form.getFieldValue('supplyPrice') || 0}</span>
            </div>
            
            <div className="result-item">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">平台扣点</span>
              <span className="item-value">¥{commission.toFixed(2)}</span>
              <span className="item-desc">(外漏价 × 2%)</span>
            </div>
            
            <div className="result-item">
              <GiftOutlined className="item-icon" />
              <span className="item-label">优惠券</span>
              <span className="item-value">¥{coupon}</span>
            </div>
            
            <Divider className="divider" />
            
            <div className="profit-result">
              <div className="formula">
                <CalculatorOutlined className="formula-icon" />
              <span>利润 = 外漏价 - 优惠券 - 供货价 - 扣点</span>
              </div>
              <div className="final-profit">¥{profit.toFixed(2)}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfitCalculator; 