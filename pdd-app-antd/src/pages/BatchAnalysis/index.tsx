import React, { useEffect } from 'react';
import { 
  Card, Typography, Input, InputNumber, Button, Table, 
  Row, Col, Form, Alert, Empty, Divider, Space, Tooltip, Badge 
} from 'antd';
import { 
  LineChartOutlined, 
  InfoCircleOutlined, 
  SyncOutlined, 
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useBatchAnalysisStore } from '@/models/batch';
import './index.less';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export const BatchAnalysis: React.FC = () => {
  // 从全局状态获取数据和方法
  const {
    inputText,
    priceAddition,
    products,
    setInputText,
    setPriceAddition,
    parseProductInfo,
    updateSellPrice,
    saveToHistory
  } = useBatchAnalysisStore();

  // 监听产品变化，当有有效产品时保存历史记录
  useEffect(() => {
    // 检查是否有有效的产品（至少有一个产品有售卖价）
    const hasValidProducts = products.some(product => product.sellPrice > 0);
    
    if (hasValidProducts) {
      // 使用防抖，延迟3秒保存，避免频繁保存
      const saveTimer = setTimeout(() => {
        saveToHistory();
      }, 3000);
      
      return () => clearTimeout(saveTimer);
    }
  }, [products, saveToHistory]);

  // 表格列定义
  const columns = [
    {
      title: '产品规格',
      dataIndex: 'spec',
      key: 'spec',
      width: '20%',
      ellipsis: true,
      render: (text: string) => <div style={{ textAlign: 'left' }}>{text}</div>
    },
    {
      title: '供货价(元)',
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
      width: '10%',
      render: (price: number) => price.toFixed(2)
    },
    {
      title: 'PDD最终售卖价',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      width: '12%',
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          step={0.01}
          style={{ width: '100%' }}
          value={record.sellPrice || null}
          placeholder="输入售卖价"
          onChange={(value) => updateSellPrice(record.id, Number(value) || 0)}
        />
      )
    },
    {
      title: '99折后的售卖价',
      dataIndex: 'discountedSellPrice',
      key: 'discountedSellPrice',
      width: '10%',
      render: (price: number) => (price ? price.toFixed(2) : '0.00')
    },
    {
      title: (<div style={{ color: '#c53030', fontWeight: 'bold' }}>拼单价<br/>(售卖价+加价)</div>),
      dataIndex: 'groupPrice',
      key: 'groupPrice',
      width: '10%',
      render: (price: number) => (
        <Text type="danger" strong>{price ? price.toFixed(2) : '0.00'}</Text>
      )
    },
    {
      title: '99折价(拼单价×0.99)',
      dataIndex: 'discountedGroupPrice',
      key: 'discountedGroupPrice',
      width: '12%',
      render: (price: number) => (price ? price.toFixed(2) : '0.00')
    },
    {
      title: '利润(已扣除0.6%手续费)',
      dataIndex: 'profit',
      key: 'profit',
      width: '12%',
      render: (profit: number) => (
        profit === 0 ? '0.00' :
          profit > 0 ? <Text type="success" strong>{profit.toFixed(2)}</Text> :
            <Text type="danger" strong>{profit.toFixed(2)}</Text>
      )
    },
    {
      title: '99折后利润',
      dataIndex: 'discountedProfit',
      key: 'discountedProfit',
      width: '10%',
      render: (profit: number) => (
        profit === 0 ? '0.00' :
          profit > 0 ? <Text type="success" strong>{profit.toFixed(2)}</Text> :
            <Text type="danger" strong>{profit.toFixed(2)}</Text>
      )
    }
  ];

  return (
    <div className="batch-analysis-page">
      <Card bordered={false} className="main-card">
        {/* 标题区域 */}
        <div className="page-header">
          <LineChartOutlined className="header-icon" />
          <div>
            <Title level={3}>PDD批量价格计算器</Title>
            <Paragraph className="subtitle">快速计算多规格商品的拼单价、99折价与利润</Paragraph>
          </div>
        </div>

        <Divider />

        {/* 步骤式输入流程 */}
        <div className="input-flow">
          {/* 第一步：粘贴产品信息 */}
          <div className="step-section">
            <div className="step-header">
              <Badge count={1} color="#1a365d" />
              <Typography.Title level={5}>粘贴产品信息</Typography.Title>
              <Tooltip title="从拼多多后台复制产品信息，包含规格和价格数据">
                <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
              </Tooltip>
            </div>
            
            <TextArea
              className="product-input"
              placeholder={`示例格式:
金汤酸菜鱼430g*3袋
¥34
2632件可售
0
金汤酸菜鱼430g*6袋
¥67.92
2226件可售
0`}
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          
          {/* 第二步和第三步：设置加价金额和解析 */}
          <div className="operation-section">
            <div className="step-row">
              <div className="price-setting">
                <div className="step-header">
                  <Badge count={2} color="#1a365d" />
                  <Typography.Title level={5}>设置加价金额</Typography.Title>
                  <Tooltip title="设置后台加价金额，影响最终拼单价计算">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </div>
                
                <div className="price-input-row">
                  <InputNumber
                    addonBefore="加价金额"
                    addonAfter="元"
                    min={0}
                    step={1}
                    precision={0}
                    value={priceAddition}
                    onChange={(value) => setPriceAddition(Number(value) || 0)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="price-hint">默认为6元，用于计算拼单价 = 售卖价 + 加价金额</div>
              </div>
              
              <div className="parse-section">
                <div className="step-header">
                  <Badge count={3} color="#1a365d" />
                  <Typography.Title level={5}>解析信息</Typography.Title>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<SyncOutlined />}
                  onClick={parseProductInfo}
                  className="parse-button"
                  block
                >
                  解析产品信息
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 结果表格区域 */}
        {products.length > 0 && (
          <div className="results-section">
            <Divider>
              <Space>
                <LineChartOutlined />
                <Typography.Text strong>价格计算结果</Typography.Text>
              </Space>
            </Divider>
            
            <Table
              dataSource={products}
              columns={columns}
              pagination={false}
              rowKey="id"
              scroll={{ x: 1000 }}
              bordered
              className="result-table"
            />
          </div>
        )}
        
        {products.length === 0 && inputText && (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="未解析到产品数据，请检查输入格式是否正确"
            className="empty-state"
          />
        )}

        {/* 使用说明 */}
        <div className="usage-note">
          <Alert
            message={
              <div>
                <div className="note-title">
                  <InfoCircleOutlined /> 使用说明
                </div>
                <ol className="note-list">
                  <li>从拼多多商家后台复制产品规格和价格信息</li>
                  <li>粘贴到输入框中，设置加价金额（默认6元）</li>
                  <li>点击"解析产品信息"按钮，系统自动解析</li>
                  <li>在表格中输入每个规格的最终售卖价</li>
                  <li>系统自动计算拼单价、99折价和利润</li>
                </ol>
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