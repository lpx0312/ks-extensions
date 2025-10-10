from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import uuid
import json
from datetime import datetime
import asyncio

# 导入自定义模块
from .rag import RAGService
from .models import (
    QueryRequest, 
    QueryResponse, 
    ConversationRequest, 
    ConversationResponse,
    Session,
    Message
)

# 创建FastAPI应用
app = FastAPI(
    title="KubeSphere RAG API",
    description="KubeSphere RAG智能问答系统API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化RAG服务
rag_service = RAGService()

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 上传文档
@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        result = await rag_service.process_document(file)
        return {
            "status": "success",
            "message": f"文档 '{file.filename}' 上传成功",
            "document_id": result.get("document_id"),
            "chunks": result.get("chunk_count", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 一次性查询
@app.post("/query")
async def query(request: QueryRequest):
    try:
        result = await rag_service.query(
            question=request.question,
            top_k=request.top_k,
            method=request.method
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 对话
@app.post("/conversation")
async def conversation(request: ConversationRequest):
    try:
        result = await rag_service.conversation(
            question=request.question,
            session_id=request.session_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 流式对话
@app.post("/conversation/stream")
async def conversation_stream(request: ConversationRequest):
    async def event_generator():
        try:
            async for event in rag_service.conversation_stream(
                question=request.question,
                session_id=request.session_id
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

# 获取会话列表
@app.get("/sessions")
async def get_sessions():
    try:
        sessions = await rag_service.get_sessions()
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 获取特定会话
@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    try:
        session = await rag_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"会话 {session_id} 不存在")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 删除会话
@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        success = await rag_service.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"会话 {session_id} 不存在")
        return {"status": "success", "message": f"会话 {session_id} 已删除"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 启动时的初始化
@app.on_event("startup")
async def startup_event():
    await rag_service.initialize()

# 关闭时的清理
@app.on_event("shutdown")
async def shutdown_event():
    await rag_service.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
