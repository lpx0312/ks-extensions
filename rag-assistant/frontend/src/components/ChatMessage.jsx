import React from 'react';
import { Icon, Tooltip } from '@kubesphere/components';

const ChatMessage = ({ message }) => {
  const { role, content, sources = [], timestamp } = message;
  const isUser = role === 'user';
  
  // 格式化时间戳
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`rag-assistant-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {/* 头像 */}
      <div className="rag-assistant-avatar">
        <Icon name={isUser ? 'human' : 'robot'} size={24} />
      </div>
      
      {/* 消息内容 */}
      <div className="rag-assistant-message-content">
        {/* 角色名称和时间 */}
        <div className="rag-assistant-message-header">
          <span className="rag-assistant-message-sender">
            {isUser ? '您' : 'RAG助手'}
          </span>
          <span className="rag-assistant-message-time">
            {formatTime(timestamp)}
          </span>
        </div>
        
        {/* 文本内容 */}
        <div className="rag-assistant-message-text">
          {content}
        </div>
        
        {/* 引用来源 */}
        {!isUser && sources && sources.length > 0 && (
          <div className="rag-assistant-message-sources">
            <div className="rag-assistant-sources-header">
              <Icon name="documentation" size={14} />
              <span>参考来源:</span>
            </div>
            <ul className="rag-assistant-sources-list">
              {sources.map((source, index) => (
                <li key={index} className="rag-assistant-source-item">
                  <Tooltip content={source.title || source.file_path}>
                    <span className="rag-assistant-source-title">
                      {(source.title || source.file_path || '未知来源').substring(0, 50)}
                      {(source.title || source.file_path || '').length > 50 ? '...' : ''}
                    </span>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
