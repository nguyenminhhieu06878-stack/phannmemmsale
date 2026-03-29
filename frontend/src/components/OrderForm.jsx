import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Table, InputNumber, message, Space, Alert, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomers } from '../store/slices/customerSlice';
import { fetchProducts } from '../store/slices/productSlice';

const OrderForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { list: customers } = useSelector(state => state.customers);
  const { list: products } = useSelector(state => state.products);
  const [items, setItems] = useState(initialValues?.items || []);
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
  const [stockWarnings, setStockWarnings] = useState([]);

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.items) {
        setItems(initialValues.items);
      }
    }
  }, [initialValues, form]);

  useEffect(() => {
    calculateTotals();
    checkStock();
  }, [items, products]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100;
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    });

    setTotals({
      subtotal,
      discount: totalDiscount,
      total: subtotal - totalDiscount
    });
  };

  const checkStock = () => {
    const warnings = [];
    items.forEach(item => {
      if (item.productId) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (product.stockQuantity < item.quantity) {
            warnings.push({
              productName: product.name,
              requested: item.quantity,
              available: product.stockQuantity
            });
          }
        }
      }
    });
    setStockWarnings(warnings);
  };

  const handleAddItem = () => {
    setItems([...items, {
      key: Date.now(),
      productId: null,
      productName: '',
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    }]);
  };

  const handleRemoveItem = (key) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key, field, value) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        
        // Auto-fill product info when product selected
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.productSku = product.sku;
            updated.unitPrice = product.price;
          }
        }
        
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const getStockStatus = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;
    
    if (product.stockQuantity < quantity) {
      return { status: 'error', text: `No USDủ hàng (Còn: ${product.stockQuantity})` };
    } else if (product.stockQuantity < quantity * 1.5) {
      return { status: 'warning', text: `Low Stock (Còn: ${product.stockQuantity})` };
    }
    return { status: 'success', text: `Còn: ${product.stockQuantity}` };
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (items.length === 0) {
        message.error('Please add at least one product');
        return;
      }

      // Validate items
      for (const item of items) {
        if (!item.productId) {
          message.error('Please select product for all lines');
          return;
        }
        if (!item.quantity || item.quantity <= 0) {
          message.error('Quantity phải lớn hơn 0');
          return;
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          message.error('Unit Price phải lớn hơn 0');
          return;
        }
      }

      // Check stock warnings
      if (stockWarnings.length > 0) {
        const confirmed = window.confirm(
          `There are ${stockWarnings.length} products with insufficient stock. Are you sure you want to continue?`
        );
        if (!confirmed) return;
      }

      const data = {
        ...values,
        items: items.map(({ key, ...item }) => item)
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      width: 250,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Select Product"
          value={value}
          onChange={(val) => handleItemChange(record.key, 'productId', val)}
          showSearch
          optionFilterProp="children"
        >
          {products.map(product => (
            <Select.Option key={product.id} value={product.id}>
              {product.name} ({product.sku}) - Tồn: {product.stockQuantity}
            </Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 120,
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      width: 150,
      render: (value, record) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val)}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount',
      width: 120,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'discount', val)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Stock',
      width: 150,
      render: (_, record) => {
        if (!record.productId) return '-';
        const stockStatus = getStockStatus(record.productId, record.quantity);
        if (!stockStatus) return '-';
        
        return (
          <Tag color={stockStatus.status === 'error' ? 'red' : stockStatus.status === 'warning' ? 'orange' : 'green'}>
            {stockStatus.text}
          </Tag>
        );
      }
    },
    {
      title: 'Total',
      width: 150,
      render: (_, record) => {
        const subtotal = (record.quantity || 0) * (record.unitPrice || 0);
        const discount = (subtotal * (record.discount || 0)) / 100;
        const total = subtotal - discount;
        return `${total.toLocaleString()} VND`;
      }
    },
    {
      title: '',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      )
    }
  ];

  return (
    <Form form={form} layout="vertical">
      {stockWarnings.length > 0 && (
        <Alert
          message="Warning tồn kho"
          description={
            <ul style={{ marginBottom: 0 }}>
              {stockWarnings.map((warning, index) => (
                <li key={index}>
                  <strong>{warning.productName}</strong>: Yêu cầu {warning.requested}, chỉ còn {warning.available}
                </li>
              ))}
            </ul>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        name="customerId"
        label="Customer"
        rules={[{ required: true, message: 'Please select customer' }]}
      >
        <Select
          placeholder="Select Customer"
          showSearch
          optionFilterProp="children"
        >
          {customers.map(customer => (
            <Select.Option key={customer.id} value={customer.id}>
              {customer.companyName} - {customer.email}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="paymentMethod"
        label="Payment Method"
        rules={[{ required: true, message: 'Please select phương thức thanh toán' }]}
        initialValue="credit_terms"
      >
        <Select placeholder="Select phương thức thanh toán">
          <Select.Option value="prepayment">
            💳 Payment trước (Prepayment)
          </Select.Option>
          <Select.Option value="cod_cash">
            💵 Thu tiền mặt khi giao hàng (COD Cash)
          </Select.Option>
          <Select.Option value="cod_transfer">
            📱 Chuyển khoản khi giao hàng (COD Transfer)
          </Select.Option>
          <Select.Option value="credit_terms">
            📋 Payment chậm (Credit Terms)
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="paymentTerms"
        label="Điều kiện thanh toán"
        tooltip="Ví dụ: Net 30 (thanh toán trong 30 ngày), Net 15, etc."
      >
        <Input placeholder="Ví dụ: Net 30, Net 15, Ngay khi giao hàng..." />
      </Form.Item>

      <Form.Item label="Product">
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey="key"
          size="small"
          footer={() => (
            <Button
              type="dashed"
              onClick={handleAddItem}
              icon={<PlusOutlined />}
              block
            >
              Add Product
            </Button>
          )}
        />
      </Form.Item>

      <div style={{ 
        marginTop: 16, 
        padding: 16, 
        background: '#fafafa', 
        borderRadius: 4 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Subtotal:</span>
          <strong>{totals.subtotal.toLocaleString()} VND</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Discount:</span>
          <strong style={{ color: '#ff4d4f' }}>-{totals.discount.toLocaleString()} VND</strong>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: 18,
          paddingTop: 8,
          borderTop: '1px solid #d9d9d9'
        }}>
          <span>Total:</span>
          <strong style={{ color: '#1890ff' }}>{totals.total.toLocaleString()} VND</strong>
        </div>
      </div>

      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            disabled={stockWarnings.length > 0 && !initialValues}
          >
            {initialValues ? 'Update' : 'Create Order'}
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default OrderForm;
