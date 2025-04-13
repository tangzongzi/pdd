import React, { useEffect } from 'react';
import { 
  Card, Typography, Input, InputNumber, Button, Table, 
  Row, Col, Form, Alert, Empty, Divider, Space, Tooltip 
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

        {/* 输入区域 */}
        <div className="input-section">
          <Form layout="vertical">
            <Form.Item 
              label={
                <Space>
                  <span>粘贴产品信息</span>
                  <Tooltip title="从拼多多后台复制产品信息，包含规格和价格数据">
                    <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              className="product-info-form-item"
            >
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`示例格式:
金汤酸菜鱼430g*3袋
¥34
2632件可售
0
金汤酸菜鱼430g*6袋
¥67.92
2226件可售
0`}
                rows={10}
                className="product-input"
              />
            </Form.Item>

            <div className="action-section">
              <Row gutter={16} align="middle" justify="space-between" className="action-row">
                <Col xs={24} md={12} className="price-addition-col">
                  <Form.Item 
                    label={
                      <Space>
                        <span>拼单价加价金额</span>
                        <Tooltip title="设置后台加价金额，影响最终拼单价计算">
                          <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                        </Tooltip>
                      </Space>
                    }
                    className="price-addition-form-item"
                  >
                    <div className="price-input-wrapper">
                      <InputNumber
                        min={0}
                        step={1}
                        precision={0}
                        value={priceAddition}
                        onChange={(value) => setPriceAddition(Number(value) || 0)}
                        className="price-addition-input"
                        controls={false}
                      />
                      <div className="price-addition-unit">元</div>
                    </div>
                    <div className="price-addition-hint">默认为6元，用于计算拼单价 = 售卖价 + 加价金额</div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} className="action-button-col">
                  <Button 
                    type="primary" 
                    block 
                    icon={<SyncOutlined />}
                    onClick={parseProductInfo}
                    size="large"
                    className="parse-button"
                  >
                    解析产品信息
                  </Button>
                </Col>
              </Row>
            </div>
          </Form>
        </div>

        {/* 结果表格区域 */}
        {products.length > 0 && (
          <div className="results-table">
            <Divider orientation="left">
              <Text strong style={{ fontSize: '16px', color: '#1a365d' }}>
                <LineChartOutlined /> 价格计算结果
              </Text>
            </Divider>
            <Table
              dataSource={products}
              columns={columns}
              pagination={false}
              rowKey="id"
              scroll={{ x: 1000 }}
              bordered
              className="analysis-table"
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
                <ul className="note-list">
                  <li>从拼多多后台复制产品信息，粘贴到上方文本框</li>
                  <li>设置"拼单价加价金额"（默认为6元）</li>
                  <li>点击"解析产品信息"按钮，系统会自动提取产品规格和供货价</li>
                  <li>在"PDD最终售卖价"列输入您想设置的售卖价格</li>
                  <li>系统会自动计算99折后的售卖价、拼单价、99折价以及利润</li>
                  <li><Text type="danger" strong>红色标记的拼单价</Text>是最终要填入平台的价格</li>
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