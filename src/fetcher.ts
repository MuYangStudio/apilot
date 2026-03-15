import { RequestConfig } from './types';

export async function defaultFetcher(config: RequestConfig): Promise<any> {
  const { baseURL, url, method = 'GET', headers = {}, params, data, timeout, ...rest } = config;

  // 构建完整 URL
  let fullURL = baseURL ? baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+ /, '') : url;

  // 替换路径参数（如 /users/:id -> /users/123）
  const pathParams = (fullURL.match(/:[a-zA-Z0-9_]+/g) || []).map(p => p.slice(1));
  if (pathParams.length && params) {
    pathParams.forEach(param => {
      if (params[param] !== undefined) {
        fullURL = fullURL.replace(`:${param}`, encodeURIComponent(params[param]));
        delete params[param]; // 移除已使用的参数，剩余作为查询参数
      }
    });
  }

  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    fullURL += (fullURL.includes('?') ? '&' : '?') + query;
  }

  // 处理请求体
  let body: any = data;
  if (data && typeof data === 'object' && headers['Content-Type']?.includes('application/json')) {
    body = JSON.stringify(data);
  }

  // 超时处理
  const controller = new AbortController();
  let timeoutId: any;
  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(fullURL, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
      signal: controller.signal,
      ...rest,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = response;
      throw error;
    }

    // 解析响应
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
}

export function buildUrl(base: string, path: string): string {
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

export function processConfig(url: string, data?: any, options?: RequestConfig): RequestConfig {
  return {
    url,
    method: 'GET',
    ...options,
    params: { ...data, ...options?.params },
    data: options?.data,
  };
}