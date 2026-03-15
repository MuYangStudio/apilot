<div align="center">
  <h1>apilot - 极致简单：配置即服务</h1>
  <p>你只需要一个 JSON/JS 文件，就能同时定义接口地址、域名、拦截器。一行代码初始化，全局 API 即用。</p>
</div>

## 📖 简介

`apilot` 是一款极致简化的前端 API 管理库。它让你告别重复的请求封装、繁琐的拦截器配置——**所有配置都集中在一个文件里**，包括接口列表、域名映射、请求拦截器、响应拦截器。只需调用 `createAPI(config)`，即可获得一个结构清晰、类型提示完整的 API 客户端。

## ✨ 核心理念

- **配置即全部**：接口、域名、拦截器全写在一个文件里，没有额外步骤。
- **零冗余调用**：自动处理路径参数、查询参数、请求体，调用时只需传入数据对象。
- **链式拦截器**：既可在配置中定义初始拦截器，也可随时通过 `api.interceptors` 动态添加。
- **多域名原生支持**：配置 `domains` 即可区分不同后端。
- **TypeScript 优先**：自动推导参数类型，IDE 提示一步到位。

## 📦 安装

```bash
npm install apilot
# 或
yarn add apilot
```

## 🚀 极速上手

### 1. 创建 `apis/config.js`，定义所有内容

```javascript
export default {
  // 域名映射
  domains: {
    main: 'https://api.example.com/v1',
    auth: 'https://auth.example.com',
  },

  // 拦截器（可选）
  interceptors: {
    // 请求拦截器：添加 token
    request: (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    // 响应拦截器：直接取 data
    response: (response) => response.data,
    // 响应错误处理
    responseError: (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  },

  // 接口定义
  user: {
    list:   { url: '/users', method: 'GET', domain: 'main' },
    get:    { url: '/users/:id', method: 'GET', domain: 'main' },
    create: { url: '/users', method: 'POST', domain: 'main' },
    update: { url: '/users/:id', method: 'PUT', domain: 'main' },
    delete: { url: '/users/:id', method: 'DELETE', domain: 'main' },
  },
  auth: {
    login:  { url: '/login', method: 'POST', domain: 'auth' },
    logout: { url: '/logout', method: 'POST', domain: 'auth' },
  },
  post: {
    list:   { url: '/posts', method: 'GET', domain: 'main' },
    comment: {
      list: { url: '/posts/:postId/comments', method: 'GET', domain: 'main' },
    },
  },
};
```

### 2. 初始化 API（`apis/index.js`）

```javascript
import { createAPI } from 'apilot';
import config from './config';

// 一行代码，所有配置自动生效
export const api = createAPI(config);
```

### 3. 在项目中使用

```javascript
import { api } from './apis';

// 获取用户列表（自动添加 token 等拦截器）
const users = await api.user.list({ page: 1, limit: 10 });

// 获取单个用户
const user = await api.user.get({ id: 123 });

// 创建用户
const newUser = await api.user.create({ name: 'Alice' });

// 登录
const token = await api.auth.login({ username: 'test', password: '123456' });

// 获取文章评论
const comments = await api.post.comment.list({ postId: 42 });
```

## 🔧 更多用法

### 动态添加拦截器（与配置中定义的共存）

```javascript
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = Date.now();
  return config;
});
```

### 指定超时或额外配置

```javascript
// 每个请求可额外传入配置，如超时
await api.user.list({ page: 1 }, { timeout: 3000 });
```

### TypeScript 支持

```typescript
interface User {
  id: number;
  name: string;
}

const users = await api.user.list<User>({ page: 1 });
// users 类型为 User[]
```

## ⚙️ 配置项详解

| 字段         | 类型                     | 说明                                                                 |
|--------------|--------------------------|----------------------------------------------------------------------|
| `domains`    | `Record<string, string>` | 域名映射，如 `{ main: 'https://api.example.com' }`                    |
| `interceptors` | `object`               | 可选，包含 `request`、`response`、`responseError` 三个拦截器函数      |
| `任意嵌套对象` | `object`                 | 接口定义，叶子节点必须包含 `url`，可选 `method`、`domain`             |

- **接口定义**：叶子节点格式 `{ url: string, method?: string, domain?: string }`。
  - `url`：支持动态参数（如 `/users/:id`）
  - `method`：默认 `'GET'`
  - `domain`：指定使用哪个域名，若未指定则使用默认域名（`domains.default` 或 `createAPI` 的 `baseURL`）

## 🧠 为什么 apilot 是最简单的？

- **传统方式**：定义接口 → 创建实例 → 手动添加拦截器 → 导出使用。
- **apilot 方式**：定义接口 + 拦截器 → 创建实例 → 直接使用。

所有配置都在一个文件里，一目了然，修改一处即可影响全局。拦截器既可以在配置中静态定义，也可以动态添加，兼顾简洁与灵活。

## 📁 项目结构

```
apilot/
├── src/                # 源码
├── examples/           # 使用示例
├── package.json
├── README.md
└── LICENSE
```

## 🚀 开源计划

- 发布 npm 包：`apilot`
- 完善文档，添加在线示例
- 欢迎 PR：支持请求取消、上传进度等扩展

## 📄 许可证

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证。

**您可以自由地：**
- **共享** — 在任何媒介或格式下复制、分发本作品
- **改编** — 重混、转换本作品、依据本作品进行创作

