# KubeSphere RAG 扩展安装指南

本文档提供了在 KubeSphere 集群中安装和配置 RAG 智能助手扩展的详细步骤。

## 前提条件

- KubeSphere v3.3.0+
- Kubernetes v1.19+
- Helm v3.0+
- 至少 8GB 可用内存和 4 核 CPU
- 持久化存储支持 (用于 Milvus、文档存储等)
- 大语言模型 API 访问密钥

## 安装方式

RAG 扩展支持两种安装方式：

1. **Docker Compose 开发环境**：适用于本地开发和测试
2. **Kubernetes 部署**：适用于生产环境

## Docker Compose 开发环境

### 步骤 1：准备环境

1. 确保已安装 Docker 和 Docker Compose
2. 克隆仓库:
   ```bash
   git clone https://github.com/kubesphere/rag-extension.git
   cd rag-extension
   ```

3. 创建环境变量文件:
   ```bash
   cp deploy/.env.example deploy/.env
   ```

4. 编辑 `.env` 文件，填入您的 LLM API 密钥:
   ```
   LLM_API_KEY=your_api_key_here
   LLM_API_URL=https://api.example.com/v1
   ```

### 步骤 2：构建和启动服务

```bash
cd deploy
docker-compose up -d
```

服务启动后，可通过以下地址访问:
- RAG API: http://localhost:8000
- 前端界面: http://localhost:80

## Kubernetes 部署

### 步骤 1：准备环境

1. 确保您有权限访问 KubeSphere 集群
2. 克隆仓库:
   ```bash
   git clone https://github.com/kubesphere/rag-extension.git
   cd rag-extension
   ```

### 步骤 2：创建命名空间

如果尚未创建，请创建 kubesphere-system 命名空间:

```bash
kubectl create namespace kubesphere-system
```

### 步骤 3：配置密钥

1. 生成 base64 编码的 API 密钥:
   ```bash
   echo -n "your_api_key_here" | base64
   echo -n "https://api.example.com/v1" | base64
   ```

2. 编辑 `deploy/k8s/rag-secrets.yaml` 文件，填入 base64 编码后的值

3. 应用密钥配置:
   ```bash
   kubectl apply -f deploy/k8s/rag-secrets.yaml
   ```

### 步骤 4：创建持久卷声明

```bash
kubectl apply -f deploy/k8s/rag-pvc.yaml
```

### 步骤 5：部署 Milvus

```bash
kubectl apply -f deploy/k8s/milvus-deployment.yaml
```

### 步骤 6：部署 RAG API

```bash
kubectl apply -f deploy/k8s/rag-deployment.yaml
kubectl apply -f deploy/k8s/rag-service.yaml
```

### 步骤 7：配置 Ingress

```bash
kubectl apply -f deploy/k8s/rag-ingress.yaml
```

### 步骤 8：部署前端扩展

1. 构建前端扩展:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. 将构建产物上传到 KubeSphere 控制台:
   - 登录 KubeSphere 管理控制台
   - 进入"系统管理" > "扩展管理"
   - 点击"上传扩展"
   - 选择 `frontend/dist` 目录下的构建产物

## 验证安装

1. 检查 Pod 状态:
   ```bash
   kubectl get pods -n kubesphere-system -l app=rag-api
   kubectl get pods -n kubesphere-system -l app=milvus
   ```

2. 访问 KubeSphere 控制台，确认扩展已正确加载
3. 点击界面右下角的 RAG 助手图标，测试功能是否正常

## 配置说明

### 环境变量

RAG API 服务支持以下环境变量:

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| MILVUS_HOST | Milvus 服务地址 | localhost |
| MILVUS_PORT | Milvus 服务端口 | 19530 |
| LLM_API_KEY | 大语言模型 API 密钥 | - |
| LLM_API_URL | 大语言模型 API 地址 | - |

### 资源配置

可以根据需求调整 `deploy/k8s/rag-deployment.yaml` 中的资源限制:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
  requests:
    cpu: "500m"
    memory: "512Mi"
```

## 故障排除

### 常见问题

1. **Pod 启动失败**
   - 检查日志: `kubectl logs -n kubesphere-system <pod-name>`
   - 确认资源限制是否合理
   - 验证密钥配置是否正确

2. **无法连接到 Milvus**
   - 确认 Milvus Pod 状态: `kubectl get pods -n kubesphere-system -l app=milvus`
   - 检查网络策略是否允许服务间通信

3. **前端扩展无法加载**
   - 检查浏览器控制台错误
   - 确认 Ingress 配置正确
   - 验证 API 服务是否可访问

### 日志查看

```bash
# 查看 RAG API 日志
kubectl logs -n kubesphere-system -l app=rag-api

# 查看 Milvus 日志
kubectl logs -n kubesphere-system -l app=milvus
```

## 卸载

要完全卸载 RAG 扩展:

```bash
# 删除 Kubernetes 资源
kubectl delete -f deploy/k8s/

# 从 KubeSphere 控制台删除前端扩展
# 进入"系统管理" > "扩展管理"，找到 RAG 扩展并删除
```
