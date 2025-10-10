import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Icon, Loading, Notify } from '@kubesphere/components';
import SessionSidebar from './SessionSidebar';
import ChatMessage from './ChatMessage';
import { getConversation, createConversation } from '../services/api';

const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 处理发送消息
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // 调用API发送消息
      const response = await createConversation({
        question: input,
        session_id: sessionId,
      });
      
      // 更新会话ID
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }
      
      // 添加AI回复
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.error('发送消息失败:', error);
      Notify.error({ content: '发送消息失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };
  
  // 加载特定会话
  const loadSession = async (id) => {
    setLoading(true);
    try {
      const session = await getConversation(id);
      setSessionId(id);
      setMessages(session.messages || []);
      setShowSidebar(false);
    } catch (error) {
      console.error('加载会话失败:', error);
      Notify.error({ content: '加载会话失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新会话
  const createNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setShowSidebar(false);
  };
  
  // 切换聊天面板显示状态
  const toggleChatPanel = () => {
    setIsOpen(!isOpen);
  };
  
  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="rag-assistant-container">
      {/* 悬浮按钮 */}
      <Button 
        className="rag-assistant-fab"
        icon="robot"
        type="control"
        onClick={toggleChatPanel}
      />
      
      {/* 聊天面板 */}
      {isOpen && (
        <div className="rag-assistant-panel">
          {/* 面板头部 */}
          <div className="rag-assistant-header">
            <div className="rag-assistant-title">
              <Icon name="robot" size={20} />
              <span>RAG 智能助手</span>
            </div>
            <div className="rag-assistant-actions">
              <Button 
                icon="history" 
                type="flat" 
                onClick={toggleSidebar} 
              />
              <Button 
                icon="close" 
                type="flat" 
                onClick={toggleChatPanel} 
              />
            </div>
          </div>
          
          {/* 面板内容 */}
          <div className="rag-assistant-content">
            {/* 会话侧边栏 */}
            {showSidebar && (
              <SessionSidebar 
                activeSessionId={sessionId}
                onSelectSession={loadSession}
                onCreateNewSession={createNewSession}
              />
            )}
            
            {/* 聊天区域 */}
            <div 
              className="rag-assistant-chat-area" 
              ref={chatContainerRef}
            >
              {messages.length === 0 ? (
                <div className="rag-assistant-empty-state">
                  <Icon name="robot" size={48} />
                  <p>您好，我是KubeSphere RAG助手，有什么可以帮您的吗？</p>
                </div>
              ) : (
                <div className="rag-assistant-messages">
                  {messages.map((msg, index) => (
                    <ChatMessage 
                      key={index} 
                      message={msg} 
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              
              {/* 加载状态 */}
              {loading && (
                <div className="rag-assistant-loading">
                  <Loading size="small" />
                  <span>AI助手正在思考...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 输入区域 */}
          <div className="rag-assistant-input-area">
            <Input
              placeholder="输入您的问题..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={handleSendMessage}
              disabled={loading}
            />
            <Button
              icon="send"
              type="control"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
