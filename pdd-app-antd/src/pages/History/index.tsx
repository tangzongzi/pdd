import React, { useState } from 'react';
import { 
  Card, Typography, Tabs, List, Button, Tag, Empty, 
  Popconfirm, Tooltip, Divider, Space, Modal, Pagination
} from 'antd';
import { 
  HistoryOutlined, 
  DeleteOutlined, 
  RollbackOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore, SingleCalculationHistory, BatchCalculationHistory } from '@/models/history';
import { useCalculatorStore } from '@/models/calculator';
import { useBatchAnalysisStore } from '@/models/batch';
import './index.less';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 每页显示的记录数量
const PAGE_SIZE = 5;

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 获取历史记录
  const { history, clearHistory } = useHistoryStore();
  
  // 获取计算器和批量计算的方法
  const { setSupplyPrice, setGroupPrice, setPriceAddition: setCalcPriceAddition } = useCalculatorStore();
  const { setInputText, setPriceAddition: setBatchPriceAddition } = useBatchAnalysisStore();
  
  // 根据标签筛选历史记录
  const filteredHistory = activeTab === 'all' 
    ? history 
    : history.filter(record => record.type === activeTab);
  
  // 根据当前页码获取分页数据
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE, 
    currentPage * PAGE_SIZE
  );
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 当标签切换时重置页码
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  
  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 恢复单个计算记录
  const restoreSingleCalculation = (record: SingleCalculationHistory) => {
    setSupplyPrice(record.supplyPrice);
    setGroupPrice(record.groupPrice);
    setCalcPriceAddition(record.priceAddition);
    
    // 导航到计算器页面
    navigate('/calculator');
  };
  
  // 恢复批量计算记录
  const restoreBatchCalculation = (record: BatchCalculationHistory) => {
    // 构建输入文本
    const inputLines = record.products.map(product => 
      `${product.spec}\n¥${product.supplyPrice}`
    ).join('\n\n');
    
    setInputText(inputLines);
    setBatchPriceAddition(record.priceAddition);
    
    // 导航到批量分析页面
    navigate('/batch');
  };
  
  // 查看详情
  const viewDetails = (record: SingleCalculationHistory | BatchCalculationHistory) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };
  
  // 清空历史记录
  const handleClearHistory = () => {
    clearHistory();
    setCurrentPage(1);
  };
  
  // 渲染单个计算记录
  const renderSingleCalculation = (record: SingleCalculationHistory) => (
    <List.Item
      key={record.id}
      className="history-item"
      actions={[
        <Tooltip title="查看详情">
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => viewDetails(record)}
          />
        </Tooltip>,
        <Tooltip title="恢复计算">
          <Button 
            type="primary" 
            ghost
            icon={<RollbackOutlined />} 
            onClick={() => restoreSingleCalculation(record)}
          />
        </Tooltip>
      ]}
    >
      <div className="history-item-content">
        <div className="history-item-header">
          <Tag color="blue" icon={<CalculatorOutlined />}>拼单计算</Tag>
          <span className="history-time">{formatDate(record.timestamp)}</span>
        </div>
        <div className="history-item-details">
          <div className="detail-item">
            <Text type="secondary">供货价:</Text>
            <Text>¥{record.supplyPrice.toFixed(2)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">拼单价:</Text>
            <Text>¥{record.groupPrice.toFixed(2)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">利润:</Text>
            <Text className={record.profit >= 0 ? 'profit' : 'loss'}>
              {record.profit >= 0 ? '+' : ''}¥{record.profit.toFixed(2)}
            </Text>
          </div>
        </div>
      </div>
    </List.Item>
  );
  
  // 渲染批量计算记录
  const renderBatchCalculation = (record: BatchCalculationHistory) => (
    <List.Item
      key={record.id}
      className="history-item"
      actions={[
        <Tooltip title="查看详情">
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => viewDetails(record)}
          />
        </Tooltip>,
        <Tooltip title="恢复计算">
          <Button 
            type="primary" 
            ghost
            icon={<RollbackOutlined />} 
            onClick={() => restoreBatchCalculation(record)}
          />
        </Tooltip>
      ]}
    >
      <div className="history-item-content">
        <div className="history-item-header">
          <Tag color="green" icon={<ApartmentOutlined />}>批量计算</Tag>
          <span className="history-time">{formatDate(record.timestamp)}</span>
        </div>
        <div className="history-item-details">
          <div className="detail-item">
            <Text type="secondary">产品数量:</Text>
            <Text>{record.productCount} 个产品</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">加价金额:</Text>
            <Text>¥{record.priceAddition}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">示例产品:</Text>
            <Text ellipsis={{ tooltip: record.products[0]?.spec }}>
              {record.products[0]?.spec.substring(0, 15)}
              {record.products[0]?.spec.length > 15 ? '...' : ''}
            </Text>
          </div>
        </div>
      </div>
    </List.Item>
  );
  
  // 渲染详情弹窗内容
  const renderDetailModalContent = () => {
    if (!selectedRecord) return null;
    
    if (selectedRecord.type === 'single') {
      const record = selectedRecord as SingleCalculationHistory;
      return (
        <div className="detail-modal-content">
          <div className="detail-header">
            <div className="detail-title">
              <CalculatorOutlined /> 拼单计算详情
            </div>
            <div className="detail-time">
              {formatDate(record.timestamp)}
            </div>
          </div>
          
          <Divider />
          
          <div className="detail-section">
            <div className="detail-row">
              <div className="detail-label">供货价:</div>
              <div className="detail-value">¥{record.supplyPrice.toFixed(2)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">拼单价:</div>
              <div className="detail-value">¥{record.groupPrice.toFixed(2)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">加价金额:</div>
              <div className="detail-value">¥{record.priceAddition}</div>
            </div>
          </div>
          
          <Divider />
          
          <div className="detail-section">
            <div className="detail-row">
              <div className="detail-label">后台拼单价:</div>
              <div className="detail-value">¥{record.backendGroupPrice.toFixed(2)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">单买价:</div>
              <div className="detail-value">¥{record.singlePrice.toFixed(2)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">99折价:</div>
              <div className="detail-value">¥{record.discountPrice.toFixed(2)}</div>
            </div>
          </div>
          
          <Divider />
          
          <div className="detail-section">
            <div className="detail-row">
              <div className="detail-label">利润:</div>
              <div className={`detail-value ${record.profit >= 0 ? 'profit' : 'loss'}`}>
                {record.profit >= 0 ? '+' : ''}¥{record.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      const record = selectedRecord as BatchCalculationHistory;
      return (
        <div className="detail-modal-content">
          <div className="detail-header">
            <div className="detail-title">
              <ApartmentOutlined /> 批量计算详情
            </div>
            <div className="detail-time">
              {formatDate(record.timestamp)}
            </div>
          </div>
          
          <Divider />
          
          <div className="detail-section">
            <div className="detail-row">
              <div className="detail-label">产品数量:</div>
              <div className="detail-value">{record.productCount} 个产品</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">加价金额:</div>
              <div className="detail-value">¥{record.priceAddition}</div>
            </div>
          </div>
          
          <Divider />
          
          <div className="detail-section product-list">
            <div className="section-title">产品列表</div>
            <List
              size="small"
              dataSource={record.products}
              renderItem={(product, index) => (
                <List.Item className="product-item">
                  <div className="product-index">{index + 1}</div>
                  <div className="product-spec">{product.spec}</div>
                  <div className="product-price">¥{product.supplyPrice.toFixed(2)}</div>
                  <div className="product-sell-price">¥{product.sellPrice.toFixed(2)}</div>
                </List.Item>
              )}
              header={
                <div className="product-header">
                  <div className="product-index">#</div>
                  <div className="product-spec">规格</div>
                  <div className="product-price">供货价</div>
                  <div className="product-sell-price">售卖价</div>
                </div>
              }
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="history-page">
      <Card bordered={false} className="main-card">
        {/* 标题区域 */}
        <div className="page-header">
          <HistoryOutlined className="header-icon" />
          <div>
            <Title level={3}>计算历史记录</Title>
            <Paragraph className="subtitle">查看、恢复之前的价格计算记录</Paragraph>
          </div>
        </div>

        <Divider />

        {/* 标签页筛选 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          className="history-tabs"
        >
          <TabPane 
            tab={
              <span>
                <HistoryOutlined /> 全部记录
              </span>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <span>
                <CalculatorOutlined /> 拼单计算
              </span>
            } 
            key="single" 
          />
          <TabPane 
            tab={
              <span>
                <ApartmentOutlined /> 批量计算
              </span>
            } 
            key="batch" 
          />
        </Tabs>

        {/* 历史记录列表 */}
        {filteredHistory.length > 0 ? (
          <>
            <List
              className="history-list"
              dataSource={paginatedHistory}
              renderItem={(record) => 
                record.type === 'single' 
                  ? renderSingleCalculation(record as SingleCalculationHistory)
                  : renderBatchCalculation(record as BatchCalculationHistory)
              }
            />
            
            {/* 分页控件 */}
            {filteredHistory.length > PAGE_SIZE && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  onChange={handlePageChange}
                  total={filteredHistory.length}
                  pageSize={PAGE_SIZE}
                  size="small"
                  showSizeChanger={false}
                />
              </div>
            )}
            
            {/* 清空历史按钮 - 放在分页控件下方 */}
            <div className="clear-history-container">
              <Popconfirm
                title="确定要清空所有历史记录吗？"
                description="此操作不可撤销，所有计算历史将被永久删除。"
                onConfirm={handleClearHistory}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  className="clear-history-btn"
                >
                  清空历史
                </Button>
              </Popconfirm>
            </div>
          </>
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                暂无{activeTab === 'all' ? '' : activeTab === 'single' ? '拼单' : '批量'}计算历史记录
              </span>
            }
            className="empty-history"
          />
        )}
        
        {/* 详情弹窗 */}
        <Modal
          title={null}
          open={detailModalVisible}
          footer={null}
          onCancel={() => setDetailModalVisible(false)}
          width={600}
          className="detail-modal"
          destroyOnClose
        >
          {renderDetailModalContent()}
          <div className="modal-footer">
            <Button 
              onClick={() => setDetailModalVisible(false)}
            >
              关闭
            </Button>
            {selectedRecord && (
              <Button 
                type="primary"
                icon={<RollbackOutlined />}
                onClick={() => {
                  if (selectedRecord.type === 'single') {
                    restoreSingleCalculation(selectedRecord as SingleCalculationHistory);
                  } else {
                    restoreBatchCalculation(selectedRecord as BatchCalculationHistory);
                  }
                  setDetailModalVisible(false);
                }}
              >
                恢复计算
              </Button>
            )}
          </div>
        </Modal>
      </Card>
    </div>
  );
}; 