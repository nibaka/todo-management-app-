export interface Todo {
  _id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_completed?: boolean;
}

export interface TodosResponse {
  message: string;
  data: Todo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TodoResponse {
  message: string;
  data: Todo;
}

export interface DeleteResponse {
  message: string;
}

export interface TodoFilters {
  page?: number;
  limit?: number;
  sort?: 'title' | 'description' | 'start_date' | 'end_date' | 'is_completed' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  title?: string;
  description?: string;
  is_completed?: boolean;
  start_date?: string;
  end_date?: string;
}