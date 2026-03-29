import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import quotationReducer from './slices/quotationSlice';
import orderReducer from './slices/orderSlice';
import deliveryReducer from './slices/deliverySlice';
import invoiceReducer from './slices/invoiceSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    products: productReducer,
    quotations: quotationReducer,
    orders: orderReducer,
    deliveries: deliveryReducer,
    invoices: invoiceReducer,
    reports: reportReducer,
    notifications: notificationReducer,
    users: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export { store };
export default store;
