export const printDocument = (data, type) => {
  const printWindow = window.open('', '_blank');
  
  const getTitle = () => {
    switch(type) {
      case 'quotation': return 'QUOTATION';
      case 'order': return 'ORDER';
      case 'invoice': return 'INVOICE';
      default: return 'DOCUMENT';
    }
  };

  const getNumber = () => {
    switch(type) {
      case 'quotation': return data.quotationNumber;
      case 'order': return data.orderNumber;
      case 'invoice': return data.invoiceNumber;
      default: return '';
    }
  };

  const renderItems = () => {
    if (!data.items || data.items.length === 0) return '';
    
    return data.items.map((item, index) => `
      <tr>
        <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${item.unitPrice.toLocaleString('en-US')} USD</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${item.discount || 0}%</td>
        <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${item.totalPrice.toLocaleString('en-US')} USD</td>
      </tr>
    `).join('');
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${getTitle()}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .info-table td {
          padding: 10px;
        }
        .info-table td:first-child {
          font-weight: bold;
          width: 150px;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .total-section p {
          margin: 10px 0;
          font-size: 16px;
        }
        .total-section .grand-total {
          font-size: 18px;
          font-weight: bold;
        }
        .signatures {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature {
          text-align: center;
          width: 30%;
        }
        .signature p {
          margin: 0;
          font-weight: bold;
        }
        .signature-line {
          margin-top: 60px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${getTitle()}</h1>
        <p>Number: ${getNumber()}</p>
        <p>Date: ${new Date(data.createdAt).toLocaleDateString('en-US')}</p>
      </div>

      <table class="info-table">
        <tr>
          <td>Customer:</td>
          <td>${data.customer?.name || ''}</td>
        </tr>
        <tr>
          <td>Address:</td>
          <td>${data.customer?.address || ''}</td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td>${data.customer?.phone || ''}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${data.customer?.email || ''}</td>
        </tr>
        ${type === 'quotation' ? `
        <tr>
          <td>Valid Until:</td>
          <td>${new Date(data.validUntil).toLocaleDateString('en-US')}</td>
        </tr>
        ` : ''}
        ${type === 'invoice' ? `
        <tr>
          <td>Payment Due:</td>
          <td>${new Date(data.dueDate).toLocaleDateString('en-US')}</td>
        </tr>
        ` : ''}
      </table>

      <table>
        <thead>
          <tr>
            <th style="width: 50px;">STT</th>
            <th>Product</th>
            <th style="width: 100px;">Quantity</th>
            <th style="width: 120px;">Unit Price</th>
            <th style="width: 100px;">Discount</th>
            <th style="width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${renderItems()}
        </tbody>
      </table>

      <div class="total-section">
        <p><strong>Subtotal:</strong> ${(data.subtotal || 0).toLocaleString('en-US')} USD</p>
        <p><strong>Discount:</strong> ${(data.discountAmount || 0).toLocaleString('en-US')} USD</p>
        <p class="grand-total"><strong>TOTAL:</strong> ${(data.totalAmount || 0).toLocaleString('en-US')} USD</p>
        ${type === 'invoice' ? `
        <p style="color: #52c41a;"><strong>Paid Amount:</strong> ${(data.paidAmount || 0).toLocaleString('en-US')} USD</p>
        <p style="color: #ff4d4f;"><strong>Remaining Amount:</strong> ${(data.remainingAmount || 0).toLocaleString('en-US')} USD</p>
        ` : ''}
      </div>

      ${data.notes ? `
      <div style="margin-top: 30px;">
        <p><strong>Notes:</strong></p>
        <p>${data.notes}</p>
      </div>
      ` : ''}

      <div class="signatures">
        <div class="signature">
          <p>Prepared by</p>
          <div class="signature-line">${data.salesPerson?.fullName || ''}</div>
        </div>
        ${type === 'order' ? `
        <div class="signature">
          <p>Approved by</p>
          <div class="signature-line"></div>
        </div>
        ` : ''}
        ${type === 'invoice' ? `
        <div class="signature">
          <p>Accountant</p>
          <div class="signature-line"></div>
        </div>
        ` : ''}
        <div class="signature">
          <p>Customer</p>
          <div class="signature-line">${data.customer?.name || ''}</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
