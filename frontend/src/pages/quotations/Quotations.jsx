import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Tag, Button, Space, Modal, message, Popconfirm, Dropdown } from 'antd';
import { 
  EyeOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { 
  fetchQuotations, 
  createQuotation, 
  updateQuotation, 
  deleteQuotation 
} from '../../store/slices/quotationSlice';
import { quotationService } from '../../services/quotationService';
import QuotationForm from '../../components/QuotationForm';
import { exportQuotationToPDF, exportQuotationToExcel, exportQuotationsToExcel } from '../../utils/exportUtils';
import useResponsive from '../../hooks/useResponsive';
import dayjs from 'dayjs';

const Quotations = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.quotations);
  const { user } = useSelector(state => state.auth);
  const { isMobile, isTablet } = useResponsive();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Check if user can approve quotations (only sales_manager and admin)
  const canApprove = user && (user.role === 'sales_manager' || user.role === 'admin');

  useEffect(() => {
    dispatch(fetchQuotations({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchQuotations({ page: pag.current, limit: pag.pageSize }));
  };

  const showModal = (quotation = null) => {
    setEditingQuotation(quotation);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingQuotation) {
        await dispatch(updateQuotation({ id: editingQuotation.id, data: values })).unwrap();
        message.success('Quotation updated successfully');
      } else {
        await dispatch(createQuotation(values)).unwrap();
        message.success('Quotation created successfully');
      }
      setIsModalVisible(false);
      dispatch(fetchQuotations({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteQuotation(id)).unwrap();
      message.success('Quotation deleted successfully');
      dispatch(fetchQuotations({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleConvertToOrder = async (id) => {
    try {
      await quotationService.convertToOrder(id);
      message.success('Successfully converted to order');
      dispatch(fetchQuotations({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleApprove = async (id) => {
    try {
      await quotationService.updateStatus(id, 'approved');
      message.success('Quotation approved successfully');
      setViewModalVisible(false);
      dispatch(fetchQuotations({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleReject = async (id) => {
    try {
      await quotationService.updateStatus(id, 'rejected');
      message.success('Quotation rejected successfully');
      setViewModalVisible(false);
      dispatch(fetchQuotations({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleExportPDF = async (quotation) => {
    try {
      const response = await quotationService.getById(quotation.id);
      const fullQuotation = response.data.data;
      exportQuotationToPDF(fullQuotation);
      message.success('PDF exported successfully');
    } catch (error) {
      message.error('Error exporting PDF');
    }
  };

  const handleExportExcel = async (quotation) => {
    try {
      const response = await quotationService.getById(quotation.id);
      const fullQuotation = response.data.data;
      exportQuotationToExcel(fullQuotation);
      message.success('Excel exported successfully');
    } catch (error) {
      message.error('Error exporting Excel');
    }
  };

  const handleExportAllExcel = () => {
    try {
      exportQuotationsToExcel(list);
      message.success('List exported to Excel successfully');
    } catch (error) {
      message.error('Error exporting Excel');
    }
  };

  const showDetail = async (quotation) => {
    try {
      const response = await quotationService.getById(quotation.id);
      setSelectedQuotation(response.data.data);
      setViewModalVisible(true);
    } catch (error) {
      message.error('Cannot load quotation details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      expired: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      pending: 'Pending Approvals',
      approved: 'Approved',
      rejected: 'Reject',
      expired: 'Expired'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber'
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'companyName'],
      key: 'customer'
    },
    {
      title: 'Employee',
      dataIndex: ['salesPerson', 'fullName'],
      key: 'salesPerson'
    },
    {
      title: 'Number of Products',
      dataIndex: 'quotationItems',
      key: 'itemCount',
      render: (items) => items?.length || 0
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${parseFloat(amount || 0).toLocaleString()} VND`
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
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Expiry Date',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => {
        const exportItems = [
          {
            key: 'pdf',
            label: 'Export PDF',
            icon: <FilePdfOutlined />,
            onClick: () => handleExportPDF(record)
          },
          {
            key: 'excel',
            label: 'Export Excel',
            icon: <FileExcelOutlined />,
            onClick: () => handleExportExcel(record)
          }
        ];

        return (
          <Space size="small" wrap>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
              size={isMobile ? "small" : "middle"}
            >
              {!isMobile && "Details"}
            </Button>
            
            <Dropdown
              menu={{ items: exportItems }}
              trigger={['click']}
            >
              <Button
                type="link"
                icon={<DownloadOutlined />}
                size={isMobile ? "small" : "middle"}
              >
                {!isMobile && "Export File"}
              </Button>
            </Dropdown>

            {record.status === 'draft' && (
              <>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showModal(record)}
                  size={isMobile ? "small" : "middle"}
                >
                  {!isMobile && "Edit"}
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />}
                    size={isMobile ? "small" : "middle"}
                  >
                    {!isMobile && "Delete"}
                  </Button>
                </Popconfirm>
              </>
            )}
            
            {record.status === 'approved' && (
              <Popconfirm
                title="Convert quotation to order?"
                onConfirm={() => handleConvertToOrder(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  size={isMobile ? "small" : "middle"}
                >
                  {isMobile ? "Order" : "Create Order"}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{ 
          margin: 0, 
          minWidth: 0, 
          flex: '1 1 auto',
          fontSize: isMobile ? '18px' : '24px',
          lineHeight: isMobile ? '24px' : '32px'
        }}>
          Quotation Management
        </h1>
        <Space 
          style={{ 
            flexShrink: 0,
            flexWrap: 'wrap'
          }}
          size={isMobile ? "small" : "middle"}
        >
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={handleExportAllExcel}
            size={isMobile ? "small" : "middle"}
            style={isMobile ? { 
              fontSize: '12px',
              padding: '4px 8px',
              height: '28px'
            } : {}}
          >
            {!isMobile && "Export List to Excel"}
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
            size={isMobile ? "small" : "middle"}
            style={isMobile ? { 
              fontSize: '12px',
              padding: '4px 8px',
              height: '28px'
            } : {}}
          >
            {isMobile ? "Create" : "Create Quotation"}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        rowKey="id"
        scroll={{ x: isMobile ? 800 : 1200 }}
        size={isMobile ? "small" : "middle"}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: !isMobile,
          showTotal: (total) => `Total ${total} quotations`,
          size: isMobile ? "small" : "default",
          showQuickJumper: !isMobile
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingQuotation ? 'Edit Quotation' : 'Create Quotation'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        <QuotationForm
          initialValues={editingQuotation}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>

      <Modal
        title="Quotation Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={selectedQuotation && (
          <Space>
            <Button 
              icon={<FilePdfOutlined />}
              onClick={() => handleExportPDF(selectedQuotation)}
            >
              Export PDF
            </Button>
            <Button 
              icon={<FileExcelOutlined />}
              onClick={() => handleExportExcel(selectedQuotation)}
            >
              Export Excel
            </Button>
            <Button onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
            {selectedQuotation.status === 'draft' && canApprove && (
              <>
                <Popconfirm
                  title="Are you sure you want to reject this quotation?"
                  onConfirm={() => handleReject(selectedQuotation.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>
                    Reject
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Are you sure you want to approve this quotation?"
                  onConfirm={() => handleApprove(selectedQuotation.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary">
                    Approve Quotation
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        )}
        width={900}
      >
        {selectedQuotation && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Quotation Number:</strong> {selectedQuotation.quotationNumber}</p>
              <p><strong>Customer:</strong> {selectedQuotation.customer?.companyName}</p>
              <p><strong>Status:</strong> <Tag color={getStatusColor(selectedQuotation.status)}>{getStatusText(selectedQuotation.status)}</Tag></p>
            </div>
            
            <Table
              dataSource={selectedQuotation.quotationItems}
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
            
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <p><strong>Total:</strong> {parseFloat(selectedQuotation.totalAmount).toLocaleString()} VND</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quotations;