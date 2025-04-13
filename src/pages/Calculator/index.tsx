import React, { useEffect } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip, Space } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  ArrowRightOutlined, 
  PlusCircleOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  PercentageOutlined 
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import './index.less';

const { Title, Paragraph, Text } = Typography;

export const Calculator: React.FC = () => {
  // 从全局状态获取数据和方法
  const {
    supplyPrice, groupPrice, priceAddition,
    backendGroupPrice, singlePrice,
    groupPlatformFee, singlePlatformFee,
    groupProfit, singleProfit,
    discountPrice, discountProfit,
    setSupplyPrice, setGroupPrice, setPriceAddition, recalculate
  } = useCalculatorStore();

  // 组件挂载时执行一次计算
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  return (
    <div className="calculator-page">
      <Card bordered={false} className="main-card">
        {/* 标题区域 */}
        <div className="page-header">
          <CalculatorOutlined className="header-icon" />
          <div>
            <Title level={3}>PDD价格计算器</Title>
            <Paragraph className="subtitle">快速计算拼单价和单买价，包含平台手续费(0.6%)</Paragraph>
          </div>
        </div>

        <Divider />

        <Row gutter={[32, 24]} className="calculator-content">
          <Col xs={24} lg={10} className="input-section">
            {/* 输入表单 */}
            <Form layout="vertical" size="large">
              <Form.Item 
                label={
                  <Space>
                    <span>供货价（元）</span>
                    <Tooltip title="输入产品的供货价格，用于计算利润">
                      <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                className="form-item-price"
              >
                <div className="price-input-wrapper">
                  <DollarOutlined className="price-prefix-icon" />
                  <InputNumber
                    className="price-input"
                    controls={false}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={supplyPrice}
                    onChange={(value) => setSupplyPrice(Number(value) || 0)}
                    placeholder="0.00"
                  />
                  <div className="price-suffix">元</div>
                </div>
              </Form.Item>

              <Form.Item 
                label={
                  <Space>
                    <span>拼单价（元）</span>
                    <Tooltip title="输入产品的拼单价格，是买家实际支付的价格">
                      <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                className="form-item-price"
              >
                <div className="price-input-wrapper">
                  <DollarOutlined className="price-prefix-icon" />
                  <InputNumber
                    className="price-input"
                    controls={false}
                    min={0}
                    step={0.01}
                    precision={2}
                    value={groupPrice}
                    onChange={(value) => setGroupPrice(Number(value) || 0)}
                    placeholder="0.00"
                  />
                  <div className="price-suffix">元</div>
                </div>
              </Form.Item>

              <Form.Item 
                label={
                  <Space>
                    <span>后台加价金额（元）</span>
                    <Tooltip title="设置后台加价金额，用于计算后台价格和单买价">
                      <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                  </Space>
                }
                className="form-item-price"
              >
                <div className="price-input-wrapper">
                  <PlusCircleOutlined className="price-prefix-icon" />
                  <InputNumber
                    className="price-input"
                    controls={false}
                    min={0}
                    step={1}
                    precision={0}
                    value={priceAddition}
                    onChange={(value) => setPriceAddition(Number(value) || 0)}
                    placeholder="6"
                  />
                  <div className="price-suffix">元</div>
                </div>
                <div className="input-hint">默认为6元，可自行调整</div>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} lg={14} className="results-section-wrapper">
            {/* 结果展示区域 */}
            <div className="results-section">
              <div className="section-title">
                <div className="title-bar"></div>
                <Text strong>价格计算结果</Text>
              </div>

              <Row gutter={[16, 16]} className="results-grid">
                <Col xs={24} md={12}>
                  <div className="result-card backend-group-price">
                    <div className="result-label">
                      后台拼单价 
                      <ArrowRightOutlined className="arrow-icon" /> 
                      拼单价+{priceAddition}元
                    </div>
                    <div className="result-value">¥{backendGroupPrice.toFixed(2)}</div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card single-price">
                    <div className="result-label">
                      单买价 
                      <ArrowRightOutlined className="arrow-icon" /> 
                      后台拼单价+{priceAddition}元
                    </div>
                    <div className="result-value">¥{singlePrice.toFixed(2)}</div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card group-profit">
                    <div className="result-label">
                      拼单利润
                      <InfoCircleOutlined className="info-icon" />
                    </div>
                    <div className={`result-value ${groupProfit >= 0 ? 'positive' : 'negative'}`}>
                      {groupProfit >= 0 ? '+' : ''}¥{groupProfit.toFixed(2)}
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card single-profit">
                    <div className="result-label">
                      单买利润
                      <InfoCircleOutlined className="info-icon" />
                    </div>
                    <div className={`result-value ${singleProfit >= 0 ? 'positive' : 'negative'}`}>
                      {singleProfit >= 0 ? '+' : ''}¥{singleProfit.toFixed(2)}
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card discount-price">
                    <div className="result-label">
                      99折价格
                      <PercentageOutlined className="percent-icon" />
                    </div>
                    <div className="result-value">¥{discountPrice.toFixed(2)}</div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card discount-profit">
                    <div className="result-label">
                      99折后利润
                      <InfoCircleOutlined className="info-icon" />
                    </div>
                    <div className={`result-value ${discountProfit >= 0 ? 'positive' : 'negative'}`}>
                      {discountProfit >= 0 ? '+' : ''}¥{discountProfit.toFixed(2)}
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card group-fee">
                    <div className="result-label">
                      拼单手续费
                      <PercentageOutlined className="percent-icon" />
                    </div>
                    <div className="result-value negative">-¥{groupPlatformFee.toFixed(2)}</div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="result-card single-fee">
                    <div className="result-label">
                      单买手续费
                      <PercentageOutlined className="percent-icon" />
                    </div>
                    <div className="result-value negative">-¥{singlePlatformFee.toFixed(2)}</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

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
                  <li>利润 = 售卖价 - 供货价 - 手续费</li>
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