import { APIConfig, RequestConfig, EndpointConfig } from './types';
import { InterceptorManager } from './interceptor';
import { defaultFetcher } from './fetcher';

// 递归构建 API 对象
function buildAPI(
  config: APIConfig,
  domainMap: Record<string, string>,
  requestInterceptors: InterceptorManager<RequestConfig>,
  responseInterceptors: InterceptorManager<any>,
  fetcher = defaultFetcher
): any {
  const result: any = {};

  for (const key in config) {
    if (key === 'domains' || key === 'interceptors') continue; // 跳过保留字段
    const value = config[key];

    // 如果是叶子节点（包含 url 属性）
    if (value && typeof value === 'object' && 'url' in value) {
      const endpoint = value as EndpointConfig;
      // 确定 baseURL
      const domainKey = endpoint.domain || 'default';
      const baseURL = domainMap[domainKey] || '';

      // 生成请求函数
      result[key] = async (paramsOrData?: any, extraConfig?: Partial<RequestConfig>) => {
        // 构建基础配置
        let requestConfig: RequestConfig = {
          url: endpoint.url,
          method: endpoint.method || 'GET',
          baseURL,
          headers: {},
          timeout: 0,
          ...extraConfig,
        };

        // 根据方法区分参数用途
        const method = requestConfig.method!.toUpperCase();
        if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(method)) {
          requestConfig.params = paramsOrData;
        } else {
          requestConfig.data = paramsOrData;
        }

        // 执行请求拦截器链
        let promise = Promise.resolve(requestConfig);
        requestInterceptors.forEach(handler => {
          promise = promise.then(handler.onFulfilled, handler.onRejected);
        });

        // 发起请求
        promise = promise.then(cfg => fetcher(cfg));

        // 执行响应拦截器链
        responseInterceptors.forEach(handler => {
          promise = promise.then(handler.onFulfilled, handler.onRejected);
        });

        return promise;
      };
    } else if (value && typeof value === 'object') {
      // 递归处理嵌套对象
      result[key] = buildAPI(value, domainMap, requestInterceptors, responseInterceptors, fetcher);
    } else {
      // 其他值（基本不会出现），直接复制
      result[key] = value;
    }
  }

  return result;
}

export function createAPI(apiConfig: APIConfig, options?: { baseURL?: string; timeout?: number; headers?: Record<string, string>; fetchImpl?: (config: RequestConfig) => Promise<any> }) {
  const { domains = {} } = apiConfig;

  // 构建域名映射，优先使用 config.domains，若不存在则用 options.baseURL 作为默认域名
  const domainMap: Record<string, string> = {
    default: options?.baseURL || '',
    ...domains,
  };
  // 如果 options.baseURL 存在且没有在 domains 中定义 default，则覆盖（已有则忽略）
  if (options?.baseURL && !domains.default) {
    domainMap.default = options.baseURL;
  }

  // 创建拦截器管理器
  const requestInterceptors = new InterceptorManager<RequestConfig>();
  const responseInterceptors = new InterceptorManager<any>();

  // 添加配置中定义的拦截器
  if (apiConfig.interceptors?.request) {
    requestInterceptors.use(apiConfig.interceptors.request);
  }
  if (apiConfig.interceptors?.response) {
    responseInterceptors.use(apiConfig.interceptors.response);
  }
  if (apiConfig.interceptors?.responseError) {
    responseInterceptors.use(undefined, apiConfig.interceptors.responseError);
  }

  // 构建 API 对象
  const api = buildAPI(apiConfig, domainMap, requestInterceptors, responseInterceptors, options?.fetchImpl || defaultFetcher);

  // 将拦截器管理器挂载到 api 上，方便动态添加
  api.interceptors = {
    request: requestInterceptors,
    response: responseInterceptors,
  };

  return api;
}

// 导出类型
export * from './types';