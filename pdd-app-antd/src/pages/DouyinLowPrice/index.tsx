import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Divider,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Tooltip,
  Slider,
  Switch,
  Button
} from 'antd';
import {
  DollarOutlined,
  TagOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  CalculatorOutlined,
  ShopOutlined
} from '@ant-design/icons';
import './index.less';
import { useHistoryStore } from '@/stores/historyStore';
import { CalculationType, Platform, DouyinLowPriceRecord } from '@/types/history';

const { Text, Title } = Typography;

interface FormData {
  supplierPrice: number; // 供货价/成本
  priceAddition?: number; // 价格加成金额
}

// 定价参数
const PRICE_MULTIPLIER = 2; // 2倍
const DEFAULT_PRICE_ADDITION = 10; // 默认加10元
const DEFAULT_MIN_PROFIT = 1; // 默认保本+1元利润
const LIMITED_DISCOUNT_RATE = 0.7; // 限时7折

// 平台扣点比例
const PLATFORM_FEE_RATE = 0.02; // 2%

const DouyinLowPrice: React.FC = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [listingPrice, setListingPrice] = useState<number>(0); // 上架价格
  const [limitedTimePrice, setLimitedTimePrice] = useState<number>(0); // 限时7折价格
  const [showResults, setShowResults] = useState<boolean>(false);
  const [platformFee, setPlatformFee] = useState<number>(0); // 平台扣点
  const [newUserCoupon, setNewUserCoupon] = useState<number>(0); // 新人券金额
  const [finalPrice, setFinalPrice] = useState<number>(0); // 最终价格
  const [profit, setProfit] = useState<number>(0); // 利润
  const [profitRate, setProfitRate] = useState<number>(0); // 利润率
  const [enableLimitedDiscount, setEnableLimitedDiscount] = useState<boolean>(true); // 是否启用限时折扣
  const [priceAddition, setPriceAddition] = useState<number>(DEFAULT_PRICE_ADDITION); // 价格加成金额
  const { addRecord } = useHistoryStore();

  // 当表单值变化时自动计算
  const valuesChange = (changedValues: any, allValues: FormData) => {
    // 如果价格加成金额变化，更新状态
    if (changedValues.priceAddition !== undefined) {
      setPriceAddition(changedValues.priceAddition);
    }
    
    // 只要供货价存在且大于0，就进行计算
    if (allValues.supplierPrice && allValues.supplierPrice > 0) {
      calculateResults(allValues);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // 新人券金额变化时重新计算
  const handleCouponChange = (value: number) => {
    if (formData?.supplierPrice) {
      setNewUserCoupon(value);
      
      // 重新计算最终价格
      const basePrice = enableLimitedDiscount ? limitedTimePrice : listingPrice;
      const newFinalPrice = Math.max(0.01, basePrice - value);
      setFinalPrice(newFinalPrice);
      
      // 重新计算平台扣点
      const newPlatformFee = newFinalPrice * PLATFORM_FEE_RATE;
      setPlatformFee(newPlatformFee);
      
      // 重新计算利润
      const newProfit = newFinalPrice - formData.supplierPrice - newPlatformFee;
      setProfit(newProfit);
      
      // 重新计算利润率
      const newProfitRate = (newProfit / formData.supplierPrice) * 100;
      setProfitRate(newProfitRate);
      
      // 添加到历史记录
      addRecord({
        type: CalculationType.DOUYIN_LOW_PRICE,
        platform: Platform.DOUYIN,
        supplyPrice: formData.supplierPrice,
        listingPrice: listingPrice,
        couponAmount: value,
        newUserPrice: newFinalPrice,
        profit: newProfit,
        platformFee: newPlatformFee,
      } as Omit<DouyinLowPriceRecord, 'id' | 'timestamp'>);
    }
  };

  // 切换限时折扣状态
  const handleToggleLimitedDiscount = (checked: boolean) => {
    setEnableLimitedDiscount(checked);
    
    // 只有当已经有计算结果时才重新计算
    if (formData && showResults) {
      // 保持当前表单数据不变，仅更新限时折扣状态并重新计算
      const updatedFormData = { ...formData };
      calculateResults(updatedFormData);
    }
  };

  // 处理价格加成金额变化
  const handlePriceAdditionChange = (value: number | null) => {
    const newPriceAddition = value || 0;
    setPriceAddition(newPriceAddition);
    
    // 更新表单值
    form.setFieldsValue({ priceAddition: newPriceAddition });
    
    // 只有在已有供货价的情况下才重新计算
    if (formData?.supplierPrice) {
      const updatedFormData = { ...formData, priceAddition: newPriceAddition };
      calculateResults(updatedFormData);
      setShowResults(true);
    }
  };

  // 重置计算
  const handleReset = () => {
    // 如果表单中有值，执行计算
    const supplierPrice = form.getFieldValue('supplierPrice');
    if (supplierPrice && supplierPrice > 0) {
      calculateResults({
        supplierPrice,
        priceAddition: form.getFieldValue('priceAddition') || DEFAULT_PRICE_ADDITION
      });
    } else {
      // 如果没有值，重置所有状态
      form.resetFields();
      setShowResults(false);
      setFormData(null);
      setListingPrice(0);
      setLimitedTimePrice(0);
      setPlatformFee(0);
      setNewUserCoupon(0);
      setFinalPrice(0);
      setProfit(0);
      setProfitRate(0);
      setPriceAddition(DEFAULT_PRICE_ADDITION);
    }
  };

  const calculateResults = (values: FormData) => {
    const { supplierPrice } = values;
    
    // 获取价格加成金额 - 优先使用表单数据中的值，如果没有则使用状态中的值
    const currentPriceAddition = values.priceAddition !== undefined ? values.priceAddition : priceAddition;
    
    // 计算上架价格 = 供货价 × 2 + 加成金额
    const calculatedListingPrice = supplierPrice * PRICE_MULTIPLIER + currentPriceAddition;
    
    // 计算限时7折价格
    const calculatedLimitedTimePrice = Math.round(calculatedListingPrice * LIMITED_DISCOUNT_RATE * 100) / 100;
    
    // 根据是否启用限时折扣选择基础价格
    const basePrice = enableLimitedDiscount ? calculatedLimitedTimePrice : calculatedListingPrice;
    
    // 根据保本+1元利润计算默认新人券金额
    // 售价 - 新人券 = 供货价 + 平台扣点 + 1元利润
    // 新人券 = 售价 - 供货价 - 平台扣点 - 1元利润
    const minPrice = supplierPrice + (supplierPrice * PLATFORM_FEE_RATE) + DEFAULT_MIN_PROFIT;
    const calculatedCoupon = Math.round(Math.max(0, basePrice - minPrice));
    
    // 计算最终价格 = 基础价格 - 新人券
    const calculatedFinalPrice = Math.max(0.01, basePrice - calculatedCoupon);
    
    // 计算平台扣点
    const calculatedPlatformFee = calculatedFinalPrice * PLATFORM_FEE_RATE;
    
    // 计算利润 = 最终价格 - 供货价 - 平台扣点
    const calculatedProfit = calculatedFinalPrice - supplierPrice - calculatedPlatformFee;
    
    // 计算利润率 = 利润 / 供货价 * 100%
    const calculatedProfitRate = (calculatedProfit / supplierPrice) * 100;

    // 更新状态
    setFormData(values);
    setListingPrice(calculatedListingPrice);
    setLimitedTimePrice(calculatedLimitedTimePrice);
    setNewUserCoupon(calculatedCoupon);
    setFinalPrice(calculatedFinalPrice);
    setPlatformFee(calculatedPlatformFee);
    setProfit(calculatedProfit);
    setProfitRate(calculatedProfitRate);

    // 添加到历史记录
    addRecord({
      type: CalculationType.DOUYIN_LOW_PRICE,
      platform: Platform.DOUYIN,
      supplyPrice: supplierPrice,
      listingPrice: calculatedListingPrice,
      couponAmount: calculatedCoupon,
      newUserPrice: calculatedFinalPrice,
      profit: calculatedProfit,
      platformFee: calculatedPlatformFee,
    } as Omit<DouyinLowPriceRecord, 'id' | 'timestamp'>);
  };

  // 计算新人券可调范围
  const getMaxCoupon = () => {
    if (!formData?.supplierPrice || !listingPrice) return 0;
    
    // 根据是否启用限时折扣选择基础价格
    const basePrice = enableLimitedDiscount ? limitedTimePrice : listingPrice;
    
    // 最大值为基础价格 - 0.01元(保证最低价0.01元)
    return Math.floor(basePrice - 0.01);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4} className="page-title">
          <CalculatorOutlined className="header-icon" />
          抖音低价起价计算器
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
              initialValues={{ 
                supplierPrice: undefined, 
                priceAddition: DEFAULT_PRICE_ADDITION 
              }}
            >
              <Form.Item
                label={<span className="form-label"><ShopOutlined />供货价</span>}
                name="supplierPrice"
                rules={[{ required: true, message: '请输入供货价' }]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  placeholder="请输入供货价/成本"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item
                label={
                  <span className="form-label">
                    <DollarOutlined />价格加成金额
                    <Tooltip title="在供货价×2的基础上额外增加的金额">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </span>
                }
                name="priceAddition"
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="默认为10元"
                  style={{ width: '100%' }}
                  value={priceAddition}
                  onChange={handlePriceAdditionChange}
                  addonAfter="元"
                />
                <div className="price-slider-container">
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={priceAddition}
                    onChange={handlePriceAdditionChange}
                    tooltip={{ formatter: value => `¥${value}` }}
                    marks={{
                      0: '¥0',
                      50: '¥50'
                    }}
                  />
                </div>
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
            
            <div className="strategy-info">
              <Alert
                className="info-alert"
                type="info"
                message="抖音低价起价策略说明"
                description={
                  <Space direction="vertical" size={2}>
                    <Text>1. 上架价格: ¥{listingPrice ? listingPrice.toFixed(2) : '40.00'} {formData ? `(供货价×2+${priceAddition}元)` : '(供货价×2+10元)'}</Text>
                    <Text>2. 前5-10天：上架价格{listingPrice ? listingPrice.toFixed(2) : '40.00'}元 → 限时7折至{limitedTimePrice ? limitedTimePrice.toFixed(2) : '28.00'}元</Text>
                    <Text>3. 新人券金额: ¥{newUserCoupon ? newUserCoupon.toFixed(2) : '12.00'}</Text>
                    <Text>4. 最终价格: ¥{finalPrice ? finalPrice.toFixed(2) : '16.00'}</Text>
                    <Text>5. 平台扣点({PLATFORM_FEE_RATE * 100}%): ¥{platformFee ? platformFee.toFixed(2) : '0.32'}（按最终价格计算）</Text>
                    <Text>6. 实际利润 = 最终价格 - 供货价 - 平台扣点 = ¥{profit ? profit.toFixed(2) : '0.68'}</Text>
                    <Text>7. 建议：新品前5-10天使用超低价引流，之后关闭新人礼金转为正常价格</Text>
                    <Text>8. 活动截止后：立即关闭礼金 → 恢复原价 → 开放阶梯立减券</Text>
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
            
            {/* 上架价格 */}
            <div className="result-item">
              <DollarOutlined className="item-icon" />
              <span className="item-label">上架价格</span>
              <span className="item-value" style={{ color: '#ff4d4f' }}>¥{listingPrice ? listingPrice.toFixed(2) : '0.00'}</span>
              <span className="item-desc">{formData ? `(供货价×2+${priceAddition}元)` : ''}</span>
            </div>
            
            {/* 限时折扣价格 */}
            <div className="result-item limited-discount-row">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">限时7折</span>
              <span className="item-value">¥{limitedTimePrice ? limitedTimePrice.toFixed(2) : '28.00'}</span>
              <span className="item-desc">{formData ? '(上架价×0.7)' : ''}</span>
              <div className="switch-container">
                <Switch 
                  checked={enableLimitedDiscount} 
                  onChange={handleToggleLimitedDiscount}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  size="small"
                />
              </div>
            </div>
            
            {/* 新人券 */}
            <div className="result-item">
              <TagOutlined className="item-icon" />
              <span className="item-label">新人券</span>
              <span className="item-value" style={{ color: '#722ed1' }}>¥{newUserCoupon || '0'}</span>
              <span className="item-desc">{formData ? '(自动计算)' : ''}</span>
            </div>
            
            {/* 平台扣点 */}
            <div className="result-item">
              <PercentageOutlined className="item-icon" />
              <span className="item-label">平台扣点</span>
              <span className="item-value" style={{ color: '#fa8c16' }}>¥{platformFee ? platformFee.toFixed(2) : '0.00'}</span>
              <span className="item-desc">{formData ? '(最终价格×2%)' : ''}</span>
            </div>
            
            <Divider className="divider" />
            
            {/* 新人券调整区域 - 只在有计算结果时显示 */}
            {showResults && (
              <>
                <div className="slider-control">
                  <div className="slider-title">
                    <TagOutlined className="slider-icon" />
                    <span>调整新人券金额</span>
                  </div>
                  <div className="slider-container">
                    <Slider
                      min={0}
                      max={getMaxCoupon()}
                      onChange={handleCouponChange}
                      value={newUserCoupon}
                      step={1}
                      tooltip={{ formatter: value => `¥${value}` }}
                    />
                  </div>
                </div>
                
                <Divider className="divider" />
                
                {/* 最终结果区域 */}
                <div className="profit-result">
                  <div className="formula">
                    <CalculatorOutlined className="formula-icon" />
                    <span>最终价格 = {enableLimitedDiscount ? '限时7折价' : '上架价'} - 新人券 = ¥{finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="formula">
                    <CalculatorOutlined className="formula-icon" />
                    <span>利润 = 最终价格 - 供货价 - 平台扣点</span>
                  </div>
                  <div className="final-profit" style={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    ¥{profit.toFixed(2)} ({profitRate.toFixed(1)}%)
                  </div>
                </div>
              </>
            )}
            
            {!showResults && (
              <div className="empty-result">
                <Alert
                  message="请输入供货价并点击「开始计算」按钮"
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

export default DouyinLowPrice; 