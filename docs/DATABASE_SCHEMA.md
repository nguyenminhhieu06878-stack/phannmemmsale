# Database Schema - PostgreSQL

## Tổng quan

Hệ thống sử dụng PostgreSQL với Sequelize ORM. Dưới đây là các Tables và Schema.

## 1. Users Table (Người dùng)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'sales_staff',
  phone VARCHAR(20),
  department VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role_enum AS ENUM (
  'admin', 'sales_manager', 'sales_staff', 'customer_service', 
  'warehouse_staff', 'accountant', 'delivery_staff', 'director'
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

## 2. Customers Table (Khách hàng)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  tax_code VARCHAR(20),
  address JSONB DEFAULT '{}',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  customer_type customer_type_enum DEFAULT 'new',
  assigned_sales_id UUID REFERENCES users(id),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  contacts JSONB DEFAULT '[]',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'new');

-- Indexes
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_name ON customers(company_name);
CREATE INDEX idx_customers_sales ON customers(assigned_sales_id);
CREATE INDEX idx_customers_type ON customers(customer_type);
```

## 3. Products Table (Sản phẩm)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) DEFAULT 'pcs',
  price DECIMAL(15,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(15,2) CHECK (cost >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 10 CHECK (min_stock >= 0),
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
```

## 4. Quotations Table (Báo giá)

```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  sales_person_id UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  valid_until TIMESTAMP NOT NULL,
  status quotation_status_enum DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE quotation_status_enum AS ENUM (
  'draft', 'sent', 'approved', 'rejected', 'expired'
);

-- Indexes
CREATE INDEX idx_quotations_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_sales ON quotations(sales_person_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created ON quotations(created_at);
```

## 5. Orders Table (Đơn hàng)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES quotations(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  sales_person_id UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  shipping_address JSONB DEFAULT '{}',
  payment_terms VARCHAR(100),
  status order_status_enum DEFAULT 'pending',
  approved_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  status_history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE order_status_enum AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

-- Indexes
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_sales ON orders(sales_person_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

## 6. Deliveries Table (Giao hàng)

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number VARCHAR(20) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  delivery_staff_id UUID REFERENCES users(id),
  scheduled_date TIMESTAMP,
  delivered_date TIMESTAMP,
  status delivery_status_enum DEFAULT 'preparing',
  tracking_info VARCHAR(100),
  delivery_proof JSONB DEFAULT '[]',
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE delivery_status_enum AS ENUM (
  'preparing', 'in_transit', 'delivered', 'failed'
);

-- Indexes
CREATE INDEX idx_deliveries_number ON deliveries(delivery_number);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_staff ON deliveries(delivery_staff_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
```

## 7. Invoices Table (Hóa đơn)

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status invoice_status_enum DEFAULT 'unpaid',
  payment_history JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE invoice_status_enum AS ENUM (
  'unpaid', 'partial', 'paid', 'overdue'
);

-- Indexes
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);
```

## 8. Activity Logs Table (Nhật ký hoạt động)

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

## Foreign Key Relationships

```sql
-- Users relationships
ALTER TABLE users ADD CONSTRAINT fk_users_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Customers relationships  
ALTER TABLE customers ADD CONSTRAINT fk_customers_sales
  FOREIGN KEY (assigned_sales_id) REFERENCES users(id);

-- Quotations relationships
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_sales
  FOREIGN KEY (sales_person_id) REFERENCES users(id);

-- Orders relationships
ALTER TABLE orders ADD CONSTRAINT fk_orders_quotation
  FOREIGN KEY (quotation_id) REFERENCES quotations(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_sales
  FOREIGN KEY (sales_person_id) REFERENCES users(id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_approved_by
  FOREIGN KEY (approved_by_id) REFERENCES users(id);

-- Deliveries relationships
ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_order
  FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_staff
  FOREIGN KEY (delivery_staff_id) REFERENCES users(id);

-- Invoices relationships
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_order
  FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Activity logs relationships
ALTER TABLE activity_logs ADD CONSTRAINT fk_activity_logs_user
  FOREIGN KEY (user_id) REFERENCES users(id);
```

## JSONB Column Structures

### Customer Address
```json
{
  "street": "123 Main St",
  "city": "Ho Chi Minh City",
  "district": "District 1", 
  "country": "Vietnam"
}
```

### Customer Contacts
```json
[
  {
    "name": "John Doe",
    "position": "Manager",
    "phone": "+84901234567",
    "email": "john@company.com"
  }
]
```

### Order/Quotation Items
```json
[
  {
    "productId": "uuid",
    "productCode": "PROD001",
    "productName": "Product Name",
    "quantity": 10,
    "unitPrice": 100.00,
    "discount": 5.00,
    "amount": 950.00
  }
]
```

### Order Status History
```json
[
  {
    "status": "confirmed",
    "changedBy": "uuid",
    "changedAt": "2024-01-01T10:00:00Z",
    "note": "Order confirmed by sales manager"
  }
]
```

## Advantages of PostgreSQL for ERP

1. **ACID Compliance**: Strong consistency for financial data
2. **Complex Queries**: Advanced SQL features for reporting
3. **JSONB Support**: Flexible data storage when needed
4. **Constraints**: Data integrity enforcement
5. **Performance**: Excellent query optimization
6. **Scalability**: Vertical and horizontal scaling options
7. **Backup & Recovery**: Robust backup solutions
8. **Extensions**: PostGIS, full-text search, etc.
