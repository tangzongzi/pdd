import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip, Button, Select } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  ArrowRightOutlined, 
  PlusCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import './index.less';

const { Title, Paragraph } = Typography;

// 利润档位配置
const generateProfitRates = (currentRate: number) => [
  { 
    label: '低价位', 
    value: Math.max(currentRate * 0.8, 0.05), 
    description: '价格敏感市场'
  },
  { 
    label: '中价位', 
    value: currentRate, 
    description: '与竞争对手持平'
  },
  { 
    label: '高价位', 
    value: currentRate * 1.2, 
    description: '高客单价市场'
  },
  { 
    label: '优质价', 
    value: currentRate * 1.5, 
    description: '优质客户群体'
  },
];

// 利润档位选择器组件
const ProfitRateSelector: React.FC = () => {
  const { 
    supplyPrice, 
    groupPrice, 
    currentProfitRate, 
    marketMaxPrice, 
    isPriceExceedLimit, 
    groupProfit 
  } = useCalculatorStore();
  
  // 从store中获取需要的函数
  const setGroupPrice = useCalculatorStore(state => state.setGroupPrice);
  const setIsRateSelectionUpdate = useCalculatorStore(state => state.setIsRateSelectionUpdate);
  const setPriceByProfitRate = useCalculatorStore(state => state.setPriceByProfitRate);
  
  // 选中的档位ID
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  
  // 强制刷新用的状态
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  
  // 当价格或利润率变化时强制重新渲染
  useEffect(() => {
    // 只有当有效价格输入后才更新
    if (supplyPrice > 0 && groupPrice > 0) {
      // 增加计数器，强制组件重新渲染
      setForceUpdate(prev => prev + 1);
      console.log('强制更新档位价格计算', {
        supplyPrice,
        groupPrice,
        currentProfitRate,
        timestamp: new Date().toISOString()
      });
      
      // 找到最接近当前利润率的档位
      const rates = getProfitRates();
      const closestRate = getClosestRate(currentProfitRate, rates);
      if (closestRate && Math.abs(closestRate.value - currentProfitRate) < 0.02) {
        setSelectedRateId(closestRate.id);
      } else {
        setSelectedRateId(null);
      }
    }
  }, [supplyPrice, groupPrice, currentProfitRate]);
  
  // 如果没有供货价或拼单价，返回空
  if (supplyPrice <= 0 || groupPrice <= 0) {
    return (
      <div className="profit-rate-selector-placeholder">
        <Alert
          message="输入供货价和拼单价后，将显示不同利润档位选项"
          type="info"
          showIcon
        />
      </div>
    );
  }
  
  // 生成档位 - 固定的档位定义
  const getProfitRates = () => {
    // 获取最新的市场控价，用于计算最后一个档位
    const latestMarketMaxPrice = useCalculatorStore.getState().marketMaxPrice;
    const latestSupplyPrice = useCalculatorStore.getState().supplyPrice;
    
    // 计算接近市场控价的利润率（比市场控价低5%）
    let nearMarketRate = 0.20;
    if (latestMarketMaxPrice > 0 && latestSupplyPrice > 0) {
      const feeRate = 0.006; // 0.6%
      // 计算接近市场控价的价格（比市场控价低5%）
      const nearMarketPrice = latestMarketMaxPrice * 0.95;
      // 根据价格反推利润率
      nearMarketRate = ((nearMarketPrice * (1 - feeRate)) / latestSupplyPrice) - 1;
      // 确保利润率至少为0.18
      nearMarketRate = Math.max(nearMarketRate, 0.18);
    }
    
    return [
      { id: 'ultra_low', label: '超低价位', value: 0.03, description: '薄利多销策略' },
      { id: 'very_low', label: '极低价位', value: 0.05, description: '高流量引流' },
      { id: 'lower', label: '较低价位', value: 0.07, description: '快速开拓市场' },
      { id: 'low', label: '低价位', value: 0.09, description: '价格敏感市场' },
      { id: 'medium', label: '中价位', value: 0.12, description: '与竞争对手持平' },
      { id: 'high', label: '高价位', value: 0.14, description: '高客单价市场' },
      { id: 'premium', label: '优质价', value: 0.17, description: '优质客户群体' },
      { id: 'premium_plus', label: '高端价位', value: 0.20, description: '高端客户市场' },
      { id: 'market_max', label: '市场控价下', value: nearMarketRate, description: '接近市场上限价格' }
    ];
  };
  
  // 获取档位列表
  const profitRates = getProfitRates();
  
  // 获取最接近当前利润率的档位
  const getClosestRate = (rate: number, rates: any[]) => {
    return rates.reduce((prev, curr) => 
      Math.abs(curr.value - rate) < Math.abs(prev.value - rate) ? curr : prev
    );
  };
  
  // 根据利润率计算拼单价 - 强制每次都重新计算
  const calculatePriceByRate = (rate: number) => {
    // 确保使用最新状态的supplyPrice
    const latestSupplyPrice = useCalculatorStore.getState().supplyPrice;
    const latestMarketMaxPrice = useCalculatorStore.getState().marketMaxPrice;
    
    const feeRate = 0.006; // 0.6%
    let calculatedPrice = Math.ceil((latestSupplyPrice * (1 + rate)) / (1 - feeRate) * 100) / 100;
    
    // 检查是否超出市场控价
    if (latestMarketMaxPrice > 0 && calculatedPrice > latestMarketMaxPrice) {
      return {
        price: latestMarketMaxPrice,
        isExceeded: true
      };
    }
    
    return {
      price: calculatedPrice,
      isExceeded: false
    };
  };
  
  // 处理选择利润档位
  const handleSelectRate = (rate: { id: string, value: number }) => {
    // 如果已选择相同档位，则取消选择
    if (selectedRateId === rate.id) {
      setSelectedRateId(null);
      return;
    }
    
    // 设置选中状态
    setSelectedRateId(rate.id);
    
    // 设置价格更新标识
    setIsRateSelectionUpdate(true);
    
    // 使用模型方法根据利润率设置价格
    setPriceByProfitRate(rate.value);
    
    // 短暂延时后重置标记
    window.setTimeout(() => {
      setIsRateSelectionUpdate(false);
    }, 100);
  };
  
  // 计算每个档位的具体利润金额 - 强制每次都重新计算
  const calculateProfit = (rate: number) => {
    // 确保使用最新状态的supplyPrice
    const latestSupplyPrice = useCalculatorStore.getState().supplyPrice;
    const estimatedProfit = latestSupplyPrice * rate;
    return estimatedProfit.toFixed(2);
  };
  
  // 检查是否接近当前利润率
  const isNearCurrentRate = (rateValue: number) => {
    // 确保使用最新的利润率
    const latestRate = useCalculatorStore.getState().currentProfitRate;
    return Math.abs(rateValue - latestRate) < 0.01;
  };
  
  // 渲染当前利润率 - 确保使用最新值
  const renderCurrentRate = () => {
    // 直接从store获取最新值以确保准确性
    const latestRate = useCalculatorStore.getState().currentProfitRate;
    const latestProfit = useCalculatorStore.getState().groupProfit;
    
    const ratePercentage = (latestRate * 100).toFixed(1);
    const profitAmount = latestProfit.toFixed(2);
    const isPositive = latestProfit >= 0;
    
    return (
      <span className="current-profit-rate">
        当前利润率：
        <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
          {ratePercentage}%
        </span>
        <span className="profit-amount">
          （利润：
          <span style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
            {isPositive ? '+' : ''}¥{profitAmount}
          </span>
          ）
        </span>
      </span>
    );
  };
  
  // 使用key={forceUpdate}强制每次price变化时整个组件重新渲染
  return (
    <div className="profit-rate-section" key={forceUpdate}>
      <div className="profit-analysis-header">
        <LineChartOutlined /> 竞争对手利润分析
        {renderCurrentRate()}
        {isPriceExceedLimit && (
          <span className="market-price-warning" style={{ 
            display: 'block', 
            fontSize: '12px', 
            color: '#ff4d4f', 
            marginTop: '4px' 
          }}>
            注意：当前价格已超出市场控价！
          </span>
        )}
      </div>
      
      <div className="profit-rate-selector">
        <div className="selector-label">选择利润档位：</div>
        {/* 使用立即执行函数确保每次渲染时都使用最新状态 */}
        {(() => {
          // 强制每次渲染时重新获取最新状态
          const latestState = useCalculatorStore.getState();
          
          return (
            <div className="profit-rate-buttons">
              {profitRates.map((rate) => {
                // 强制每次渲染都重新计算档位价格
                const { price: ratePrice, isExceeded } = calculatePriceByRate(rate.value);
                
                // 检查是否接近当前利润率
                const isActive = selectedRateId === rate.id || isNearCurrentRate(rate.value);
                
                return (
                  <Button
                    key={`${rate.id}-${forceUpdate}`}
                    className={`profit-rate-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectRate(rate)}
                    style={{ position: 'relative', overflow: 'visible' }}
                  >
                    <div className="rate-label">{rate.label}</div>
                    <div className="rate-value">{(rate.value * 100).toFixed(1)}%</div>
                    <div className="profit-value">¥{calculateProfit(rate.value)} 利润</div>
                    <div className="rate-description">{rate.description}</div>
                    {ratePrice && (
                      <div 
                        className="price-preview" 
                        style={{ 
                          marginTop: '8px', 
                          padding: '4px 8px', 
                          background: isExceeded ? '#fff1f0' : '#f0f8ff', 
                          borderRadius: '4px',
                          border: `1px solid ${isExceeded ? '#ff4d4f' : '#1890ff'}`,
                          fontWeight: 'bold'
                        }}
                      >
                        <strong>价格: ¥{ratePrice.toFixed(2)}</strong>
                        {isExceeded && (
                          <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '2px' }}>
                            已限制为市场控价
                          </div>
                        )}
                        {!isExceeded && (
                          <div style={{ fontSize: '11px', color: '#1890ff', marginTop: '2px' }}>
                            点击应用此价格
                          </div>
                        )}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// 价格输入表单组件
const PriceInputForm: React.FC = () => {
  const { 
    supplyPrice, 
    groupPrice, 
    priceAddition, 
    marketMaxPrice, 
    priceMultiplier,
    isPriceExceedLimit, 
    setSupplyPrice, 
    setGroupPrice, 
    setPriceAddition, 
    setMarketMaxPrice,
    setPriceMultiplier
  } = useCalculatorStore();
  
  return (
    <Form layout="vertical" size="middle" className="calculator-form">
      <Row gutter={[16, 0]}>
        <Col xs={24} md={6}>
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
        </Col>
        
        <Col xs={24} md={6}>
          <Form.Item 
            label="倍速选择"
            tooltip={{
              title: "设置供货价的倍数，用于计算实际成本",
              placement: "topLeft"
            }}
          >
            <Select
              style={{ width: '100%' }}
              value={priceMultiplier}
              onChange={setPriceMultiplier}
              size="large"
              options={[
                { value: 1, label: '1倍' },
                { value: 1.5, label: '1.5倍' },
                { value: 2, label: '2倍' },
                { value: 2.5, label: '2.5倍' },
                { value: 3, label: '3倍' },
                { value: 3.5, label: '3.5倍' },
                { value: 4, label: '4倍' }
              ]}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={6}>
          <Form.Item 
            label="拼单价（元）"
            tooltip={{
              title: "输入产品的拼单价格，是买家实际支付的价格",
              placement: "topLeft"
            }}
            help={isPriceExceedLimit ? <span style={{ color: '#ff4d4f' }}>已超出市场控价！</span> : null}
            validateStatus={isPriceExceedLimit ? 'error' : undefined}
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
              status={isPriceExceedLimit ? 'error' : undefined}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={6}>
          <Form.Item 
            label="市场控价（元）" 
            tooltip={{ 
              title: "设置市场最高价格，如果拼单价超过此价格将显示警告", 
              placement: "topLeft" 
            }}
            extra={<span className="help-text">市场可接受的最高价格</span>}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              value={marketMaxPrice}
              onChange={(value) => setMarketMaxPrice(Number(value) || 0)}
              placeholder="请输入市场控价"
              prefix={<DollarOutlined />}
              size="large"
              addonAfter="元"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={6}>
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
        </Col>
      </Row>
    </Form>
  );
};

export const Calculator: React.FC = () => {
  // 从全局状态获取数据和方法
  const {
    supplyPrice, groupPrice, priceAddition, marketMaxPrice,
    backendGroupPrice, singlePrice,
    groupPlatformFee, singlePlatformFee,
    groupProfit, singleProfit,
    discountPrice, discountProfit,
    isPriceExceedLimit,
    recalculate, saveToHistory
  } = useCalculatorStore();

  // 组件挂载时执行一次计算
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // 保存历史记录的引用，用于防抖处理
  const saveTimerRef = useRef<number | null>(null);

  // 当价格相关参数变化时保存到历史记录
  useEffect(() => {
    // 清除之前的计时器
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    
    // 检查是否有实际的计算结果（供货价和拼单价都已输入）
    if (supplyPrice > 0 && groupPrice > 0) {
      // 使用防抖，延迟1.5秒保存，避免频繁保存
      saveTimerRef.current = window.setTimeout(() => {
        saveToHistory();
        console.log('历史记录已保存:', { supplyPrice, groupPrice, priceAddition });
      }, 1500);
    }
    
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [supplyPrice, groupPrice, priceAddition, marketMaxPrice, saveToHistory]);

  return (
    <div className="calculator-page">
      <Card bordered={false} className="main-card" size="small">
        {/* 标题区域 */}
        <div className="page-header">
          <CalculatorOutlined className="header-icon" />
          <div>
            <Title level={3}>PDD拼单计算</Title>
            <Paragraph className="subtitle">快速计算拼单价和单买价，含平台手续费(0.6%)</Paragraph>
          </div>
        </div>

        <Divider />
        
        {/* 输入区域 - 单独在上方 */}
        <div className="input-section">
          <Title level={5} className="section-title">价格信息输入</Title>
          <PriceInputForm />
        </div>
        
        <Divider />
        
        {/* 结果区域 - 左右两列 */}
        <Row gutter={[24, 24]}>
          {/* 左侧：竞争对手利润分析 */}
          <Col xs={24} lg={12}>
            <ProfitRateSelector />
          </Col>
          
          {/* 右侧：价格计算结果 */}
          <Col xs={24} lg={12}>
            <div className="results-section">
              <Title level={5} className="section-title">
                <PieChartOutlined /> 价格计算结果
                {marketMaxPrice > 0 && (
                  <span style={{ fontSize: '14px', marginLeft: '12px', color: '#888' }}>
                    市场控价: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>¥{marketMaxPrice.toFixed(2)}</span>
                  </span>
                )}
              </Title>

              {/* 市场控价警告 */}
              {isPriceExceedLimit && (
                <Alert
                  message="价格超出市场控价"
                  description={`当前拼单价¥${groupPrice.toFixed(2)}已超出市场控价¥${marketMaxPrice.toFixed(2)}，建议适当降低价格以保持竞争力。`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

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
                    <Tooltip title={`计算公式: 后台拼单价 ${backendGroupPrice} × 0.99 - ${priceAddition} = ${discountPrice.toFixed(2)}`}>
                      <PercentageOutlined style={{fontSize: '12px', opacity: 0.7, marginLeft: '4px'}} />
                    </Tooltip>
                  </div>
                  <div className="result-value primary">¥{discountPrice.toFixed(2)}</div>
                </div>

                <div className="result-card">
                  <div className="result-label">
                    99折后利润
                    <Tooltip title={`计算公式: ${discountPrice} - ${supplyPrice} - (${discountPrice} × 0.6%) = ${discountProfit.toFixed(2)}`}>
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
                  <li>99折价格 = 后台拼单价 × 0.99 - {priceAddition}元</li>
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