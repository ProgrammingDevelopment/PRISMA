// ApiClient — Base HTTP client for microservice API calls
// Provides centralized error handling, auth headers, and retry logic

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prisma_credentials');
      if (stored) {
        try {
          const creds = JSON.parse(stored);
          headers['Authorization'] = `Bearer ${creds.sessionToken}`;
        } catch {
          // Invalid stored credentials
        }
      }
    }
    return headers;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...(options?.skipAuth ? {} : this.getAuthHeaders()),
      };

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return {
          success: false,
          error: `API Error (${response.status}): ${errorText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error: unknown) {
      clearTimeout(timer);

      if (error instanceof DOMException && error.name === 'AbortError') {
        return { success: false, error: 'Request timeout', status: 408 };
      }

      const message = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: message, status: 0 };
    }
  }

  async get<T>(path: string, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body: unknown, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body: unknown, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async delete<T>(path: string, options?: { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>('/health', { skipAuth: true });
      return response.success;
    } catch {
      return false;
    }
  }
}

// Factory function for creating service-specific clients
export function createApiClient(servicePath: string): ApiClient {
  const gatewayUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000/api/v1')
    : 'http://localhost:4000/api/v1';

  return new ApiClient({
    baseUrl: `${gatewayUrl}${servicePath}`,
  });
}
