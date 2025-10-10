# 方案：直接使用 llm-milvus-api 完整代码
# 构建时请从 llm-milvus-api 根目录执行：
# docker build -t rag-backend:1.0.0 -f kubesphere-rag-extension/backend/Dockerfile .

FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件（从 llm-milvus-api 根目录）
COPY requirements.txt .
COPY setup.py .

# 复制完整的源代码
COPY src/ ./src/
COPY config/ ./config/

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -e .

# 创建必要的目录
RUN mkdir -p data/sessions data/documents data/sample_docs logs

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# 暴露API端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 启动API服务（使用 llm-milvus-api 的完整 FastAPI 应用）
CMD ["uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000"]