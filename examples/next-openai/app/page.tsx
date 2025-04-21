/**
 * 聊天页面组件
 * --------------------------------------
 * 这个文件是Next.js应用的主页面组件，实现了一个简单但功能完整的AI聊天界面。
 * 
 * 整体功能：创建一个聊天界面，用户可以输入消息并获得AI的回复。界面包括：
 * 1. 消息历史区域 - 显示用户和AI之间的所有对话
 * 2. 输入框 - 让用户输入新消息
 * 3. 状态显示 - 显示加载状态、错误信息等
 * 4. 控制按钮 - 停止生成、重试等功能
 */

// 'use client' 指令告诉Next.js这是一个客户端组件
// 这意味着这个组件会在浏览器中渲染，而不是在服务器上
'use client';

// 从AI SDK的React包中导入useChat钩子
// 这个钩子提供了所有与AI聊天相关的功能和状态管理
import { useChat } from '@ai-sdk/react';

/**
 * Chat组件 - 聊天界面的主要组件
 * 
 * 这个组件就像是一个完整的聊天应用的"大脑"，它：
 * 1. 管理聊天状态（消息、输入框内容、加载状态等）
 * 2. 处理用户交互（发送消息、停止生成等）
 * 3. 渲染整个聊天界面
 * 
 * @returns 返回渲染好的聊天界面React组件
 */
export default function Chat() {
  // useChat钩子提供了所有我们需要的状态和函数
  // 就像是给了我们一整套聊天功能的"工具箱"
  const {
    error,       // 错误信息：如果API调用出错，这里会有错误对象
    input,       // 输入框内容：用户当前在输入框中输入的文本
    status,      // 当前状态：'ready'(准备好)、'submitted'(已提交)或'streaming'(正在流式返回)
    handleInputChange, // 输入框变化处理函数：当用户在输入框中打字时调用
    handleSubmit,      // 提交处理函数：当用户提交表单（发送消息）时调用
    messages,          // 消息数组：包含所有对话历史
    reload,            // 重新加载函数：重试上一次失败的请求
    stop,              // 停止函数：中断当前正在生成的AI回复
  } = useChat({
    // 当AI完成回复时的回调函数
    // 可以用来记录使用情况、分析AI响应等
    onFinish(message, { usage, finishReason }) {
      console.log('Usage', usage);          // 记录API使用情况（如token数量）
      console.log('FinishReason', finishReason);  // 记录AI停止生成的原因
    },
  });

  // 返回聊天界面的JSX结构
  return (
    // 外层容器：设置了宽度、居中和弹性布局
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* 消息历史区域：将所有消息映射成聊天气泡 */}
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {/* 根据消息角色显示不同的前缀（用户/AI） */}
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {/* 显示消息内容 */}
          {m.content}
        </div>
      ))}

      {/* 状态显示区域：仅在提交或流式传输状态下显示 */}
      {(status === 'submitted' || status === 'streaming') && (
        <div className="mt-4 text-gray-500">
          {/* 加载提示：仅在已提交但还未开始流式返回时显示 */}
          {status === 'submitted' && <div>Loading...</div>}
          {/* 停止按钮：允许用户中断AI的回复生成 */}
          <button
            type="button"
            className="px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded-md"
            onClick={stop}
          >
            Stop
          </button>
        </div>
      )}

      {/* 错误显示区域：仅在发生错误时显示 */}
      {error && (
        <div className="mt-4">
          {/* 错误消息 */}
          <div className="text-red-500">An error occurred.</div>
          {/* 重试按钮：允许用户重新尝试上一次请求 */}
          <button
            type="button"
            className="px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded-md"
            onClick={() => reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* 输入表单：用户输入新消息的区域 */}
      <form onSubmit={handleSubmit}>
        {/* 输入框：固定在底部的聊天输入框 */}
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."  // 占位文本：提示用户输入
          onChange={handleInputChange}    // 当输入改变时更新状态
          disabled={status !== 'ready'}   // 当状态不是"ready"时禁用输入框
        />
      </form>
    </div>
  );
}
