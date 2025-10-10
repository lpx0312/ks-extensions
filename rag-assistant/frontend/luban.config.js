module.exports = {
  // 扩展名称
  name: 'rag-assistant',
  
  // 扩展标题，显示在UI中
  title: 'RAG 智能助手',
  
  // 扩展描述
  description: '基于RAG技术的KubeSphere智能问答助手',
  
  // 扩展入口点
  entry: './src/index.js',
  
  // 扩展图标（使用KubeSphere内置图标）
  icon: 'robot',
  
  // 扩展版本
  version: '1.0.0',
  
  // 扩展类型：'global' 表示全局扩展，在所有页面可用
  type: 'global',
  
  // 扩展API配置
  api: {
    // 后端API基础URL，可以通过环境变量配置
    // 在Docker环境中，使用相对路径，由Nginx处理路由
    baseURL: process.env.API_BASE_URL || '/api/rag-assistant',
  },
  
  // 构建配置
  build: {
    // 输出目录
    outputDir: 'dist',
    // 是否生成source map
    sourceMap: process.env.NODE_ENV !== 'production',
  },
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    // 开发环境API代理
    proxy: {
      '/api/rag-assistant': {
        target: process.env.DEV_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: { '^/api/rag-assistant': '' },
      },
    },
  },
};
