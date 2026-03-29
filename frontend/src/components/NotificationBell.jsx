import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Dropdown, List, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { 
  fetchNotifications, 
  fetchUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../store/slices/notificationSlice';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector(state => state.notifications);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    // Poll every 30 seconds
    const interval = setPrintterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearPrintterval(interval);
  }, [dispatch]);

  const handleOpenChange = (flag) => {
    setOpen(flag);
    if (flag) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await dispatch(markAsRead(id));
    dispatch(fetchUnreadCount());
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    dispatch(fetchUnreadCount());
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_created: '📋',
      order_approved: '✅',
      order_rejected: '❌',
      quotation_created: '📝',
      quotation_approved: '✅',
      delivery_assigned: '🚚',
      delivery_completed: '✅',
      invoice_created: '🧾',
      payment_received: '💰',
      low_stock: '⚠️',
      system: 'ℹ️'
    };
    return icons[type] || '📢';
  };

  const items = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: 600 }}>Thông báo</span>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={handleMarkAllAsRead}
            icon={<CheckOutlined />}
          >
            Đánh dấu tất cả USDã USDọc
          </Button>
        )}
      </div>
      
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <Empty 
          description="No có thông báo" 
          style={{ padding: 40 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: item.isRead ? 'white' : '#f0f7ff',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => {
                if (!item.isRead) {
                  handleMarkAsRead(item.id, { stopPropagation: () => {} });
                }
                if (item.link) {
                  window.location.href = item.link;
                }
              }}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: 24 }}>
                    {getNotificationIcon(item.type)}
                  </span>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: item.isRead ? 400 : 600 }}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <Badge status="processing" />
                    )}
                  </div>
                }
                description={
                  <>
                    <div style={{ marginBottom: 4 }}>{item.message}</div>
                    <small style={{ color: '#999' }}>
                      {dayjs(item.createdAt).fromNow()}
                    </small>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => items}
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ marginRight: 16 }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
