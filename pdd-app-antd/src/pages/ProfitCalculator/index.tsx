import React, { useState } from 'react';
import { Card, Form, InputNumber, Button, Space, Typography, Row, Col, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, MoneyCollectOutlined, TagOutlined, PercentageOutlined, GiftOutlined, CalculatorOutlined } from '@ant-design/icons';

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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={4}><CalculatorOutlined style={{marginRight: 8}}/>利润计算器</Title>
      <Divider style={{ marginTop: 8, marginBottom: 24 }} />
      
      <Row gutter={[24, 16]}>
        {/* 左侧表单 */}
        <Col xs={24} md={10}>
          <Card style={{ boxShadow: '0 2px 12px rgba(20,61,105,0.07)', borderRadius: '8px', height: '100%' }} bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleValuesChange}
              initialValues={{ supplyPrice: 0, originalPrice: 0, discount: 0.7, coupon: 0 }}
            >
              <Form.Item label={<span><MoneyCollectOutlined style={{color:'#1677ff',marginRight:4}}/>供货价</span>} name="supplyPrice" rules={[{ required: true, message: '请输入供货价' }]}> 
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入供货价" />
              </Form.Item>
              <Form.Item label={<span><TagOutlined style={{color:'#1677ff',marginRight:4}}/>原价</span>} name="originalPrice" rules={[{ required: true, message: '请输入原价' }]}> 
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入原价" />
              </Form.Item>
              <Form.Item label={<span><PercentageOutlined style={{color:'#1677ff',marginRight:4}}/>折扣（如0.7）</span>} name="discount" rules={[{ required: true, message: '请输入折扣' }]}> 
                <InputNumber min={0} max={1} step={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入折扣" />
              </Form.Item>
              <Form.Item label={<span><GiftOutlined style={{color:'#1677ff',marginRight:4}}/>优惠券</span>} name="coupon"> 
                <InputNumber min={0} step={1} precision={0} style={{ width: '100%' }} placeholder="自动反推或手动输入" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleReset}>重置</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        {/* 右侧结果 */}
        <Col xs={24} md={14}>
          <Card style={{ background: '#f8fafc', boxShadow: '0 2px 12px rgba(20,61,105,0.07)', borderRadius: '8px' }} bordered={false}>
            <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#143d69' }}>计算结果</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', gap: '8px' }}>
              <b>目标利润：</b>
              <Button style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }} type="primary" shape="circle" icon={<MinusOutlined />} onClick={() => handleProfitChange(-PROFIT_STEP)} />
              <span style={{ fontWeight: 'bold', color: '#1677ff', fontSize: '20px', margin: '0 4px' }}>¥{targetProfit.toFixed(2)}</span>
              <Button style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }} type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => handleProfitChange(PROFIT_STEP)} />
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px', color: '#333', gap: '8px' }}>
              <TagOutlined style={{ color: '#1677ff', fontSize: '18px' }}/>
              <span>外漏价</span>
              <b>¥{externalPrice.toFixed(2)}</b>
              <span style={{ color: '#888', fontSize: '13px', marginLeft: '4px' }}>(原价 × 折扣)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px', color: '#333', gap: '8px' }}>
              <MoneyCollectOutlined style={{ color: '#1677ff', fontSize: '18px' }}/>
              <span>供货价</span>
              <b>¥{form.getFieldValue('supplyPrice') || 0}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px', color: '#333', gap: '8px' }}>
              <PercentageOutlined style={{ color: '#1677ff', fontSize: '18px' }}/>
              <span>平台扣点</span>
              <b>¥{commission.toFixed(2)}</b>
              <span style={{ color: '#888', fontSize: '13px', marginLeft: '4px' }}>(外漏价 × 2%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px', color: '#333', gap: '8px' }}>
              <GiftOutlined style={{ color: '#1677ff', fontSize: '18px' }}/>
              <span>优惠券</span>
              <b>¥{coupon}</b>
            </div>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#52c41a', margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalculatorOutlined style={{ color: '#1677ff', fontSize: '18px' }}/>
              <span>利润 = 外漏价 - 优惠券 - 供货价 - 扣点</span>
              <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '22px', marginLeft: '8px' }}>¥{profit.toFixed(2)}</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfitCalculator; 