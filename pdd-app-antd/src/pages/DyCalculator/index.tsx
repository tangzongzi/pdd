import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Alert, Tooltip, Button } from 'antd';
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
          message="输入供货价和抖音价后，将显示不同利润档位选项"
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
  
  // 根据利润率计算抖音价 - 强制每次都重新计算
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
          const rates = getProfitRates();
          return rates.map((rate) => {
            const priceInfo = calculatePriceByRate(rate.value);
            const isSelected = selectedRateId === rate.id;
            const isNearCurrent = isNearCurrentRate(rate.value);
            const profitAmount = calculateProfit(rate.value);
            
            return (
              <div
                key={rate.id}
                className={`profit-rate-option ${isSelected ? 'selected' : ''} ${isNearCurrent ? 'near-current' : ''}`}
                onClick={() => handleSelectRate(rate)}
              >
                <div className="rate-label">
                  <span className="rate-name">{rate.label}</span>
                  <span className="rate-value">{(rate.value * 100).toFixed(1)}%</span>
                </div>
                <div className="rate-description">{rate.description}</div>
                <div className="rate-details">
                  <span className="price">¥{priceInfo.price.toFixed(2)}</span>
                  <span className="profit">利润：¥{profitAmount}</span>
                </div>
                {priceInfo.isExceeded && (
                  <div className="exceeded-warning">超出市场控价</div>
                )}
              </div>
            );
          });
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
    setSupplyPrice, 
    setGroupPrice, 
    setPriceAddition,
    calculateResults
  } = useCalculatorStore();
  
  // 处理供货价变化
  const handleSupplyPriceChange = (value: number | null) => {
    setSupplyPrice(value || 0);
  };
  
  // 处理抖音价变化
  const handleGroupPriceChange = (value: number | null) => {
    setGroupPrice(value || 0);
  };
  
  // 处理加价变化
  const handlePriceAdditionChange = (value: number | null) => {
    setPriceAddition(value || 0);
  };
  
  return (
    <Form layout="vertical" className="price-input-form">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label={
              <span>
                供货价
                <Tooltip title="商品的进货成本价格">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
          >
            <InputNumber
              prefix="¥"
              placeholder="请输入供货价"
              value={supplyPrice}
              onChange={handleSupplyPriceChange}
              precision={2}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span>
                抖音价
                <Tooltip title="在抖音平台上的销售价格">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
          >
            <InputNumber
              prefix="¥"
              placeholder="请输入抖音价"
              value={groupPrice}
              onChange={handleGroupPriceChange}
              precision={2}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={
              <span>
                后台加价
                <Tooltip title="额外的运营成本或利润加成">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
          >
            <InputNumber
              prefix="¥"
              placeholder="请输入后台加价"
              value={priceAddition}
              onChange={handlePriceAdditionChange}
              precision={2}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

// 主组件
export const DyCalculator: React.FC = () => {
  const { 
    supplyPrice, 
    groupPrice, 
    priceAddition, 
    backendGroupPrice, 
    singlePrice, 
    groupProfit, 
    singleProfit,
    discountedPrice,
    calculateResults,
    saveToHistory
  } = useCalculatorStore();
  
  // 当价格变化时重新计算结果
  useEffect(() => {
    if (supplyPrice > 0 || groupPrice > 0) {
      calculateResults();
    }
  }, [supplyPrice, groupPrice, priceAddition]);
  
  // 当有有效计算结果时保存到历史记录
  useEffect(() => {
    if (supplyPrice > 0 && groupPrice > 0) {
      const timer = setTimeout(() => {
        saveToHistory();
      }, 2000); // 延迟2秒保存，避免频繁保存
      return () => clearTimeout(timer);
    }
  }, [supplyPrice, groupPrice, priceAddition]);
  
  return (
    <div className="calculator-page">
      <Card className="calculator-card">
        <div className="page-header">
          <Title level={2}>
            <CalculatorOutlined /> 抖音价格计算器
          </Title>
          <Paragraph>
            输入供货价和抖音价，自动计算利润率和推荐价格
          </Paragraph>
        </div>
        
        <PriceInputForm />
        
        <Divider />
        
        <div className="results-section">
          <Row gutter={16}>
            <Col span={8}>
              <Card className="result-card">
                <div className="result-title">
                  <DollarOutlined /> 后台抖音价
                </div>
                <div className="result-value">
                  ¥{backendGroupPrice.toFixed(2)}
                </div>
                <div className="result-description">
                  含后台加价后的实际抖音价
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="result-card">
                <div className="result-title">
                  <DollarOutlined /> 单买价
                </div>
                <div className="result-value">
                  ¥{singlePrice.toFixed(2)}
                </div>
                <div className="result-description">
                  单件购买的价格
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="result-card">
                <div className="result-title">
                  <PercentageOutlined /> 抖音利润
                </div>
                <div className="result-value" style={{ color: groupProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                  {groupProfit >= 0 ? '+' : ''}¥{groupProfit.toFixed(2)}
                </div>
                <div className="result-description">
                  抖音价减去供货价的利润
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Card className="result-card">
                <div className="result-title">
                  <PercentageOutlined /> 单买利润
                </div>
                <div className="result-value" style={{ color: singleProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                  {singleProfit >= 0 ? '+' : ''}¥{singleProfit.toFixed(2)}
                </div>
                <div className="result-description">
                  单买价减去供货价的利润
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="result-card">
                <div className="result-title">
                  <DollarOutlined /> 折扣价
                </div>
                <div className="result-value">
                  ¥{discountedPrice.toFixed(2)}
                </div>
                <div className="result-description">
                  7折活动价格
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <Divider />
        
        <ProfitRateSelector />
      </Card>
    </div>
  );
}; 