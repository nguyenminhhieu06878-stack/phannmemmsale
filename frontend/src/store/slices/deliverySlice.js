import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deliveryService } from '../../services/deliveryService';

export const fetchDeliveries = createAsyncThunk(
  'deliveries/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDeliveryById = createAsyncThunk(
  'deliveries/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createDelivery = createAsyncThunk(
  'deliveries/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await deliveryService.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDelivery = createAsyncThunk(
  'deliveries/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await deliveryService.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDelivery = createAsyncThunk(
  'deliveries/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deliveryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const deliverySlice = createSlice({
  name: 'deliveries',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrent: (state) => {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeliveryById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateDelivery.fulfilled, (state, action) => {
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.current = action.payload;
      })
      .addCase(deleteDelivery.fulfilled, (state, action) => {
        state.list = state.list.filter(d => d.id !== action.payload);
      });
  }
});

export const { clearError, clearCurrent } = deliverySlice.actions;
export default deliverySlice.reducer;
