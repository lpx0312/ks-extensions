# KubeSphere RAG 智能助手扩展

基于检索增强生成（RAG）技术的 KubeSphere 扩展，为用户提供智能问答能力。


## 📋 简介

KubeSphere RAG 智能助手是一个 KubeSphere 扩展，它能够理解和回答关于 KubeSphere、Kubernetes 以及自定义文档的问题，提供准确的信息和上下文感知的回答。
RAG具体实现：https://github.com/jia17/llm-milvus-api

## ✨ 核心特性

- **智能问答**: 基于文档知识库的上下文感知问答
- **混合检索**: 结合稠密向量和稀疏关键词检索，提高召回率和精准度
- **多轮对话**: 支持保持对话上下文的多轮交互
- **会话管理**: 保存历史会话，随时继续之前的对话
- **文档管理**: 支持上传和管理自定义文档
- **悬浮窗口**: 在 KubeSphere 任意页面可访问
- **完整RAG实现**: 使用 llm-milvus-api 的完整 RAG 功能


## 🚀 快速开始

### 前提条件

- KubeSphere v3.3.0+
- Kubernetes v1.19+
- Helm v3.0+（推荐）
- Node.js v14+（前端开发）
- Python 3.9+（后端开发）
- 大语言模型 API 访问密钥（Kimi 或 qwen）
