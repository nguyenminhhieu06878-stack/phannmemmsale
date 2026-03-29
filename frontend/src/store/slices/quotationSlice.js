import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quotationService } from '../../services/quotationService';

export const fetchQuotations = createAsyncThunk(
  'quotations/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await quotationService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  'quotations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quotationService.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createQuotation = createAsyncThunk(
  'quotations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await quotationService.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateQuotation = createAsyncThunk(
  'quotations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await quotationService.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  'quotations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await quotationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const quotationSlice = createSlice({
  name: 'quotations',
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
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        const index = state.list.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.current = action.payload;
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.list = state.list.filter(q => q.id !== action.payload);
      });
  }
});

export const { clearError, clearCurrent } = quotationSlice.actions;
export default quotationSlice.reducer;
