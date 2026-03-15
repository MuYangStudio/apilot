import { createAPI } from '../dist/index';
import config from './config';

const api = createAPI(config);

// 动态添加拦截器
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = Date.now();
  return config;
});

// 使用示例
async function example() {
  try {
    // 获取用户列表
    const users = await api.user.list({ page: 1, limit: 10 });
    console.log('Users:', users);

    // 获取单个用户
    const user = await api.user.get({ id: 123 });
    console.log('User:', user);

    // 创建用户
    const newUser = await api.user.create({ name: 'Alice' });
    console.log('New User:', newUser);

    // 登录
    const token = await api.auth.login({ username: 'test', password: '123456' });
    console.log('Token:', token);

    // 获取文章评论
    const comments = await api.post.comment.list({ postId: 42 });
    console.log('Comments:', comments);
  } catch (error) {
    console.error('Error:', error);
  }
}

example();