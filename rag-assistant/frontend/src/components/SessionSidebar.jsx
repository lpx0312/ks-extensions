import React, { useState, useEffect } from 'react';
import { Button, Icon, Loading, Empty } from '@kubesphere/components';
import { getSessions } from '../services/api';

const SessionSidebar = ({ activeSessionId, onSelectSession, onCreateNewSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 加载会话列表
  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('加载会话列表失败:', err);
      setError('无法加载会话历史，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 组件挂载时加载会话列表
  useEffect(() => {
    loadSessions();
  }, []);
  
  // 格式化会话时间
  const formatSessionTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // 截断会话标题
  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return '新会话';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };
  
  return (
    <div className="rag-assistant-sidebar">
      <div className="rag-assistant-sidebar-header">
        <h3>会话历史</h3>
        <Button
          icon="refresh"
          type="flat"
          onClick={loadSessions}
          disabled={loading}
        />
      </div>
      
      <div className="rag-assistant-sidebar-content">
        {/* 新建会话按钮 */}
        <Button
          className="rag-assistant-new-session"
          icon="add"
          onClick={onCreateNewSession}
          block
        >
          新建会话
        </Button>
        
        {/* 会话列表 */}
        {loading ? (
          <div className="rag-assistant-loading-container">
            <Loading size="small" />
            <span>加载中...</span>
          </div>
        ) : error ? (
          <div className="rag-assistant-error-container">
            <Icon name="error" size={24} />
            <p>{error}</p>
            <Button onClick={loadSessions}>重试</Button>
          </div>
        ) : sessions.length === 0 ? (
          <Empty description="暂无会话历史" />
        ) : (
          <ul className="rag-assistant-sessions-list">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`rag-assistant-session-item ${
                  session.id === activeSessionId ? 'active' : ''
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="rag-assistant-session-icon">
                  <Icon name="chat" size={16} />
                </div>
                <div className="rag-assistant-session-info">
                  <div className="rag-assistant-session-title">
                    {truncateTitle(session.title)}
                  </div>
                  <div className="rag-assistant-session-time">
                    {formatSessionTime(session.updated_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionSidebar;
