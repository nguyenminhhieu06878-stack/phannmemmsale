import React, { forwardRef } from 'react';
import { Descriptions, Table, Divider } from 'antd';
import dayjs from 'dayjs';

const PrintTemplate = forwardRef(({ type, data }, ref) => {
  const renderQuotation = () => {
    const columns = [
      {
        title: 'STT',
        key: 'index',
        render: (_, __, index) => index + 1,
        width: 50,
      },
      {
        title: 'Product',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
      },
      {
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
      {
        title: 'Discount (%)',
        dataIndex: 'discount',
        key: 'discount',
        align: 'center',
      },
      {
        title: 'Total',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
    ];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>QUOTATION</h1>
          <p style={{ margin: '5px 0', fontSize: 14 }}>Number: {data.quotationNumber}</p>
          <p style={{ margin: '5px 0', fontSize: 14 }}>
            Date: {dayjs(data.createdAt).format('DD/MM/YYYY')}
          </p>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Customer">{data.customer?.name}</Descriptions.Item>
          <Descriptions.Item label="Address">{data.customer?.address}</Descriptions.Item>
          <Descriptions.Item label="Phone">{data.customer?.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{data.customer?.email}</Descriptions.Item>
          <Descriptions.Item label="Người phụ trách">{data.salesPerson?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Valid Until">
            {dayjs(data.validUntil).format('DD/MM/YYYY')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Table
          columns={columns}
          dataSource={data.items || []}
          pagination={false}
          rowKey="id"
          size="small"
          bordered
        />

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Subtotal:</strong> {data.subtotal?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Discount:</strong> {data.discountAmount?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 18, margin: '10px 0', fontWeight: 'bold' }}>
            <strong>TOTAL:</strong> {data.totalAmount?.toLocaleString('en-US')} USD
          </p>
        </div>

        {data.notes && (
          <div style={{ marginTop: 30 }}>
            <p><strong>Notes:</strong></p>
            <p>{data.notes}</p>
          </div>
        )}

        <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Prepared by</strong></p>
            <p style={{ marginTop: 60 }}>{data.salesPerson?.fullName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Customer</strong></p>
            <p style={{ marginTop: 60 }}>{data.customer?.name}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderOrder = () => {
    const columns = [
      {
        title: 'STT',
        key: 'index',
        render: (_, __, index) => index + 1,
        width: 50,
      },
      {
        title: 'Product',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
      },
      {
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
      {
        title: 'Discount (%)',
        dataIndex: 'discount',
        key: 'discount',
        align: 'center',
      },
      {
        title: 'Total',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
    ];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>ORDER</h1>
          <p style={{ margin: '5px 0', fontSize: 14 }}>Number: {data.orderNumber}</p>
          <p style={{ margin: '5px 0', fontSize: 14 }}>
            Date: {dayjs(data.createdAt).format('DD/MM/YYYY')}
          </p>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Customer">{data.customer?.name}</Descriptions.Item>
          <Descriptions.Item label="Address">{data.customer?.address}</Descriptions.Item>
          <Descriptions.Item label="Phone">{data.customer?.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{data.customer?.email}</Descriptions.Item>
          <Descriptions.Item label="Người phụ trách">{data.salesPerson?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Status">{data.status}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Table
          columns={columns}
          dataSource={data.items || []}
          pagination={false}
          rowKey="id"
          size="small"
          bordered
        />

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Subtotal:</strong> {data.subtotal?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Discount:</strong> {data.discountAmount?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 18, margin: '10px 0', fontWeight: 'bold' }}>
            <strong>TOTAL:</strong> {data.totalAmount?.toLocaleString('en-US')} USD
          </p>
        </div>

        {data.notes && (
          <div style={{ marginTop: 30 }}>
            <p><strong>Notes:</strong></p>
            <p>{data.notes}</p>
          </div>
        )}

        <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Prepared by</strong></p>
            <p style={{ marginTop: 60 }}>{data.salesPerson?.fullName}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Approved by</strong></p>
            <p style={{ marginTop: 60 }}>_______________</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Customer</strong></p>
            <p style={{ marginTop: 60 }}>{data.customer?.name}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoice = () => {
    const columns = [
      {
        title: 'STT',
        key: 'index',
        render: (_, __, index) => index + 1,
        width: 50,
      },
      {
        title: 'Product',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
      },
      {
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
      {
        title: 'Discount (%)',
        dataIndex: 'discount',
        key: 'discount',
        align: 'center',
      },
      {
        title: 'Total',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        align: 'right',
        render: (value) => `${value.toLocaleString('en-US')} USD`,
      },
    ];

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>SALES INVOICE</h1>
          <p style={{ margin: '5px 0', fontSize: 14 }}>Number: {data.invoiceNumber}</p>
          <p style={{ margin: '5px 0', fontSize: 14 }}>
            Date: {dayjs(data.createdAt).format('DD/MM/YYYY')}
          </p>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Customer">{data.customer?.name}</Descriptions.Item>
          <Descriptions.Item label="Address">{data.customer?.address}</Descriptions.Item>
          <Descriptions.Item label="Phone">{data.customer?.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{data.customer?.email}</Descriptions.Item>
          <Descriptions.Item label="Payment Due Date">
            {dayjs(data.dueDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Table
          columns={columns}
          dataSource={data.items || []}
          pagination={false}
          rowKey="id"
          size="small"
          bordered
        />

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Subtotal:</strong> {data.subtotal?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 16, margin: '10px 0' }}>
            <strong>Discount:</strong> {data.discountAmount?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 18, margin: '10px 0', fontWeight: 'bold' }}>
            <strong>TOTAL:</strong> {data.totalAmount?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 16, margin: '10px 0', color: '#52c41a' }}>
            <strong>Paid Amount:</strong> {data.paidAmount?.toLocaleString('en-US')} USD
          </p>
          <p style={{ fontSize: 16, margin: '10px 0', color: '#ff4d4f' }}>
            <strong>Remaining Amount:</strong> {data.remainingAmount?.toLocaleString('en-US')} USD
          </p>
        </div>

        {data.notes && (
          <div style={{ marginTop: 30 }}>
            <p><strong>Notes:</strong></p>
            <p>{data.notes}</p>
          </div>
        )}

        <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Prepared by</strong></p>
            <p style={{ marginTop: 60 }}>_______________</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Accountant</strong></p>
            <p style={{ marginTop: 60 }}>_______________</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Customer</strong></p>
            <p style={{ marginTop: 60 }}>{data.customer?.name}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} style={{ padding: 40, backgroundColor: 'white' }}>
      {type === 'quotation' && renderQuotation()}
      {type === 'order' && renderOrder()}
      {type === 'invoice' && renderInvoice()}
    </div>
  );
});

PrintTemplate.displayName = 'PrintTemplate';

export default PrintTemplate;
