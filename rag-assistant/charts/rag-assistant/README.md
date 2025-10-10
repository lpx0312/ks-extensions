# RAG Assistant Helm Chart

KubeSphere RAG 智能助手扩展的 Helm Chart。

## 简介

此 Helm Chart 用于在 Kubernetes 集群中部署 KubeSphere RAG 智能助手的后端服务，包括：

- RAG 后端 API 服务
- Milvus 向量数据库
- etcd（Milvus 依赖）
- MinIO（Milvus 依赖）
- Ingress 配置

## 前提条件

- Kubernetes 1.19+
- Helm 3.0+
- PersistentVolume 支持（如果启用持久化存储）
- KubeSphere 3.3.0+（用于前端扩展）

## 安装

### 添加 Helm 仓库（如果发布到仓库）

```bash
helm repo add kubesphere https://charts.kubesphere.io
helm repo update
```

### 安装 Chart

```bash
# 基本安装
helm install rag-assistant kubesphere/rag-assistant \
  --namespace kubesphere-system \
  --create-namespace

# 自定义配置
helm install rag-assistant kubesphere/rag-assistant \
  --namespace kubesphere-system \
  --create-namespace \
  --set backend.secrets.llmApiKey="YOUR_API_KEY" \
  --set backend.secrets.llmApiUrl="YOUR_API_URL"
```

### 从本地安装

```bash
cd charts/rag-assistant

# 安装
helm install rag-assistant . \
  --namespace kubesphere-system \
  --create-namespace \
  --values values.yaml \
  --set backend.secrets.llmApiKey="YOUR_API_KEY" \
  --set backend.secrets.llmApiUrl="YOUR_API_URL"
```

## 配置

### 主要配置项

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `backend.enabled` | 是否启用后端服务 | `true` |
| `backend.replicaCount` | 后端副本数 | `1` |
| `backend.image.repository` | 后端镜像仓库 | `kubesphere/rag-backend` |
| `backend.image.tag` | 后端镜像标签 | `1.0.0` |
| `backend.service.port` | 后端服务端口 | `8000` |
| `backend.resources.limits.cpu` | CPU 限制 | `1000m` |
| `backend.resources.limits.memory` | 内存限制 | `1Gi` |
| `backend.secrets.llmApiKey` | LLM API 密钥 | `""` |
| `backend.secrets.llmApiUrl` | LLM API 地址 | `""` |
| `backend.persistence.data.enabled` | 是否启用数据持久化 | `true` |
| `backend.persistence.data.size` | 数据存储大小 | `5Gi` |
| `milvus.enabled` | 是否启用 Milvus | `true` |
| `milvus.persistence.enabled` | 是否启用 Milvus 持久化 | `true` |
| `milvus.persistence.dataSize` | Milvus 数据存储大小 | `10Gi` |
| `ingress.enabled` | 是否启用 Ingress | `true` |
| `ingress.className` | Ingress 类名 | `nginx` |
| `ingress.path` | Ingress 路径 | `/api/rag-assistant(/\|$)(.*)` |

### 自定义 values.yaml

创建自定义的 values 文件：

```yaml
# custom-values.yaml
backend:
  replicaCount: 2
  
  image:
    repository: your-registry/rag-backend
    tag: "latest"
  
  secrets:
    llmApiKey: "your-api-key"
    llmApiUrl: "https://api.example.com/v1"
  
  resources:
    limits:
      cpu: 2000m
      memory: 2Gi
    requests:
      cpu: 1000m
      memory: 1Gi
  
  persistence:
    data:
      size: 10Gi
    logs:
      size: 5Gi

milvus:
  persistence:
    dataSize: 20Gi
```

使用自定义配置安装：

```bash
helm install rag-assistant . \
  --namespace kubesphere-system \
  --values custom-values.yaml
```

## 升级

```bash
# 升级到新版本
helm upgrade rag-assistant kubesphere/rag-assistant \
  --namespace kubesphere-system \
  --values custom-values.yaml

# 从本地升级
helm upgrade rag-assistant . \
  --namespace kubesphere-system \
  --values custom-values.yaml
```

## 卸载

```bash
# 卸载 release
helm uninstall rag-assistant --namespace kubesphere-system

# 删除 PVC（如果需要）
kubectl delete pvc -n kubesphere-system -l app.kubernetes.io/instance=rag-assistant
```

## 验证部署

```bash
# 检查 Pod 状态
kubectl get pods -n kubesphere-system -l app.kubernetes.io/name=rag-assistant

# 检查服务
kubectl get svc -n kubesphere-system -l app.kubernetes.io/name=rag-assistant

# 检查 Ingress
kubectl get ingress -n kubesphere-system -l app.kubernetes.io/name=rag-assistant

# 查看日志
kubectl logs -n kubesphere-system -l component=backend
```

## 故障排除

### Pod 启动失败

```bash
# 查看 Pod 详情
kubectl describe pod -n kubesphere-system -l component=backend

# 查看日志
kubectl logs -n kubesphere-system -l component=backend
```

### API 密钥配置问题

```bash
# 检查 Secret
kubectl get secret -n kubesphere-system rag-assistant-secrets -o yaml

# 更新 Secret
kubectl create secret generic rag-assistant-secrets \
  --from-literal=llm-api-key=NEW_KEY \
  --from-literal=llm-api-url=NEW_URL \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 持久化存储问题

```bash
# 检查 PVC 状态
kubectl get pvc -n kubesphere-system

# 检查 PV
kubectl get pv
```

## 开发

### 模板测试

```bash
# 渲染模板但不安装
helm template rag-assistant . \
  --namespace kubesphere-system \
  --values values.yaml

# 验证模板
helm lint .
```

### 打包 Chart

```bash
# 打包
helm package .

# 生成索引
helm repo index .
```

## 支持

如有问题，请访问：
- [GitHub Issues](https://github.com/kubesphere/rag-extension/issues)
- [KubeSphere Slack](https://kubesphere.slack.com)
