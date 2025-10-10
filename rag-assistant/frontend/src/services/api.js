import axios from 'axios';
import config from '../../luban.config';

// 创建axios实例
const apiClient = axios.create({
  baseURL: config.api.baseURL || '/api/rag-assistant',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 获取会话列表
 */
export const getSessions = async () => {
  return apiClient.get('/sessions');
};

/**
 * 获取特定会话详情
 */
export const getConversation = async (sessionId) => {
  return apiClient.get(`/sessions/${sessionId}`);
};

/**
 * 创建新的对话消息
 */
export const createConversation = async ({ question, session_id, stream = false }) => {
  if (stream) {
    return createStreamConversation({ question, session_id });
  }
  
  return apiClient.post('/conversation', {
    question,
    session_id,
  });
};

/**
 * 创建流式对话消息
 */
export const createStreamConversation = ({ question, session_id }) => {
  return new Promise((resolve, reject) => {
    const baseUrl = config.api.baseURL || '/api/rag-assistant';
    
    let url;
    if (baseUrl.startsWith('http')) {
      url = new URL(`${baseUrl}/conversation/stream`);
    } else {
      url = new URL(`${window.location.origin}${baseUrl}/conversation/stream`);
    }
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        session_id,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const eventSource = new EventSource(response.url);
        resolve(eventSource);
      })
      .catch(error => {
        console.error('创建流式对话失败:', error);
        reject(error);
      });
  });
};

/**
 * 上传文档
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const baseUrl = config.api.baseURL || '/api/rag-assistant';
  
  return axios.post(`${baseUrl}/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => response.data);
};

/**
 * 执行一次性查询
 */
export const executeQuery = async ({ question, top_k = 3, method = 'hybrid' }) => {
  return apiClient.post('/query', {
    question,
    top_k,
    method,
  });
};

export default {
  getSessions,
  getConversation,
  createConversation,
  createStreamConversation,
  uploadDocument,
  executeQuery,
};
