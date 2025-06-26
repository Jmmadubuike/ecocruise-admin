// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Ticket {
  _id: string;
} 