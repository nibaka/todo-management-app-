import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { todosAPI } from '../../services/api';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
} from '../../types/todo.types';



// Define the state shape
interface TodosState {
  items: Todo[];
  selectedTodo: Todo | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  filters: TodoFilters;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TodosState = {
  items: [],
  selectedTodo: null,
  meta: null,
  filters: {
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  },
  loading: false,
  error: null,
};

// Async Thunks - API calls
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (filters: TodoFilters) => {
    const response = await todosAPI.getTodos(filters);
    return response;
  }
);

export const fetchTodoById = createAsyncThunk(
  'todos/fetchTodoById',
  async (id: string) => {
    const response = await todosAPI.getTodoById(id);
    // console.log('Fetch by id response', response);
    return response.data || response;
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (data: CreateTodoRequest) => {
    const response = await todosAPI.createTodo(data);
    return response.data;
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, data }: { id: string; data: UpdateTodoRequest }) => {
    const response = await todosAPI.updateTodo(id, data);
    return response.data;
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string) => {
    await todosAPI.deleteTodo(id);
    return id;
  }
);

// Create the slice
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Synchronous actions
    setFilters: (state, action: PayloadAction<Partial<TodoFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedTodo: (state) => {
      state.selectedTodo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todos';
      })
      
      // Fetch todo by ID
      .addCase(fetchTodoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodoById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTodo = action.payload;
      })
      .addCase(fetchTodoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todo';
      })
      
      // Create todo
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        if (state.meta) {
          state.meta.total += 1;
        }
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create todo';
      })
      
      // Update todo
      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          const index = state.items.findIndex(item => item._id === action.payload._id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedTodo?._id === action.payload._id) {
            state.selectedTodo = action.payload;
          }
        }
      })
      
      // Delete todo
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        if (state.meta) {
          state.meta.total -= 1;
        }
        if (state.selectedTodo?._id === action.payload) {
          state.selectedTodo = null;
        }
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete todo';
      });
  },
});

// Export actions
export const { setFilters, clearSelectedTodo, clearError } = todosSlice.actions;

// Export reducer
export default todosSlice.reducer;