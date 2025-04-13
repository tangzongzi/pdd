import React, { useEffect } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  ArrowRightOutlined, 
  PlusCircleOutlined,
  DollarOutlined,
  PercentageOutlined 
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import './index.less';

const { Title, Paragraph } = Typography;

export const Calculator: React.FC = () => {
  // 从全局状态获取数据和方法
  const {
    supplyPrice, groupPrice, priceAddition,
    backendGroupPrice, singlePrice,
    groupPlatformFee, singlePlatformFee,
    groupProfit, singleProfit,
    discountPrice, discountProfit,
    setSupplyPrice, setGroupPrice, setPriceAddition, recalculate, saveToHistory
  } = useCalculatorStore();

  // 组件挂载时执行一次计算
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // 当供货价、拼单价或加价金额变化时保存到历史记录
  useEffect(() => {
    // 检查是否有实际的计算结果（供货价和拼单价都已输入）
    if (supplyPrice > 0 && groupPrice > 0) {
      // 使用防抖，延迟2秒保存，避免频繁保存
      const saveTimer = setTimeout(() => {
        saveToHistory();
      }, 2000);
      
      return () => clearTimeout(saveTimer);
    }
  }, [supplyPrice, groupPrice, priceAddition, saveToHistory]);

  return (
    <div className="calculator-page">
      <Card bordered={false} className="main-card" size="small">
        {/* 标题区域 */}
        <div className="page-header">
          <CalculatorOutlined className="header-icon" />
          <div>
            <Title level={3}>PDD价格计算器</Title>
            <Paragraph className="subtitle">快速计算拼单价和单买价，包含平台手续费(0.6%)</Paragraph>
          </div>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            {/* 输入表单区域 */}
            <div className="input-section">
              <Title level={5} className="section-title">价格信息输入</Title>
              
              <Form layout="vertical" size="middle" className="calculator-form">
                <Form.Item 
                  label="供货价（元）"
                  tooltip={{
                    title: "输入产品的供货价格，用于计算利润",
                    placement: "topLeft"
                  }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={supplyPrice}
                    onChange={(value) => setSupplyPrice(Number(value) || 0)}
                    placeholder="请输入供货价"
                    prefix={<DollarOutlined />}
                    size="large"
                    addonAfter="元"
                  />
                </Form.Item>

                <Form.Item 
                  label="拼单价（元）"
                  tooltip={{
                    title: "输入产品的拼单价格，是买家实际支付的价格",
                    placement: "topLeft"
                  }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={groupPrice}
                    onChange={(value) => setGroupPrice(Number(value) || 0)}
                    placeholder="请输入拼单价"
                    prefix={<DollarOutlined />}
                    size="large"
                    addonAfter="元"
                  />
                </Form.Item>

                <Form.Item 
                  label="后台加价金额（元）" 
                  tooltip={{ 
                    title: "设置后台加价金额，用于计算后台价格和单买价", 
                    placement: "topLeft" 
                  }}
                  extra={<span className="help-text">默认为6元，可自行调整</span>}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    precision={0}
                    value={priceAddition}
                    onChange={(value) => setPriceAddition(Number(value) || 0)}
                    prefix={<PlusCircleOutlined />}
                    size="large"
                    addonAfter="元"
                  />
                </Form.Item>
              </Form>
            </div>
          </Col>

          <Col xs={24} lg={14}>
            {/* 结果展示区 */}
            <div className="results-section">
              <Title level={5} className="section-title">价格计算结果</Title>

              <div className="result-group">
                <div className="result-card">
                  <div className="result-label">
                    后台拼单价 
                    <Tooltip title={`计算公式: ${groupPrice} + ${priceAddition} = ${backendGroupPrice}`}>
                      <ArrowRightOutlined style={{fontSize: '10px', opacity: 0.7, margin: '0 4px'}} />
                    </Tooltip>
                    拼单价+{priceAddition}元
                  </div>
                  <div className="result-value primary">¥{backendGroupPrice.toFixed(2)}</div>
                </div>

                <div className="result-card">
                  <div className="result-label">
                    单买价 
                    <Tooltip title={`计算公式: ${backendGroupPrice} + ${priceAddition} = ${singlePrice}`}>
                      <ArrowRightOutlined style={{fontSize: '10px', opacity: 0.7, margin: '0 4px'}} />
                    </Tooltip>
                    后台拼单价+{priceAddition}元
                  </div>
                  <div className="result-value primary">¥{singlePrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="result-group">
                <div className="result-card">
                  <div className="result-label">
                    拼单利润
                    <Tooltip title={`计算公式: ${groupPrice} - ${supplyPrice} - ${groupPlatformFee.toFixed(2)} = ${groupProfit.toFixed(2)}`}>
                      <InfoCircleOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className={`result-value ${groupProfit >= 0 ? 'profit' : 'loss'}`}>
                    {groupProfit >= 0 ? '+' : ''}¥{groupProfit.toFixed(2)}
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-label">
                    单买利润
                    <Tooltip title={`计算公式: ${singlePrice} - ${supplyPrice} - ${singlePlatformFee.toFixed(2)} = ${singleProfit.toFixed(2)}`}>
                      <InfoCircleOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className={`result-value ${singleProfit >= 0 ? 'profit' : 'loss'}`}>
                    {singleProfit >= 0 ? '+' : ''}¥{singleProfit.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="result-group">
                <div className="result-card">
                  <div className="result-label">
                    99折价格
                    <Tooltip title={`计算公式: ${groupPrice} × 0.99 = ${discountPrice.toFixed(2)}`}>
                      <PercentageOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className="result-value primary">¥{discountPrice.toFixed(2)}</div>
                </div>

                <div className="result-card">
                  <div className="result-label">
                    99折后利润
                    <Tooltip title={`计算公式: ${discountPrice} - ${supplyPrice} - ${priceAddition} - (${discountPrice} × 0.6%) = ${discountProfit.toFixed(2)}`}>
                      <InfoCircleOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className={`result-value ${discountProfit >= 0 ? 'profit' : 'loss'}`}>
                    {discountProfit >= 0 ? '+' : ''}¥{discountProfit.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="result-group">
                <div className="result-card">
                  <div className="result-label">
                    拼单手续费
                    <Tooltip title={`计算公式: ${groupPrice} × 0.6% = ${groupPlatformFee.toFixed(2)}`}>
                      <PercentageOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className="result-value loss">-¥{groupPlatformFee.toFixed(2)}</div>
                </div>

                <div className="result-card">
                  <div className="result-label">
                    单买手续费
                    <Tooltip title={`计算公式: ${singlePrice} × 0.6% = ${singlePlatformFee.toFixed(2)}`}>
                      <PercentageOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className="result-value loss">-¥{singlePlatformFee.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider />
        
        {/* 计算说明 */}
        <div className="calculation-note">
          <Alert
            message={
              <div>
                <div className="note-title">
                  <InfoCircleOutlined /> 计算说明
                </div>
                <ul className="note-list">
                  <li>后台拼单价 = 拼单价 + {priceAddition}元</li>
                  <li>单买价 = 后台拼单价 + {priceAddition}元</li>
                  <li>手续费 = 价格 × 0.6%</li>
                  <li>99折价格 = 拼单价 × 0.99</li>
                  <li>利润 = 售卖价 - 供货价 - (售卖价×0.6%)</li>
                  <li>99折后利润 = 99折价 - 供货价 - 加价金额 - (99折价×0.6%)</li>
                </ul>
              </div>
            }
            type="info"
            showIcon={false}
          />
        </div>
      </Card>
    </div>
  );
}; 