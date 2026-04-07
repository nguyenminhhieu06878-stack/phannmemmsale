import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Popconfirm } from 'antd';
import { EyeOutlined, DollarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  fetchInvoices, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice 
} from '../../store/slices/invoiceSlice';
import { invoiceService } from '../../services/invoiceService';
import InvoiceForm from '../../components/InvoiceForm';
import PaymentModal from '../../components/PaymentModal';
import useResponsive from '../../hooks/useResponsive';
import dayjs from 'dayjs';

const Invoices = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.invoices);
  const { isMobile } = useResponsive();
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  useEffect(() => {
    dispatch(fetchInvoices({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchInvoices({ page: pag.current, limit: pag.pageSize }));
  };

  const showFormModal = (invoice = null) => {
    setEditingInvoice(invoice);
    setIsFormModalVisible(true);
  };

  const showPaymentModal = (invoice) => {
    setPaymentInvoice(invoice);
    setIsPaymentModalVisible(true);
  };

  const showDetail = async (invoice) => {
    try {
      const response = await invoiceService.getById(invoice.id);
      setSelectedInvoice(response.data.data);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error('Cannot load invoice details');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingInvoice) {
        await dispatch(updateInvoice({ id: editingInvoice.id, data: values })).unwrap();
        message.success('Invoice updated successfully');
      } else {
        await dispatch(createInvoice(values)).unwrap();
        message.success('Invoice created successfully');
      }
      setIsFormModalVisible(false);
      dispatch(fetchInvoices({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handlePayment = async (values) => {
    try {
      await invoiceService.recordPayment(paymentInvoice.id, values);
      message.success('Payment recorded successfully');
      setIsPaymentModalVisible(false);
      dispatch(fetchInvoices({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteInvoice(id)).unwrap();
      message.success('Invoice deleted successfully');
      dispatch(fetchInvoices({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleProcessInvoice = async (invoice) => {
    try {
      await invoiceService.updateStatus(invoice.id, 'sent');
      message.success(`Invoice ${invoice.invoiceNumber} processed - changed to "Sent" status`);
      dispatch(fetchInvoices({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred while processing invoice');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'orange',
      sent: 'processing',
      paid: 'success',
      partial: 'warning',
      overdue: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      pending: 'Pending',
      sent: 'Sent',
      paid: 'Paid Amount',
      partial: 'Partially Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber'
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customer'
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${parseFloat(amount || 0).toLocaleString()} VND`
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => `${parseFloat(amount || 0).toLocaleString()} VND`
    },
    {
      title: 'Remaining Amount',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      render: (amount) => (
        <span style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
          {parseFloat(amount || 0).toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Payment Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            Details
          </Button>
          {record.status !== 'paid' && record.status !== 'cancelled' && (
            <>
              {record.status === 'pending' && (
                <Button
                  type="primary"
                  size="small"
                  icon={<DollarOutlined />}
                  onClick={() => handleProcessInvoice(record)}
                  style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                >
                  Process
                </Button>
              )}
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => showPaymentModal(record)}
              >
                Payment
              </Button>
              {record.status === 'draft' && (
                <>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => showFormModal(record)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{ margin: 0 }}>Invoice Management</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showFormModal()}
          size={isMobile ? 'small' : 'middle'}
          style={{ flexShrink: 0 }}
        >
          {isMobile ? 'Create' : 'Create Invoice'}
        </Button>
      </div>

      {/* Showing new invoices requiring processing */}
      {list.filter(invoice => invoice.status === 'pending').length > 0 && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#fff7e6', 
          borderRadius: 8, 
          border: '1px solid #ffd591' 
        }}>
          <h3 style={{ color: '#d46b08', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarOutlined />
            New invoices requiring processing ({list.filter(invoice => invoice.status === 'pending').length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 12 
          }}>
            {list.filter(invoice => invoice.status === 'pending').slice(0, 6).map(invoice => (
              <div key={invoice.id} style={{ 
                padding: 12, 
                backgroundColor: '#fff', 
                borderRadius: 6, 
                border: '1px solid #ffd591',
                cursor: 'pointer'
              }}
              onClick={() => showDetail(invoice)}
              >
                <div style={{ fontWeight: 'bold', color: '#d46b08' }}>
                  {invoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  Customer: {invoice.customer?.companyName}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Amount: {new Printtl.NumberFormat('en-US').format(invoice.totalAmount)} VND
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  From order: {invoice.order?.orderNumber}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button 
                    size="small" 
                    type="primary" 
                    icon={<DollarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showPaymentModal(invoice);
                    }}
                  >
                    Process Payment
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {list.filter(invoice => invoice.status === 'pending').length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ color: '#666', fontSize: '12px' }}>
                Và {list.filter(invoice => invoice.status === 'pending').length - 6} hóa USDơn khác...
              </span>
            </div>
          )}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoices`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <InvoiceForm
          initialValues={editingInvoice}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      <PaymentModal
        visible={isPaymentModalVisible}
        invoice={paymentInvoice}
        onSubmit={handlePayment}
        onCancel={() => setIsPaymentModalVisible(false)}
      />

      <Modal
        title="Invoice Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Invoice Number" span={2}>
                {selectedInvoice.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedInvoice.customer?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedInvoice.customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedInvoice.status)}>
                  {getStatusText(selectedInvoice.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedInvoice.paymentMethod || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Invoice Date">
                {dayjs(selectedInvoice.invoiceDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Due Date">
                {dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 16, marginBottom: 8 }}>Product</h3>
            <Table
              dataSource={selectedInvoice.items}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                { title: 'Product', dataIndex: 'productName', key: 'productName' },
                { title: 'SKU', dataIndex: 'productSku', key: 'productSku' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'Unit Price', 
                  dataIndex: 'unitPrice', 
                  key: 'unitPrice',
                  render: (val) => `${parseFloat(val).toLocaleString()} VND`
                },
                { title: 'Discount', dataIndex: 'discount', key: 'discount', render: (val) => `${val}%` },
                { 
                  title: 'Total', 
                  dataIndex: 'total', 
                  key: 'total',
                  render: (val) => `${parseFloat(val).toLocaleString()} VND`
                }
              ]}
            />

            <div style={{ marginTop: 16, padding: 16, background: '#fafafa', borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Total Amount:</span>
                <strong>{parseFloat(selectedInvoice.totalAmount).toLocaleString()} VND</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Paid Amount:</span>
                <strong style={{ color: '#52c41a' }}>{parseFloat(selectedInvoice.paidAmount).toLocaleString()} VND</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #d9d9d9' }}>
                <span>Remaining Amount:</span>
                <strong style={{ color: '#ff4d4f', fontSize: 18 }}>{parseFloat(selectedInvoice.remainingAmount).toLocaleString()} VND</strong>
              </div>
            </div>

            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <>
                <h3 style={{ marginTop: 16, marginBottom: 8 }}>Payment History</h3>
                <Table
                  dataSource={selectedInvoice.payments}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                  columns={[
                    { 
                      title: 'Date', 
                      dataIndex: 'paymentDate', 
                      key: 'paymentDate',
                      render: (date) => dayjs(date).format('DD/MM/YYYY')
                    },
                    { 
                      title: 'Amount', 
                      dataIndex: 'amount', 
                      key: 'amount',
                      render: (val) => `${parseFloat(val).toLocaleString()} VND`
                    },
                    { title: 'Method', dataIndex: 'paymentMethod', key: 'paymentMethod' },
                    { title: 'Transaction ID', dataIndex: 'referenceNumber', key: 'referenceNumber' },
                    { title: 'Recorded By', dataIndex: ['creator', 'fullName'], key: 'creator' }
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
