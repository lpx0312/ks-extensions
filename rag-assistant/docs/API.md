# KubeSphere RAG 扩展 API 文档

本文档详细说明了 KubeSphere RAG 扩展的 API 接口规范。

## 基本信息

- **基础URL**: `/api/rag-assistant`
- **格式**: JSON
- **认证**: 无 (依赖 KubeSphere 认证)

## API 端点

### 健康检查

**请求**:
```
GET /health
```

**响应**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

### 文档管理

#### 上传文档

**请求**:
```
POST /documents/upload
Content-Type: multipart/form-data
```

参数:
- `file`: 文件对象 (必须)

**响应**:
```json
{
  "status": "success",
  "message": "文档 'example.pdf' 上传成功",
  "document_id": "d8e8fca2-dc0f-4a9e-a85e-30f6a8d74e9c",
  "chunks": 10
}
```

### 查询

#### 一次性查询

**请求**:
```
POST /query
Content-Type: application/json
```

请求体:
```json
{
  "question": "什么是KubeSphere?",
  "top_k": 3,
  "method": "hybrid"
}
```

参数:
- `question`: 查询问题 (必须)
- `top_k`: 返回的相关文档数量 (可选，默认: 3)
- `method`: 检索方法 (可选，默认: "hybrid")
  - 可选值: "dense", "sparse", "hybrid"

**响应**:
```json
{
  "answer": "KubeSphere是一个开源的企业级容器平台，提供了基于Kubernetes的多租户容器编排和管理系统。它简化了Kubernetes的复杂操作，提供了友好的Web UI界面，支持多集群管理、DevOps、微服务治理、应用商店等功能。",
  "sources": [
    {
      "document_id": "doc_1",
      "file_path": "kubesphere_intro.pdf",
      "title": "KubeSphere简介",
      "text": "KubeSphere是一个开源的企业级容器平台，提供了基于Kubernetes的多租户容器编排和管理系统...",
      "score": 0.95
    }
  ],
  "metadata": {
    "retrieval_method": "hybrid",
    "top_k": 3,
    "query_time_ms": 150
  }
}
```

### 对话

#### 创建/继续对话

**请求**:
```
POST /conversation
Content-Type: application/json
```

请求体:
```json
{
  "question": "什么是KubeSphere?",
  "session_id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb"
}
```

参数:
- `question`: 用户问题 (必须)
- `session_id`: 会话ID (可选，如果不提供则创建新会话)

**响应**:
```json
{
  "answer": "KubeSphere是一个开源的企业级容器平台，提供了基于Kubernetes的多租户容器编排和管理系统。它简化了Kubernetes的复杂操作，提供了友好的Web UI界面，支持多集群管理、DevOps、微服务治理、应用商店等功能。",
  "session_id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb",
  "sources": [
    {
      "document_id": "doc_1",
      "file_path": "kubesphere_intro.pdf",
      "title": "KubeSphere简介",
      "text": "KubeSphere是一个开源的企业级容器平台，提供了基于Kubernetes的多租户容器编排和管理系统...",
      "score": 0.95
    }
  ],
  "metadata": {
    "query_time_ms": 200
  }
}
```

#### 流式对话

**请求**:
```
POST /conversation/stream
Content-Type: application/json
```

请求体:
```json
{
  "question": "什么是KubeSphere?",
  "session_id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb"
}
```

参数:
- `question`: 用户问题 (必须)
- `session_id`: 会话ID (可选，如果不提供则创建新会话)

**响应**:
Server-Sent Events (SSE) 流，包含以下事件类型:

1. 元数据事件:
```json
{
  "type": "metadata",
  "session_id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb",
  "sources": [
    {
      "document_id": "doc_1",
      "file_path": "kubesphere_intro.pdf",
      "title": "KubeSphere简介",
      "text": "KubeSphere是一个开源的企业级容器平台...",
      "score": 0.95
    }
  ]
}
```

2. 内容事件 (多个):
```json
{
  "type": "content",
  "content": "KubeSphere是一个开源的"
}
```
```json
{
  "type": "content",
  "content": "企业级容器平台，"
}
```

3. 结束事件:
```json
{
  "type": "end",
  "session_id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb"
}
```

### 会话管理

#### 获取会话列表

**请求**:
```
GET /sessions
```

**响应**:
```json
[
  {
    "id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb",
    "title": "关于KubeSphere的问题",
    "created_at": "2025-09-30T10:15:30.123Z",
    "updated_at": "2025-09-30T10:20:45.678Z",
    "message_count": 4
  },
  {
    "id": "7b9eeb42-982b-4284-86bd-a3ddc6b500f1",
    "title": "Kubernetes部署问题",
    "created_at": "2025-09-29T14:30:20.456Z",
    "updated_at": "2025-09-29T14:45:12.789Z",
    "message_count": 6
  }
]
```

#### 获取会话详情

**请求**:
```
GET /sessions/{session_id}
```

参数:
- `session_id`: 会话ID (路径参数)

**响应**:
```json
{
  "id": "3c2a8e59-b5e9-4390-917c-fba6ccef39bb",
  "title": "关于KubeSphere的问题",
  "created_at": "2025-09-30T10:15:30.123Z",
  "updated_at": "2025-09-30T10:20:45.678Z",
  "messages": [
    {
      "role": "user",
      "content": "什么是KubeSphere?",
      "timestamp": "2025-09-30T10:15:30.123Z"
    },
    {
      "role": "assistant",
      "content": "KubeSphere是一个开源的企业级容器平台，提供了基于Kubernetes的多租户容器编排和管理系统。它简化了Kubernetes的复杂操作，提供了友好的Web UI界面，支持多集群管理、DevOps、微服务治理、应用商店等功能。",
      "sources": [
        {
          "document_id": "doc_1",
          "file_path": "kubesphere_intro.pdf",
          "title": "KubeSphere简介",
          "text": "KubeSphere是一个开源的企业级容器平台...",
          "score": 0.95
        }
      ],
      "timestamp": "2025-09-30T10:15:35.456Z"
    }
  ]
}
```

#### 删除会话

**请求**:
```
DELETE /sessions/{session_id}
```

参数:
- `session_id`: 会话ID (路径参数)

**响应**:
```json
{
  "status": "success",
  "message": "会话 3c2a8e59-b5e9-4390-917c-fba6ccef39bb 已删除"
}
```

## 错误处理

所有API错误响应遵循以下格式:

```json
{
  "detail": "错误信息描述"
}
```

常见HTTP状态码:

- `200 OK`: 请求成功
- `400 Bad Request`: 请求参数无效
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 数据模型

### Source

| 字段 | 类型 | 描述 |
|------|------|------|
| document_id | string | 文档唯一标识符 |
| file_path | string | 文件路径 (可选) |
| title | string | 文档标题 (可选) |
| text | string | 文档内容片段 |
| score | float | 相关性得分 (0-1) |

### Message

| 字段 | 类型 | 描述 |
|------|------|------|
| role | string | 消息角色 ("user" 或 "assistant") |
| content | string | 消息内容 |
| sources | Array\<Source\> | 引用来源 (仅assistant消息) |
| timestamp | string | ISO 8601格式的时间戳 |

### Session

| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 会话唯一标识符 |
| title | string | 会话标题 |
| messages | Array\<Message\> | 会话消息列表 |
| created_at | string | ISO 8601格式的创建时间 |
| updated_at | string | ISO 8601格式的更新时间 |
