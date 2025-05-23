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
  ApartmentOutlined,
  TagOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '@/stores/historyStore';
import { useCalculatorStore } from '@/models/calculator';
import { useBatchAnalysisStore } from '@/models/batch';
import './index.less';
import { CalculationType, Platform, HistoryRecord, DouyinCouponRecord, DouyinDiscountRecord, DouyinPriceRecord } from '@/types/history';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 每页显示的记录数量
const PAGE_SIZE = 5;

// 格式化金额
const formatPrice = (price: number) => `¥${price.toFixed(2)}`;

// 格式化时间
const formatTime = (timestamp: number) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');

// 获取计算类型的中文名称
const getCalculationTypeName = (type: CalculationType) => {
  const typeMap = {
    [CalculationType.PDD_SINGLE]: '拼多多单品计算',
    [CalculationType.PDD_GROUP]: '拼多多团购计算',
    [CalculationType.DOUYIN_PRICE]: '抖音定价计算',
    [CalculationType.DOUYIN_DISCOUNT]: '抖音折扣计算',
    [CalculationType.DOUYIN_COUPON]: '抖音优惠券计算',
    [CalculationType.DOUYIN_LOW_PRICE]: '抖音低价起价计算',
  };
  return typeMap[type] || '未知类型';
};

// 获取平台标签颜色
const getPlatformColor = (platform: Platform) => {
  return platform === Platform.PDD ? '#E02E24' : '#FF0050';
};

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 获取历史记录
  const { records, clearRecords, deleteRecord } = useHistoryStore();
  
  // 获取计算器和批量计算的方法
  const { setSupplyPrice, setGroupPrice, setPriceAddition: setCalcPriceAddition } = useCalculatorStore();
  const { setInputText, setPriceAddition: setBatchPriceAddition } = useBatchAnalysisStore();
  
  // 根据标签筛选历史记录
  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(record => {
        if (activeTab === 'pdd') {
          return record.platform === Platform.PDD;
        } else if (activeTab === 'douyin') {
          return record.platform === Platform.DOUYIN;
        }
        return record.type === activeTab;
      });
  
  // 根据当前页码获取分页数据
  const paginatedRecords = filteredRecords.slice(
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
  
  // 查看详情
  const viewDetails = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };
  
  // 清空历史记录
  const handleClearHistory = () => {
    clearRecords();
    setCurrentPage(1);
  };
  
  // 渲染抖音优惠券记录
  const renderDouyinCouponRecord = (record: DouyinCouponRecord) => (
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
        <Tooltip title="删除记录">
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => deleteRecord(record.id)}
          />
        </Tooltip>
      ]}
    >
      <div className="history-item-content">
        <div className="history-item-header">
          <Tag color={getPlatformColor(record.platform)} icon={<TagOutlined />}>
            {getCalculationTypeName(record.type)}
          </Tag>
          <span className="history-time">{formatTime(record.timestamp)}</span>
        </div>
        <div className="history-item-details">
          <div className="detail-item">
            <Text type="secondary">供货价:</Text>
            <Text>{formatPrice(record.supplyPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">上架价格:</Text>
            <Text>{formatPrice(record.listingPrice)}</Text>
          </div>
          {record.limitedTimePrice && (
            <div className="detail-item">
              <Text type="secondary">限时7折价:</Text>
              <Text>{formatPrice(record.limitedTimePrice)}</Text>
            </div>
          )}
          <div className="detail-item">
            <Text type="secondary">利润:</Text>
            <Text className={record.profit >= 0 ? 'profit' : 'loss'}>
              {record.profit >= 0 ? '+' : ''}{formatPrice(record.profit)}
            </Text>
          </div>
        </div>
      </div>
    </List.Item>
  );
  
  // 渲染抖音折扣记录
  const renderDouyinDiscountRecord = (record: DouyinDiscountRecord) => (
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
        <Tooltip title="删除记录">
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => deleteRecord(record.id)}
          />
        </Tooltip>
      ]}
    >
      <div className="history-item-content">
        <div className="history-item-header">
          <Tag color={getPlatformColor(record.platform)} icon={<TagOutlined />}>
            {getCalculationTypeName(record.type)}
          </Tag>
          <span className="history-time">{formatTime(record.timestamp)}</span>
        </div>
        <div className="history-item-details">
          <div className="detail-item">
            <Text type="secondary">供货价:</Text>
            <Text>{formatPrice(record.supplyPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">原价:</Text>
            <Text>{formatPrice(record.originalPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">折扣率:</Text>
            <Text>{record.discountRate}%</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">利润:</Text>
            <Text className={record.profit >= 0 ? 'profit' : 'loss'}>
              {record.profit >= 0 ? '+' : ''}{formatPrice(record.profit)}
            </Text>
          </div>
        </div>
      </div>
    </List.Item>
  );
  
  // 渲染抖音定价记录
  const renderDouyinPriceRecord = (record: DouyinPriceRecord) => (
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
        <Tooltip title="删除记录">
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => deleteRecord(record.id)}
          />
        </Tooltip>
      ]}
    >
      <div className="history-item-content">
        <div className="history-item-header">
          <Tag color={getPlatformColor(record.platform)} icon={<DollarOutlined />}>
            {getCalculationTypeName(record.type)}
          </Tag>
          <span className="history-time">{formatTime(record.timestamp)}</span>
        </div>
        <div className="history-item-details">
          <div className="detail-item">
            <Text type="secondary">供货价:</Text>
            <Text>{formatPrice(record.supplyPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">设置价格:</Text>
            <Text>{formatPrice(record.originalPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">卖家看到的价格:</Text>
            <Text>{formatPrice(record.sellerViewPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">优惠券金额:</Text>
            <Text>{formatPrice(record.couponAmount)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">最终价格:</Text>
            <Text>{formatPrice(record.finalPrice)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">平台扣点:</Text>
            <Text>{formatPrice(record.platformFee)}</Text>
          </div>
          <div className="detail-item">
            <Text type="secondary">利润:</Text>
            <Text className={record.profit >= 0 ? 'profit' : 'loss'}>
              {record.profit >= 0 ? '+' : ''}{formatPrice(record.profit)}
            </Text>
          </div>
        </div>
      </div>
    </List.Item>
  );

  // 渲染历史记录项
  const renderHistoryItem = (record: HistoryRecord) => {
    switch (record.type) {
      case CalculationType.DOUYIN_COUPON:
        return renderDouyinCouponRecord(record as DouyinCouponRecord);
      case CalculationType.DOUYIN_DISCOUNT:
        return renderDouyinDiscountRecord(record as DouyinDiscountRecord);
      case CalculationType.DOUYIN_PRICE:
        return renderDouyinPriceRecord(record as DouyinPriceRecord);
      default:
        return (
          <List.Item key={record.id}>
            <div>未知记录类型</div>
          </List.Item>
        );
    }
  };
  
  // 渲染详情弹窗内容
  const renderDetailModalContent = () => {
    if (!selectedRecord) return null;
    
    switch (selectedRecord.type) {
      case CalculationType.DOUYIN_COUPON:
        const couponRecord = selectedRecord as DouyinCouponRecord;
        return (
          <div className="detail-modal-content">
            <div className="detail-header">
              <div className="detail-title">
                <TagOutlined /> 抖音优惠券计算详情
              </div>
              <div className="detail-time">
                {formatTime(couponRecord.timestamp)}
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">供货价:</div>
                <div className="detail-value">{formatPrice(couponRecord.supplyPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">上架价格:</div>
                <div className="detail-value">{formatPrice(couponRecord.listingPrice)}</div>
              </div>
              {couponRecord.limitedTimePrice && (
                <div className="detail-row">
                  <div className="detail-label">限时7折价格:</div>
                  <div className="detail-value">{formatPrice(couponRecord.limitedTimePrice)}</div>
                </div>
              )}
              <div className="detail-row">
                <div className="detail-label">优惠券金额:</div>
                <div className="detail-value">{formatPrice(couponRecord.couponAmount)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">新人价格:</div>
                <div className="detail-value">{formatPrice(couponRecord.newUserPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">平台扣点:</div>
                <div className="detail-value">{formatPrice(couponRecord.platformFee)}</div>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">利润:</div>
                <div className={`detail-value ${couponRecord.profit >= 0 ? 'profit' : 'loss'}`}>
                  {couponRecord.profit >= 0 ? '+' : ''}{formatPrice(couponRecord.profit)}
                </div>
              </div>
            </div>
          </div>
        );
      
      case CalculationType.DOUYIN_DISCOUNT:
        const discountRecord = selectedRecord as DouyinDiscountRecord;
        return (
          <div className="detail-modal-content">
            <div className="detail-header">
              <div className="detail-title">
                <TagOutlined /> 抖音折扣计算详情
              </div>
              <div className="detail-time">
                {formatTime(discountRecord.timestamp)}
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">供货价:</div>
                <div className="detail-value">{formatPrice(discountRecord.supplyPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">原价:</div>
                <div className="detail-value">{formatPrice(discountRecord.originalPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">折扣率:</div>
                <div className="detail-value">{discountRecord.discountRate}%</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">折扣价:</div>
                <div className="detail-value">{formatPrice(discountRecord.discountPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">平台扣点:</div>
                <div className="detail-value">{formatPrice(discountRecord.platformFee)}</div>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">利润:</div>
                <div className={`detail-value ${discountRecord.profit >= 0 ? 'profit' : 'loss'}`}>
                  {discountRecord.profit >= 0 ? '+' : ''}{formatPrice(discountRecord.profit)}
                </div>
              </div>
            </div>
          </div>
        );
      
      case CalculationType.DOUYIN_PRICE:
        const priceRecord = selectedRecord as DouyinPriceRecord;
        return (
          <div className="detail-modal-content">
            <div className="detail-header">
              <div className="detail-title">
                <DollarOutlined /> 抖音定价计算详情
              </div>
              <div className="detail-time">
                {formatTime(priceRecord.timestamp)}
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">供货价:</div>
                <div className="detail-value">{formatPrice(priceRecord.supplyPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">设置价格:</div>
                <div className="detail-value">{formatPrice(priceRecord.originalPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">卖家看到的价格:</div>
                <div className="detail-value">{formatPrice(priceRecord.sellerViewPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">优惠券金额:</div>
                <div className="detail-value">{formatPrice(priceRecord.couponAmount)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">最终价格:</div>
                <div className="detail-value">{formatPrice(priceRecord.finalPrice)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">平台扣点:</div>
                <div className="detail-value">{formatPrice(priceRecord.platformFee)}</div>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-section">
              <div className="detail-row">
                <div className="detail-label">利润:</div>
                <div className={`detail-value ${priceRecord.profit >= 0 ? 'profit' : 'loss'}`}>
                  {priceRecord.profit >= 0 ? '+' : ''}{formatPrice(priceRecord.profit)}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>未知记录类型</div>;
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
                <ShoppingOutlined /> 拼多多
              </span>
            } 
            key="pdd" 
          />
          <TabPane 
            tab={
              <span>
                <TagOutlined /> 抖音
              </span>
            } 
            key="douyin" 
          />
        </Tabs>

        {/* 历史记录列表 */}
        {filteredRecords.length > 0 ? (
          <>
            <List
              className="history-list"
              dataSource={paginatedRecords}
              renderItem={(record) => renderHistoryItem(record)}
            />
            
            {/* 分页控件 */}
            {filteredRecords.length > PAGE_SIZE && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  onChange={handlePageChange}
                  total={filteredRecords.length}
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
                暂无{activeTab === 'all' ? '' : activeTab === 'pdd' ? '拼多多' : '抖音'}计算历史记录
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
          </div>
        </Modal>
      </Card>
    </div>
  );
}; 