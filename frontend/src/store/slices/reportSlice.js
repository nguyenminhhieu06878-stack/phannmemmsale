import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../../services/reportService';

export const fetchDashboardStats = createAsyncThunk(
  'reports/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getDashboardStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getSalesReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  'reports/fetchRevenueReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getRevenueReport(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  'reports/fetchCustomerReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getCustomerReport();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductReport = createAsyncThunk(
  'reports/fetchProductReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getProductReport();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    dashboardStats: null,
    salesReport: [],
    revenueReport: null,
    customerReport: [],
    productReport: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRevenueReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueReport = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCustomerReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerReport.fulfilled, (state, action) => {
        state.loading = false;
        state.customerReport = action.payload;
      })
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductReport.fulfilled, (state, action) => {
        state.loading = false;
        state.productReport = action.payload;
      })
      .addCase(fetchProductReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
