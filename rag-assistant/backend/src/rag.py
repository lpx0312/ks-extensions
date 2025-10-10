import os
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, AsyncGenerator
import asyncio
from fastapi import UploadFile, HTTPException
import httpx

from .models import Source, Session, Message, DocumentChunk

class RAGService:
    """RAG服务核心类，处理文档索引、检索和生成"""
    
    def __init__(self):
        self.sessions_dir = os.path.join("data", "sessions")
        self.documents_dir = os.path.join("data", "documents")
        self.milvus_host = os.getenv("MILVUS_HOST", "localhost")
        self.milvus_port = int(os.getenv("MILVUS_PORT", "19530"))
        self.llm_api_key = os.getenv("LLM_API_KEY", "")
        self.llm_api_url = os.getenv("LLM_API_URL", "")
        
        # 确保目录存在
        os.makedirs(self.sessions_dir, exist_ok=True)
        os.makedirs(self.documents_dir, exist_ok=True)
    
    async def initialize(self):
        """初始化服务，连接Milvus等"""
        try:
            # 这里可以添加Milvus连接初始化等逻辑
            print("RAG服务初始化成功")
        except Exception as e:
            print(f"RAG服务初始化失败: {str(e)}")
            raise
    
    async def cleanup(self):
        """清理资源"""
        # 这里可以添加资源清理逻辑
        pass
    
    async def process_document(self, file: UploadFile) -> Dict[str, Any]:
        """处理上传的文档，分块并存入向量库"""
        try:
            # 生成唯一文档ID
            document_id = str(uuid.uuid4())
            
            # 保存文件
            file_path = os.path.join(self.documents_dir, f"{document_id}_{file.filename}")
            content = await file.read()
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            # 模拟文档处理和向量化
            # 实际项目中这里应该有文档解析、分块、向量化等逻辑
            
            return {
                "document_id": document_id,
                "file_name": file.filename,
                "file_path": file_path,
                "chunk_count": 10  # 模拟分块数量
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"文档处理失败: {str(e)}")
    
    async def query(self, question: str, top_k: int = 3, method: str = "hybrid") -> Dict[str, Any]:
        """执行一次性查询"""
        try:
            # 模拟检索过程
            sources = [
                Source(
                    document_id=f"doc_{i}",
                    file_path=f"sample_doc_{i}.pdf",
                    title=f"示例文档 {i}",
                    text=f"这是示例文档 {i} 的内容片段，与问题 '{question}' 相关。",
                    score=0.9 - (i * 0.1)
                )
                for i in range(min(top_k, 3))
            ]
            
            # 模拟生成答案
            answer = f"这是针对问题 '{question}' 的模拟回答。在实际部署中，这里将调用LLM API生成回答。"
            
            return {
                "answer": answer,
                "sources": sources,
                "metadata": {
                    "retrieval_method": method,
                    "top_k": top_k,
                    "query_time_ms": 150  # 模拟查询时间
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")
    
    async def conversation(self, question: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """处理对话请求"""
        try:
            # 如果没有提供session_id，创建新会话
            if not session_id:
                session_id = str(uuid.uuid4())
                session = Session(
                    id=session_id,
                    title=question[:30] + ("..." if len(question) > 30 else "")
                )
            else:
                # 获取现有会话
                session = await self.get_session(session_id)
                if not session:
                    # 如果会话不存在，创建新会话
                    session = Session(
                        id=session_id,
                        title=question[:30] + ("..." if len(question) > 30 else "")
                    )
            
            # 添加用户消息
            user_message = Message(
                role="user",
                content=question,
                timestamp=datetime.now()
            )
            session.messages.append(user_message)
            
            # 模拟检索和生成过程
            sources = [
                Source(
                    document_id=f"doc_{i}",
                    file_path=f"sample_doc_{i}.pdf",
                    title=f"示例文档 {i}",
                    text=f"这是示例文档 {i} 的内容片段，与问题 '{question}' 相关。",
                    score=0.9 - (i * 0.1)
                )
                for i in range(2)
            ]
            
            # 模拟生成答案
            answer = f"这是针对问题 '{question}' 的模拟回答。在实际部署中，这里将调用LLM API生成回答。"
            
            # 添加助手消息
            assistant_message = Message(
                role="assistant",
                content=answer,
                sources=sources,
                timestamp=datetime.now()
            )
            session.messages.append(assistant_message)
            
            # 更新会话时间
            session.updated_at = datetime.now()
            
            # 保存会话
            await self._save_session(session)
            
            return {
                "answer": answer,
                "session_id": session_id,
                "sources": sources,
                "metadata": {
                    "query_time_ms": 200  # 模拟查询时间
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"对话处理失败: {str(e)}")
    
    async def conversation_stream(self, question: str, session_id: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """处理流式对话请求"""
        try:
            # 如果没有提供session_id，创建新会话
            if not session_id:
                session_id = str(uuid.uuid4())
                session = Session(
                    id=session_id,
                    title=question[:30] + ("..." if len(question) > 30 else "")
                )
            else:
                # 获取现有会话
                session = await self.get_session(session_id)
                if not session:
                    # 如果会话不存在，创建新会话
                    session = Session(
                        id=session_id,
                        title=question[:30] + ("..." if len(question) > 30 else "")
                    )
            
            # 添加用户消息
            user_message = Message(
                role="user",
                content=question,
                timestamp=datetime.now()
            )
            session.messages.append(user_message)
            
            # 模拟检索过程
            sources = [
                Source(
                    document_id=f"doc_{i}",
                    file_path=f"sample_doc_{i}.pdf",
                    title=f"示例文档 {i}",
                    text=f"这是示例文档 {i} 的内容片段，与问题 '{question}' 相关。",
                    score=0.9 - (i * 0.1)
                )
                for i in range(2)
            ]
            
            # 发送元数据事件
            yield {
                "type": "metadata",
                "session_id": session_id,
                "sources": [source.dict() for source in sources]
            }
            
            # 模拟流式生成
            answer_parts = [
                "这是",
                "针对问题",
                f" '{question}' ",
                "的模拟",
                "流式回答。",
                "在实际部署中，",
                "这里将调用",
                "LLM API",
                "进行流式生成。"
            ]
            
            full_answer = ""
            for part in answer_parts:
                full_answer += part
                yield {
                    "type": "content",
                    "content": part
                }
                await asyncio.sleep(0.2)  # 模拟生成延迟
            
            # 添加助手消息
            assistant_message = Message(
                role="assistant",
                content=full_answer,
                sources=sources,
                timestamp=datetime.now()
            )
            session.messages.append(assistant_message)
            
            # 更新会话时间
            session.updated_at = datetime.now()
            
            # 保存会话
            await self._save_session(session)
            
            # 发送完成事件
            yield {
                "type": "end",
                "session_id": session_id
            }
        except Exception as e:
            yield {
                "type": "error",
                "error": str(e)
            }
    
    async def get_sessions(self) -> List[Dict[str, Any]]:
        """获取所有会话摘要"""
        try:
            sessions = []
            for filename in os.listdir(self.sessions_dir):
                if filename.endswith('.json'):
                    with open(os.path.join(self.sessions_dir, filename), 'r', encoding='utf-8') as f:
                        session_data = json.load(f)
                        sessions.append({
                            "id": session_data.get("id"),
                            "title": session_data.get("title"),
                            "created_at": session_data.get("created_at"),
                            "updated_at": session_data.get("updated_at"),
                            "message_count": len(session_data.get("messages", []))
                        })
            
            # 按更新时间排序
            sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
            return sessions
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"获取会话列表失败: {str(e)}")
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """获取特定会话详情"""
        try:
            session_path = os.path.join(self.sessions_dir, f"{session_id}.json")
            if not os.path.exists(session_path):
                return None
            
            with open(session_path, 'r', encoding='utf-8') as f:
                session_data = json.load(f)
                
            # 转换为Session对象
            session = Session(**session_data)
            return session
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"获取会话详情失败: {str(e)}")
    
    async def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        try:
            session_path = os.path.join(self.sessions_dir, f"{session_id}.json")
            if not os.path.exists(session_path):
                return False
            
            os.remove(session_path)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"删除会话失败: {str(e)}")
    
    async def _save_session(self, session: Session):
        """保存会话到文件"""
        try:
            session_path = os.path.join(self.sessions_dir, f"{session.id}.json")
            with open(session_path, 'w', encoding='utf-8') as f:
                # 将Session对象转换为dict并保存
                json.dump(session.dict(), f, ensure_ascii=False, default=str)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"保存会话失败: {str(e)}")
