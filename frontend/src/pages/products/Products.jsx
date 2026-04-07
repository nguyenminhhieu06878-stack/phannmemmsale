import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Input, Space, Modal, Form, message, Tag, Popconfirm, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../store/slices/productSlice';
import PermissionButton from '../../components/PermissionButton';
import { stockRequestService } from '../../services/stockRequestService';
import useResponsive from '../../hooks/useResponsive';

const Products = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.products);
  const { isMobile } = useResponsive();
  const { user } = useSelector(state => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStockRequestModalVisible, setIsStockRequestModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const [stockRequestForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchProducts({ page: pag.current, limit: pag.pageSize, search: searchText }));
  };

  const handleSearch = () => {
    dispatch(fetchProducts({ page: 1, limit: 10, search: searchText }));
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Ensure numeric fields are properly converted
      const processedValues = {
        ...values,
        stock: Number(values.stock) || 0,
        minStock: Number(values.minStock) || 0,
        price: Number(values.price) || 0,
        cost: Number(values.cost) || 0
      };
      
      // Debug log to check values
      console.log('🔍 Form values before processing:', values);
      console.log('🔧 Processed values:', processedValues);
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, data: processedValues })).unwrap();
        message.success('Product updated successfully');
      } else {
        await dispatch(createProduct(processedValues)).unwrap();
        message.success('Product added successfully');
      }
      setIsModalVisible(false);
      dispatch(fetchProducts({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success('Product deleted successfully');
      dispatch(fetchProducts({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const showStockRequestModal = (product) => {
    setSelectedProduct(product);
    stockRequestForm.setFieldsValue({
      productId: product.id,
      requestedQuantity: Math.max(product.minStock * 2 - product.stock, 10),
      priority: product.stock === 0 ? 'urgent' : product.stock <= product.minStock ? 'high' : 'medium'
    });
    setIsStockRequestModalVisible(true);
  };



  const handleStockRequest = async () => {
    try {
      console.log('🚀 Starting stock request...');
      console.log('Selected product:', selectedProduct);
      console.log('Current user:', user);
      
      const values = await stockRequestForm.validateFields();
      console.log('Form values:', values);
      
      const requestData = {
        ...values,
        productId: selectedProduct.id
        // Remove requestedBy - backend will get it from req.user.id
      };
      
      console.log('Request data to send:', requestData);
      
      const response = await stockRequestService.createStockRequest(requestData);
      console.log('API response:', response);
      
      if (response.data.success) {
        message.success('Stock request created successfully');
        setIsStockRequestModalVisible(false);
        stockRequestForm.resetFields();
      } else {
        throw new Error(response.data.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('Stock request error:', error);
      console.error('Error details:', error.response?.data);
      message.error(error.message || error.response?.data?.message || 'An error occurred');
    }
  };



  const columns = [
    {
      title: 'SKU Code',
      dataIndex: 'productCode',
      key: 'productCode'
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString()} VND`
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => {
        const color = stock <= record.minStock ? 'red' : stock <= record.minStock * 2 ? 'orange' : 'green';
        return <Tag color={color}>{stock}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Ngừng bán'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          {(user?.role === 'warehouse_staff' || user?.role === 'admin') && (
            <Button
              type="link"
              icon={<ExclamationCircleOutlined />}
              onClick={() => showStockRequestModal(record)}
              style={{ color: record.stock <= record.minStock ? '#ff4d4f' : '#1890ff' }}
            >
              Stock Request
            </Button>
          )}
          <PermissionButton
            action="product.edit"
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </PermissionButton>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <PermissionButton
              action="product.delete"
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </PermissionButton>
          </Popconfirm>
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
        <h1 style={{ margin: 0 }}>Product Management</h1>
        <PermissionButton
          action="product.create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size={isMobile ? 'small' : 'middle'}
          style={{ flexShrink: 0 }}
        >
          {isMobile ? 'Add' : 'Add Product'}
        </PermissionButton>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search product"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          Search
        </Button>
      </Space>

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
          showTotal: (total) => `Total ${total} products`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productCode"
            label="SKU Code"
            rules={[{ required: true, message: 'Please enter mã SKU' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter giá bán' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="cost"
            label="Cost"
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please enter số lượng' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            name="minStock"
            label="Min Stock"
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>


      <Modal
        title="Stock Request"
        open={isStockRequestModalVisible}
        onOk={handleStockRequest}
        onCancel={() => {
          setIsStockRequestModalVisible(false);
          stockRequestForm.resetFields();
        }}
        width={600}
      >
        {selectedProduct && (
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <h4>{selectedProduct.name}</h4>
            <p><strong>Product Code:</strong> {selectedProduct.productCode}</p>
            <p><strong>Current Stock:</strong> <Tag color={selectedProduct.stock <= selectedProduct.minStock ? 'red' : 'green'}>{selectedProduct.stock}</Tag></p>
            <p><strong>Minimum Level:</strong> {selectedProduct.minStock}</p>
          </div>
        )}
        <Form form={stockRequestForm} layout="vertical">
          <Form.Item
            name="requestedQuantity"
            label="Requested Quantity"
            rules={[{ required: true, message: 'Please enter số lượng' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="Request Reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Example: Low stock, need to replenish to meet orders..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
