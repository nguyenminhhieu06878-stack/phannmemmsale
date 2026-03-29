# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Tất cả API (trừ login/register) yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 1. Authentication APIs

### 1.1 Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

### 1.2 Register (Admin only)
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "New User",
  "phone": "0123456789",
  "role": "sales_staff"
}
```

### 1.3 Get Current User
```
GET /api/auth/me
```

### 1.4 Change Password
```
PUT /api/auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## 2. User Management APIs

### 2.1 Get All Users
```
GET /api/users?page=1&limit=10&role=sales_staff
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role
- `search`: Search by name or email

### 2.2 Get User by ID
```
GET /api/users/:id
```

### 2.3 Create User
```
POST /api/users
```

### 2.4 Update User
```
PUT /api/users/:id
```

### 2.5 Delete User
```
DELETE /api/users/:id
```

---

## 3. Customer APIs

### 3.1 Get All Customers
```
GET /api/customers?page=1&limit=10&type=vip
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Filter by customer type (vip, regular, new)
- `search`: Search by company name
- `assignedSales`: Filter by sales person ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerCode": "CUST001",
      "companyName": "ABC Electronics",
      "taxCode": "0123456789",
      "phone": "0987654321",
      "email": "contact@abc.com",
      "customerType": "vip",
      "assignedSales": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Sales Person"
      },
      "creditLimit": 100000000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 3.2 Get Customer by ID
```
GET /api/customers/:id
```

### 3.3 Create Customer
```
POST /api/customers
```

**Request Body:**
```json
{
  "companyName": "ABC Electronics",
  "taxCode": "0123456789",
  "address": {
    "street": "123 Main St",
    "city": "Ho Chi Minh",
    "district": "District 1",
    "country": "Vietnam"
  },
  "phone": "0987654321",
  "email": "contact@abc.com",
  "customerType": "regular",
  "assignedSales": "507f1f77bcf86cd799439012",
  "creditLimit": 50000000,
  "contacts": [
    {
      "name": "John Doe",
      "position": "Manager",
      "phone": "0123456789",
      "email": "john@abc.com"
    }
  ]
}
```

### 3.4 Update Customer
```
PUT /api/customers/:id
```

### 3.5 Delete Customer
```
DELETE /api/customers/:id
```

---

## 4. Product APIs

### 4.1 Get All Products
```
GET /api/products?page=1&limit=10&category=laptop
```

### 4.2 Get Product by ID
```
GET /api/products/:id
```

### 4.3 Create Product
```
POST /api/products
```

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "description": "High performance laptop",
  "category": "laptop",
  "unit": "pcs",
  "price": 25000000,
  "cost": 20000000,
  "stock": 50,
  "minStock": 10,
  "specifications": {
    "cpu": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

### 4.4 Update Product
```
PUT /api/products/:id
```

### 4.5 Delete Product
```
DELETE /api/products/:id
```

### 4.6 Check Stock
```
GET /api/products/:id/stock
```

---

## 5. Quotation APIs

### 5.1 Get All Quotations
```
GET /api/quotations?page=1&limit=10&status=sent
```

### 5.2 Get Quotation by ID
```
GET /api/quotations/:id
```

### 5.3 Create Quotation
```
POST /api/quotations
```

**Request Body:**
```json
{
  "customer": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product": "507f1f77bcf86cd799439013",
      "quantity": 10,
      "unitPrice": 25000000,
      "discount": 5
    }
  ],
  "validUntil": "2024-12-31",
  "notes": "Special discount for VIP customer",
  "terms": "Payment within 30 days"
}
```

### 5.4 Update Quotation
```
PUT /api/quotations/:id
```

### 5.5 Change Quotation Status
```
PATCH /api/quotations/:id/status
```

**Request Body:**
```json
{
  "status": "approved"
}
```

### 5.6 Convert to Order
```
POST /api/quotations/:id/convert-to-order
```

---

## 6. Order APIs

### 6.1 Get All Orders
```
GET /api/orders?page=1&limit=10&status=pending
```

**Query Parameters:**
- `status`: Filter by status
- `customer`: Filter by customer ID
- `salesPerson`: Filter by sales person ID
- `fromDate`: Filter from date
- `toDate`: Filter to date

### 6.2 Get Order by ID
```
GET /api/orders/:id
```

### 6.3 Create Order
```
POST /api/orders
```

**Request Body:**
```json
{
  "customer": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product": "507f1f77bcf86cd799439013",
      "quantity": 10,
      "unitPrice": 25000000,
      "discount": 5
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Ho Chi Minh",
    "district": "District 1",
    "country": "Vietnam",
    "contactName": "John Doe",
    "contactPhone": "0123456789"
  },
  "paymentTerms": "30 days",
  "notes": "Urgent delivery"
}
```

### 6.4 Update Order
```
PUT /api/orders/:id
```

### 6.5 Update Order Status
```
PATCH /api/orders/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed",
  "note": "Order confirmed by manager"
}
```

### 6.6 Approve Order
```
POST /api/orders/:id/approve
```

### 6.7 Cancel Order
```
POST /api/orders/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

---

## 7. Delivery APIs

### 7.1 Get All Deliveries
```
GET /api/deliveries?status=in_transit
```

### 7.2 Get Delivery by ID
```
GET /api/deliveries/:id
```

### 7.3 Create Delivery
```
POST /api/deliveries
```

**Request Body:**
```json
{
  "order": "507f1f77bcf86cd799439014",
  "deliveryStaff": "507f1f77bcf86cd799439015",
  "scheduledDate": "2024-12-25"
}
```

### 7.4 Update Delivery Status
```
PATCH /api/deliveries/:id/status
```

**Request Body:**
```json
{
  "status": "delivered",
  "deliveryProof": ["url_to_image1", "url_to_image2"]
}
```

---

## 8. Invoice APIs

### 8.1 Get All Invoices
```
GET /api/invoices?status=unpaid
```

### 8.2 Get Invoice by ID
```
GET /api/invoices/:id
```

### 8.3 Create Invoice
```
POST /api/invoices
```

**Request Body:**
```json
{
  "order": "507f1f77bcf86cd799439014",
  "dueDate": "2024-12-31"
}
```

### 8.4 Record Payment
```
POST /api/invoices/:id/payment
```

**Request Body:**
```json
{
  "amount": 50000000,
  "paymentMethod": "bank_transfer",
  "reference": "TXN123456"
}
```

---

## 9. Report APIs

### 9.1 Sales Report
```
GET /api/reports/sales?fromDate=2024-01-01&toDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1000000000,
    "totalOrders": 150,
    "averageOrderValue": 6666667,
    "byMonth": [
      {
        "month": "2024-01",
        "revenue": 80000000,
        "orders": 12
      }
    ],
    "byProduct": [
      {
        "product": "Laptop Dell XPS 15",
        "quantity": 50,
        "revenue": 125000000
      }
    ]
  }
}
```

### 9.2 Customer Report
```
GET /api/reports/customers?type=vip
```

### 9.3 Sales Person Performance
```
GET /api/reports/sales-performance?salesPerson=507f1f77bcf86cd799439012
```

### 9.4 Inventory Report
```
GET /api/reports/inventory
```

### 9.5 Debt Report
```
GET /api/reports/debt?status=overdue
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user
