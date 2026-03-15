export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface EndpointConfig {
  url: string;                 // 接口路径，支持动态参数如 /users/:id
  method?: HttpMethod;          // 请求方法，默认 GET
  domain?: string;              // 域名 key，对应 domains 中的键
  [key: string]: any;           // 允许扩展其他字段
}

export interface Interceptors {
  request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  response?: (response: any) => any;
  responseError?: (error: any) => any;
}

export interface APIConfig {
  domains?: Record<string, string>;   // 域名映射
  interceptors?: Interceptors;         // 全局拦截器
  [key: string]: any;                  // 嵌套的接口配置
}

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  baseURL?: string;                    // 最终完整域名
  headers?: Record<string, string>;
  params?: Record<string, any>;        // 查询参数或路径参数
  data?: any;                           // 请求体
  timeout?: number;
  [key: string]: any;
}

export interface InterceptorHandler<T> {
  onFulfilled?: (value: T) => T | Promise<T>;
  onRejected?: (error: any) => any;
}

export interface InterceptorManager<T> {
  use(onFulfilled?: (value: T) => T | Promise<T>, onRejected?: (error: any) => any): number;
  eject(id: number): void;
}

export interface APIInstance {
  interceptors: {
    request: InterceptorManager<RequestConfig>;
    response: InterceptorManager<any>;
    responseError: InterceptorManager<any>;
  };
  [key: string]: any;
}