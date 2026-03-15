export default {
  domains: {
    main: 'https://api.example.com/v1',
    auth: 'https://auth.example.com',
  },

  interceptors: {
    request: (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    response: (response) => response.data,
    responseError: (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  },

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