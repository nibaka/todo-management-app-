import axios from 'axios';
import type {
  TodosResponse,
  TodoResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  DeleteResponse,
  TodoFilters,
} from '../types/todo.types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const todosAPI = {
  getTodos: async (filters: TodoFilters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<TodosResponse>('/todos/get', { params });
    return response.data;
  },

  getTodoById: async (id: string) => {
    const response = await api.get<TodoResponse>(`/todos/${id}`);
    return response.data;
  },

  createTodo: async (data: CreateTodoRequest) => {
    const response = await api.post<TodoResponse>('/todos/', data);
    return response.data;
  },

  updateTodo: async (id: string, data: UpdateTodoRequest) => {
    const response = await api.put<TodoResponse>(`/todos/${id}`, data);
    return response.data;
  },

  deleteTodo: async (id: string) => {
    const response = await api.delete<DeleteResponse>(`/todos/${id}`);
    return response.data;
  },
};