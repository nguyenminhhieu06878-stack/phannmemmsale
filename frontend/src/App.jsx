import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import { checkAuth } from './store/slices/authSlice'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import Customers from './pages/customers/Customers'
import Products from './pages/products/Products'
import Quotations from './pages/quotations/Quotations'
import Orders from './pages/orders/Orders'
import Deliveries from './pages/deliveries/Deliveries'
import Invoices from './pages/invoices/Invoices'
import Reports from './pages/reports/Reports'
import Users from './pages/users/Users'
import Profile from './pages/Profile'
import StockRequests from './pages/stock-requests/StockRequests'
import Suppliers from './pages/suppliers/Suppliers'
import PurchaseOrders from './pages/purchase-orders/PurchaseOrders'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading, user } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={
                  user?.role === 'supplier' ? <SupplierDashboard /> : <Dashboard />
                } />
                <Route path="/customers/*" element={
                  <ProtectedRoute requiredPath="/customers">
                    <Customers />
                  </ProtectedRoute>
                } />
                <Route path="/products/*" element={
                  <ProtectedRoute requiredPath="/products">
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/quotations/*" element={
                  <ProtectedRoute requiredPath="/quotations">
                    <Quotations />
                  </ProtectedRoute>
                } />
                <Route path="/orders/*" element={
                  <ProtectedRoute requiredPath="/orders">
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/deliveries/*" element={
                  <ProtectedRoute requiredPath="/deliveries">
                    <Deliveries />
                  </ProtectedRoute>
                } />
                <Route path="/invoices/*" element={
                  <ProtectedRoute requiredPath="/invoices">
                    <Invoices />
                  </ProtectedRoute>
                } />
                <Route path="/reports/*" element={
                  <ProtectedRoute requiredPath="/reports">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/users/*" element={
                  <ProtectedRoute requiredPath="/users">
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="/stock-requests/*" element={
                  <ProtectedRoute requiredPath="/stock-requests">
                    <StockRequests />
                  </ProtectedRoute>
                } />
                <Route path="/suppliers/*" element={
                  <ProtectedRoute requiredPath="/suppliers">
                    <Suppliers />
                  </ProtectedRoute>
                } />
                <Route path="/purchase-orders/*" element={
                  <ProtectedRoute requiredPath="/purchase-orders">
                    <PurchaseOrders />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )} 
        />
      </Routes>
    </Router>
  )
}

export default App