**惟须遵守下列条件：**
- **署名** — 您必须给出适当的署名，提供指向本许可证的链接，同时标明是否进行了修改
- **非商业性使用** — 您不得将本作品用于商业目的
- **相同方式共享** — 如果您重混、转换本作品或依据本作品进行创作，您必须使用与原作相同的许可协议来分发您的贡献作品

---

## 📖 English Version

<div align="center">
  <h1>apilot - Extreme Simplicity: Configuration as Service</h1>
  <p>You only need one JSON/JS file to define API endpoints, domains, and interceptors. One line of code to initialize, and global API is ready to use.</p>
</div>

### Introduction

`apilot` is an extremely simplified frontend API management library. It helps you say goodbye to repetitive request encapsulation and cumbersome interceptor configuration—**all configurations are centralized in one file**, including API list, domain mapping, request interceptors, and response interceptors. Just call `createAPI(config)` to get a well-structured API client with complete type hints.

### Core Concepts

- **Configuration as All**：All APIs, domains, and interceptors are written in one file, no extra steps.
- **Zero Redundancy Calls**：Automatically handle path parameters, query parameters, and request body, just pass data object when calling.
- **Chained Interceptors**：Define initial interceptors in configuration, or dynamically add via `api.interceptors` anytime.
- **Multi-domain Native Support**：Configure `domains` to distinguish different backends.
- **TypeScript First**：Automatic parameter type inference, IDE hints in one step.

### Installation

```bash
npm install apilot
# or
yarn add apilot
```

### Quick Start

#### 1. Create `apis/config.js`, define all content

```javascript
export default {
  // Domain mapping
  domains: {
    main: 'https://api.example.com/v1',
    auth: 'https://auth.example.com',
  },

  // Interceptors (optional)
  interceptors: {
    // Request interceptor: add token
    request: (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    // Response interceptor: directly get data
    response: (response) => response.data,
    // Response error handler
    responseError: (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  },

  // API definitions
  user: {
    list:   { url: '/users', method: 'GET', domain: 'main' },
    get:    { url: '/users/:id', method: 'GET', domain: 'main' },
    create: { url: '/users', method: 'POST', domain: 'main' },
    update: { url: '/users/:id', method: 'PUT', domain: 'main' },
    delete: { url: '/users/:id', method: 'DELETE', domain: 'main' },
  },
  auth: {
    login:  { url: '/login', method: 'POST', domain: 'auth' },
    logout: { url: '/logout', method: 'POST', domain: 'auth' },
  },
  post: {
    list:   { url: '/posts', method: 'GET', domain: 'main' },
    comment: {
      list: { url: '/posts/:postId/comments', method: 'GET', domain: 'main' },
    },
  },
};
```

#### 2. Initialize API (`apis/index.js`)

```javascript
import { createAPI } from 'apilot';
import config from './config';

// One line of code, all configurations take effect automatically
export const api = createAPI(config);
```

#### 3. Use in project

```javascript
import { api } from './apis';

// Get user list (automatically add token etc. via interceptors)
const users = await api.user.list({ page: 1, limit: 10 });

// Get single user
const user = await api.user.get({ id: 123 });

// Create user
const newUser = await api.user.create({ name: 'Alice' });

// Login
const token = await api.auth.login({ username: 'test', password: '123456' });

// Get post comments
const comments = await api.post.comment.list({ postId: 42 });
```

### More Usage

#### Dynamically Add Interceptors (coexist with configured ones)

```javascript
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = Date.now();
  return config;
});
```

#### Specify Timeout or Extra Configuration

```javascript
// Each request can pass extra configuration, such as timeout
await api.user.list({ page: 1 }, { timeout: 3000 });
```

#### TypeScript Support

```typescript
interface User {
  id: number;
  name: string;
}

const users = await api.user.list<User>({ page: 1 });
// users type is User[]
```

### Configuration Details

| Field        | Type                     | Description                                                         |
|--------------|--------------------------|---------------------------------------------------------------------|
| `domains`    | `Record<string, string>` | Domain mapping, e.g. `{ main: 'https://api.example.com' }`           |
| `interceptors` | `object`               | Optional, contains `request`, `response`, `responseError` functions |
| `Any nested object` | `object`             | API definitions, leaf nodes must contain `url`, optional `method`、`domain` |

- **API definition**: Leaf node format `{ url: string, method?: string, domain?: string }`.
  - `url`: Supports dynamic parameters (e.g. `/users/:id`)
  - `method`: Default `'GET'`
  - `domain`: Specify which domain to use, if not specified, use default domain (`domains.default` or `createAPI`'s `baseURL`)

### Why is apilot the Simplest?

- **Traditional way**: Define APIs → Create instance → Manually add interceptors → Export for use.
- **apilot way**: Define APIs + interceptors → Create instance → Use directly.

All configurations are in one file, clear at a glance, modify one place to affect the entire project. Interceptors can be statically defined in the configuration or dynamically added, balancing simplicity and flexibility.

### Project Structure

```
apilot/
├── src/                # Source code
├── examples/           # Usage examples
├── package.json
├── README.md
└── LICENSE
```

### Open Source Plan

- Publish npm package: `apilot`
- Improve documentation, add online examples
- Welcome PRs: Support request cancellation, upload progress, etc.

### License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

**You are free to:**
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **NonCommercial** — You may not use the material for commercial purposes
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

---

**Now let's get started!** This project will make your GitHub profile stand out instantly—because it truly solves the repetitive work problem in frontend development.