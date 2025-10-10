import React from 'react';
import { registerExtension } from '@kubesphere/luban';
import ChatPanel from './components/ChatPanel';
import './styles.css';

// 注册RAG助手扩展
registerExtension({
  // 扩展ID
  id: 'rag-assistant',
  
  // 扩展名称
  name: 'RAG 智能助手',
  
  // 扩展描述
  description: '基于RAG技术的KubeSphere智能问答助手',
  
  // 扩展入口组件
  component: () => <ChatPanel />,
  
  // 扩展图标
  icon: 'robot',
  
  // 扩展位置：global表示全局扩展
  position: 'global',
  
  // 初始化函数
  init: (context) => {
    console.log('RAG Assistant Extension initialized', context);
    return Promise.resolve();
  },
  
  // 卸载函数
  uninstall: () => {
    console.log('RAG Assistant Extension uninstalled');
    return Promise.resolve();
  }
});

// 导出扩展
export default {
  id: 'rag-assistant',
  name: 'RAG 智能助手'
};
