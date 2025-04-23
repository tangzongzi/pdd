import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, InputNumber, Button, Row, Col, Divider, Alert, Table } from 'antd';
import { PercentageOutlined, DollarOutlined, InfoCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import './index.less';

const { Title, Paragraph, Text } = Typography;

// 定义界面状态接口
interface DiscountState {
  supplyPrice: number;
  targetDiscountedPrice: number;
  couponFee: number;
  originalPrice: number;
  discountedPrice: number;
  profit: number;
  profitRate: number;
  platformOriginalPrice: number;
}

export const DiscountActivity: React.FC = () => {
  // 初始化界面状态
  const [state, setState] = useState<DiscountState>({
    supplyPrice: 0,
    targetDiscountedPrice: 0,
    couponFee: 6,
    originalPrice: 0,
    discountedPrice: 0,
    profit: 0,
    profitRate: 0,
    platformOriginalPrice: 0
  });
  
  // 计算结果
  const calculateResults = () => {
    const { supplyPrice, targetDiscountedPrice, couponFee } = state;
    
    if (supplyPrice <= 0 || targetDiscountedPrice <= 0) {
      return;
    }
    
    // 计算平台手续费（0.6%）
    const platformFee = targetDiscountedPrice * 0.006;
    
    // 计算利润和利润率
    const profit = targetDiscountedPrice - supplyPrice - platformFee;
    const profitRate = profit / supplyPrice;
    
    // 反向计算应该设置的原价：
    // 正确逻辑：原价×0.7-优惠券费用 = 目标拼单价
    // 所以原价 = (目标拼单价 + 优惠券费用) / 0.7
    const systemOriginalPrice = Math.ceil(((targetDiscountedPrice + couponFee) / 0.7) * 10) / 10;
    
    // 验证计算：如果原价×0.7-券费用 四舍五入后等于目标价，则计算正确
    const verifiedDiscountPrice = Math.round((systemOriginalPrice * 0.7 - couponFee) * 10) / 10;
    
    setState({
      ...state,
      originalPrice: systemOriginalPrice,
      discountedPrice: verifiedDiscountPrice,
      profit,
      profitRate
    });
  };
  
  // 监听输入变化，实时计算结果
  useEffect(() => {
    calculateResults();
  }, [state.supplyPrice, state.targetDiscountedPrice, state.couponFee]);
  
  // 处理输入变化
  const handleInputChange = (field: keyof DiscountState, value: number) => {
    setState({
      ...state,
      [field]: value || 0
    });
  };
  
  // 构建表格数据
  const tableData = [
    {
      key: '1',
      item: '供货价',
      value: `¥${state.supplyPrice.toFixed(2)}`,
      description: '您的进货成本'
    },
    {
      key: '2',
      item: '目标拼单价',
      value: `¥${state.targetDiscountedPrice.toFixed(2)}`,
      description: '您想要达到的最终成交价'
    },
    {
      key: '3',
      item: '需设置原价',
      value: `¥${state.originalPrice.toFixed(2)}`,
      description: '在后台需要设置的原价（反向计算）'
    },
    {
      key: '4',
      item: '7折计算公式',
      value: `${state.originalPrice.toFixed(2)} × 0.7 - ${state.couponFee.toFixed(2)}`,
      description: '保留一位小数 = ¥' + state.discountedPrice.toFixed(1)
    },
    {
      key: '5',
      item: '平台手续费',
      value: `¥${(state.targetDiscountedPrice * 0.006).toFixed(2)}`,
      description: '交易金额的0.6%'
    },
    {
      key: '6',
      item: '实际利润',
      value: <span className={state.profit >= 0 ? 'highlight' : ''}>{`¥${state.profit.toFixed(2)}`}</span>,
      description: `利润率: ${(state.profitRate * 100).toFixed(2)}%`
    }
  ];
  
  const columns = [
    {
      title: '项目',
      dataIndex: 'item',
      key: 'item',
      width: '25%'
    },
    {
      title: '金额',
      dataIndex: 'value',
      key: 'value',
      width: '25%'
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      width: '50%'
    }
  ];

  return (
    <div className="discount-activity-page">
      <Card>
        <Title level={4}>
          <ShoppingOutlined /> 不计价-限量7折100件 (7折计算器)
        </Title>
        <div className="activity-description">
          <h3>活动规则</h3>
          <ul className="rules-list">
            <li>活动报名流程：商品审核通过后，活动公示的切价时间进行价格切换，活动库存卖完后，活动价格即失效。</li>
            <li>成功报名的商品会在活动时间自动切至活动价。</li>
            <li>有助于新品、慢动效生意爆发，破零利器！</li>
            <li>当商品在限量抢价格下的活动库存售罄后，活动价格也将失效，继续生效设置的其他活动价格。</li>
          </ul>
        </div>
        
        <Divider />
        
        <div className="price-calculator">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item 
                  label="供货价（元）" 
                  tooltip="您的商品进货成本"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={state.supplyPrice}
                    onChange={(value) => handleInputChange('supplyPrice', Number(value))}
                    prefix={<DollarOutlined />}
                    placeholder="请输入供货价"
                    addonAfter="元"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item 
                  label="目标拼单价（元）" 
                  tooltip="客户实际支付的价格"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={state.targetDiscountedPrice}
                    onChange={(value) => handleInputChange('targetDiscountedPrice', Number(value))}
                    prefix={<DollarOutlined />}
                    placeholder="请输入目标拼单价"
                    addonAfter="元"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item 
                  label="优惠券费用（元）" 
                  tooltip="活动需支付的额外费用，默认为6元"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    precision={2}
                    value={state.couponFee}
                    onChange={(value) => handleInputChange('couponFee', Number(value))}
                    prefix={<DollarOutlined />}
                    placeholder="优惠券费用"
                    addonAfter="元"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        
        {(state.supplyPrice > 0 && state.targetDiscountedPrice > 0) && (
          <div className="result-section">
            <div className="result-title">
              <InfoCircleOutlined /> 计算结果
            </div>
            
            <Table 
              dataSource={tableData} 
              columns={columns} 
              pagination={false}
              size="middle"
              className="result-table"
            />
            
            <div className="formula-explanation">
              <div className="formula-title">计算公式与逻辑说明：</div>
              <div>1. <strong>需设置原价</strong> = (目标拼单价 + 优惠券费用) ÷ 0.7，取整到小数点后1位</div>
              <div>2. <strong>7折后价格</strong> = 原价 × 0.7 - 优惠券费用，保留1位小数</div>
              <div>3. <strong>实际利润</strong> = 目标拼单价 - 供货价 - 平台手续费</div>
              <div>4. <strong>注意</strong>：优惠券费用是在折扣后扣除的，不是先扣除再打折</div>
              
              <Alert
                message="反向计算说明：如果您希望最终成交价是17.8元，系统会计算出需要设置的原价，使得7折后再减去优惠券费后等于17.8元"
                type="info"
                showIcon
                style={{ marginTop: 12 }}
              />
              
              <Alert
                message="实例：目标价17.8元，反向计算得到原价为34.0元，验证：34.0×0.7-6=17.8元，利润=17.8-17.51-0.11=0.18元"
                type="success"
                showIcon
                style={{ marginTop: 12 }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export { DiscountActivity };
export default DiscountActivity; 