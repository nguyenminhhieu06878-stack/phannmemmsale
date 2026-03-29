import React from 'react';
import { Modal, Form, InputNumber, Select, DatePicker, Input, message } from 'antd';
import dayjs from 'dayjs';

const PaymentModal = ({ visible, invoice, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      };
      await onSubmit(data);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Record Payment"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Ghi nhận"
      cancelText="Cancel"
    >
      {invoice && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f7ff', borderRadius: 4 }}>
          <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
          <p><strong>Total Amount:</strong> {parseFloat(invoice.totalAmount).toLocaleString()} VND</p>
          <p><strong>Paid Amount:</strong> {parseFloat(invoice.paidAmount).toLocaleString()} VND</p>
          <p><strong>Remaining Amount:</strong> <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{parseFloat(invoice.remainingAmount).toLocaleString()} VND</span></p>
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label="Amount thanh toán"
          rules={[
            { required: true, message: 'Please enter số tiền' },
            {
              validator: (_, value) => {
                if (value && invoice && value > invoice.remainingAmount) {
                  return Promise.reject('Amount không USDược vượt quá số tiền còn lại');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={invoice?.remainingAmount}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Import số tiền"
          />
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select phương thức' }]}
        >
          <Select placeholder="Select phương thức">
            <Select.Option value="cash">Tiền mặt</Select.Option>
            <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
            <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
            <Select.Option value="check">Séc</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentDate"
          label="Payment Date"
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="referenceNumber" label="Transaction ID">
          <Input placeholder="Transaction ID ngân hàng, số séc..." />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
