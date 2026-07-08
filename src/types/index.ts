export interface AuthUser {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role_id: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface OtpMeta {
  message: string
  userId: string
  expiresAt: string
  validityMs: number
}

export interface Plan {
  id: string
  name: string
  plan_code: string
  duration_days: number
  price: number | string
  compare_at_price: number | string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  phone: string | null
  role_id: number
  isVerified: boolean
  isActive: boolean
  isDeleted: boolean
  createdAt: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  plan?: Pick<Plan, 'id' | 'name' | 'plan_code' | 'duration_days' | 'price'>
  user?: {
    id: string
    email: string
    phone: string | null
    first_name: string | null
    last_name: string | null
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string | string[]
  data: T
  meta?: PaginationMeta
  statusCode: number
  timestamp: string
  errors?: unknown
}

export interface ProcessNotificationsResult {
  processed: number
  sent: number
  failed: number
}

export interface CreatePlanInput {
  name: string
  duration_days: number
  plan_code?: string
  price?: number
  compare_at_price?: number
  description?: string
}

export type UpdatePlanInput = Partial<Omit<CreatePlanInput, 'plan_code'>>

export interface ListQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  [key: string]: string | number | boolean | undefined
}

export const ROLE_LABELS: Record<number, string> = {
  0: 'Super Admin',
  1: 'Admin',
  2: 'User',
}
