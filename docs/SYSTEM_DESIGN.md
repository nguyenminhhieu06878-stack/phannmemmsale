# Thiết kế hệ thống

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │    Tablet    │      │
│  │  (React App) │  │     App      │  │     App      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer (Node.js)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js REST API                      │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │  Auth  │  │Customer│  │ Order  │  │ Report │    │   │
│  │  │ Module │  │ Module │  │ Module │  │ Module │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MongoDB    │  │     Redis    │  │  File Storage│      │
│  │   Database   │  │    Cache     │  │   (S3/Local) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Kiến trúc Frontend (React + Vite)

### Component Structure
```
src/
├── components/
│   ├── common/              # Shared components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Table/
│   │   ├── Modal/
│   │   └── Card/
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   └── features/            # Feature-specific
│       ├── CustomerForm/
│       ├── OrderTable/
│       └── SalesChart/
├── pages/
│   ├── Dashboard/
│   ├── Login/
│   ├── Customers/
│   │   ├── CustomerList.jsx
│   │   ├── CustomerDetail.jsx
│   │   └── CustomerForm.jsx
│   ├── Orders/
│   ├── Products/
│   └── Reports/
├── hooks/                   # Custom hooks
│   ├── useAuth.js
│   ├── useCustomers.js
│   └── useOrders.js
├── services/                # API services
│   ├── api.js
│   ├── authService.js
│   ├── customerService.js
│   └── orderService.js
├── store/                   # State management
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── customerSlice.js
│   │   └── orderSlice.js
│   └── store.js
└── utils/
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

### State Management (Redux Toolkit)
```javascript
// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    orders: orderReducer,
  },
});
```

### Routing Structure
```javascript
// routes/index.jsx
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'customers', element: <CustomerList /> },
      { path: 'customers/:id', element: <CustomerDetail /> },
      { path: 'orders', element: <OrderList /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'products', element: <ProductList /> },
      { path: 'reports', element: <Reports /> },
    ]
  },
  { path: '/login', element: <Login /> },
];
```

## Kiến trúc Backend (Node.js + Express)

### Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   ├── jwt.js            # JWT config
│   │   └── constants.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Invoice.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── orderController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── orders.js
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.js           # JWT verification
│   │   ├── roleCheck.js      # Role-based access
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── services/
│   │   ├── orderService.js
│   │   ├── emailService.js
│   │   └── reportService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── .env
└── server.js
```

### Middleware Chain
```javascript
Request → CORS → Helmet → Morgan → Body Parser 
  → JWT Auth → Role Check → Route Handler 
  → Response / Error Handler
```

### Authentication Flow
```
1. User submits login credentials
   ↓
2. Server validates username/password
   ↓
3. Server generates JWT token
   ↓
4. Client stores token (localStorage)
   ↓
5. Client includes token in Authorization header
   ↓
6. Server validates token with middleware
   ↓
7. Server checks user role/permissions
   ↓
8. Grant or deny access
```

## Database Design (MongoDB)

### Collections Overview
```
users              → User accounts and authentication
customers          → Customer information
products           → Product catalog
quotations         → Sales quotations
orders             → Sales orders
deliveries         → Delivery tracking
invoices           → Invoices and payments
activity_logs      → Audit trail
```

### Data Flow Example: Create Order
```
1. Frontend: User creates order
   ↓
2. API: POST /api/orders
   ↓
3. Validation: Check customer, products, stock
   ↓
4. Business Logic:
   - Generate order number
   - Calculate totals
   - Check credit limit
   ↓
5. Database: Save order document
   ↓
6. Side Effects:
   - Update product stock
   - Create activity log
   - Send notification
   ↓
7. Response: Return order data
```

## Security Architecture

### Authentication & Authorization
```javascript
// JWT Token Structure
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "sales_staff",
  "iat": 1640000000,
  "exp": 1640604800
}

// Role-based Access Control
const permissions = {
  admin: ['*'],
  sales_manager: ['customers:*', 'orders:*', 'reports:read'],
  sales_staff: ['customers:read', 'orders:create', 'orders:update'],
  // ...
};
```

### Security Measures
- Password hashing with bcrypt (10 rounds)
- JWT token with expiration
- HTTPS only in production
- CORS configuration
- Helmet.js for HTTP headers
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection
- Rate limiting
- Activity logging

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Memoization with useMemo/useCallback
- Virtual scrolling for large lists
- Image lazy loading
- Bundle optimization with Vite
- CDN for static assets

### Backend
- MongoDB indexing
- Query optimization
- Redis caching for frequent queries
- Pagination for large datasets
- Compression middleware
- Connection pooling

### Database
```javascript
// Important indexes
db.orders.createIndex({ customer: 1, status: 1 });
db.orders.createIndex({ salesPerson: 1, createdAt: -1 });
db.customers.createIndex({ companyName: "text" });
db.products.createIndex({ name: "text" });
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Load balancer (Nginx/HAProxy)
- MongoDB replica set
- Redis cluster for caching

### Vertical Scaling
- Optimize queries
- Increase server resources
- Database sharding (if needed)

## Monitoring & Logging

### Application Monitoring
- Winston for logging
- Morgan for HTTP request logging
- Error tracking (Sentry)
- Performance monitoring (New Relic)

### Database Monitoring
- MongoDB Atlas monitoring
- Query performance analysis
- Index usage statistics

## Deployment Architecture

### Development
```
Local Machine
├── Frontend: localhost:3000 (Vite dev server)
├── Backend: localhost:5000 (Nodemon)
└── Database: localhost:27017 (MongoDB)
```

### Production
```
Cloud Infrastructure
├── Frontend: Vercel/Netlify (Static hosting)
├── Backend: Railway/Render (Node.js hosting)
├── Database: MongoDB Atlas (Cloud database)
└── CDN: Cloudflare (Static assets)
```

## API Design Principles

1. RESTful conventions
2. Consistent response format
3. Proper HTTP status codes
4. Versioning (/api/v1/)
5. Pagination for lists
6. Filtering and sorting
7. Error handling
8. Documentation (Swagger)

## Testing Strategy

### Frontend Testing
- Unit tests: Jest + React Testing Library
- Component tests
- Integration tests
- E2E tests: Cypress/Playwright

### Backend Testing
- Unit tests: Jest
- Integration tests: Supertest
- API tests
- Database tests

## CI/CD Pipeline

```
Git Push → GitHub Actions
  ↓
Run Tests
  ↓
Build Application
  ↓
Deploy to Staging
  ↓
Manual Approval
  ↓
Deploy to Production
```
