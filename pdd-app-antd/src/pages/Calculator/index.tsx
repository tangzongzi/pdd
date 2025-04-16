import React, { useEffect, useRef } from 'react';
import { Card, Typography, Form, InputNumber, Row, Col, Divider, Tooltip } from 'antd';
import { 
  CalculatorOutlined, 
  InfoCircleOutlined, 
  ArrowRightOutlined, 
  PlusCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useCalculatorStore } from '@/models/calculator';
import './index.less';

const { Title, Paragraph } = Typography;

// 价格输入表单组件
const PriceInputForm: React.FC = () => {
  const { 
    supplyPrice, 
    groupPrice, 
    priceAddition, 
    marketMaxPrice, 
    isPriceExceedLimit, 
    setSupplyPrice, 
    setGroupPrice, 
    setPriceAddition, 
    setMarketMaxPrice 
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
  }, [supplyPrice, groupPrice, priceAddition, saveToHistory]);

  // 格式化价格显示
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // 格式化百分比显示
  const formatPercent = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  return (
    <div className="calculator-page">
      <Card
        title={<>
          <CalculatorOutlined /> 拼多多价格计算器
          {isPriceExceedLimit && <span className="price-exceed-warning">价格已超出市场控价！</span>}
        </>}
        className="calculator-card"
      >
        <PriceInputForm />
        
        <Divider orientation="left">
          <span className="section-title">计算结果</span>
        </Divider>
        
        <div className="price-results">
          <Row gutter={[16, 16]}>
            {/* 后台拼单价 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="后台拼单价"
              >
                <div className="result-value">
                  ¥{formatPrice(backendGroupPrice)}
                </div>
                <div className="result-formula">
                  <Tooltip title="后台拼单价 = 拼单价 + 加价金额">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 单买价 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="单买价"
              >
                <div className="result-value">
                  ¥{formatPrice(singlePrice)}
                </div>
                <div className="result-formula">
                  <Tooltip title="单买价 = 后台拼单价 + 加价金额">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 拼单利润 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="拼单利润"
              >
                <div className={`result-value ${groupProfit < 0 ? 'negative' : ''}`}>
                  {groupProfit < 0 ? '-' : ''}¥{formatPrice(Math.abs(groupProfit))}
                </div>
                <div className="result-formula">
                  <Tooltip title="拼单利润 = 拼单价 - 供货价 - 平台手续费">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 单买利润 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="单买利润"
              >
                <div className={`result-value ${singleProfit < 0 ? 'negative' : ''}`}>
                  {singleProfit < 0 ? '-' : ''}¥{formatPrice(Math.abs(singleProfit))}
                </div>
                <div className="result-formula">
                  <Tooltip title="单买利润 = 单买价 - 供货价 - 平台手续费">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 平台费用 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="拼单平台费"
              >
                <div className="result-value">
                  ¥{formatPrice(groupPlatformFee)}
                </div>
                <div className="result-formula">
                  <Tooltip title="平台手续费 = 拼单价 × 0.6%">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 单独购买平台费 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="单买平台费"
              >
                <div className="result-value">
                  ¥{formatPrice(singlePlatformFee)}
                </div>
                <div className="result-formula">
                  <Tooltip title="平台手续费 = 单买价 × 0.6%">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 限时折扣价 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="限时折扣价 (99折)"
              >
                <div className="result-value">
                  ¥{formatPrice(discountPrice)}
                </div>
                <div className="result-formula">
                  <Tooltip title="限时折扣价 = (后台价 × 0.99) - 加价金额">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
            
            {/* 折扣价利润 */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card 
                className="result-card" 
                size="small"
                title="折扣价利润"
              >
                <div className={`result-value ${discountProfit < 0 ? 'negative' : ''}`}>
                  {discountProfit < 0 ? '-' : ''}¥{formatPrice(Math.abs(discountProfit))}
                </div>
                <div className="result-formula">
                  <Tooltip title="折扣价利润 = 折扣价 - 供货价 - 平台手续费">
                    <InfoCircleOutlined /> 计算公式
                  </Tooltip>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <Divider dashed />
        
        <Paragraph className="calculator-note">
          <InfoCircleOutlined /> 说明：利润计算已考虑平台0.6%手续费，但不包含其他可能的费用（如运费、包装等）。
        </Paragraph>
      </Card>
    </div>
  );
}; 