/**
 * @fileoverview useChat Hook - AI 聊天功能的核心实现
 * 
 * 这个文件实现了一个强大的 React Hook,用于构建 AI 聊天界面。它处理了与 AI 模型对话所需的所有复杂性:
 * 
 * 1. 消息管理
 *    - 存储对话历史
 *    - 追加新消息
 *    - 处理消息状态(加载中、流式传输中等)
 * 
 * 2. 网络通信
 *    - 处理与 AI API 的通信
 *    - 支持流式响应
 *    - 错误处理
 * 
 * 3. UI 状态管理
 *    - 输入框控制
 *    - 加载状态
 *    - 错误状态
 * 
 * 4. 高级功能
 *    - 工具调用支持
 *    - 消息重新生成
 *    - 自定义请求处理
 * 
 * 主要组件:
 * - UseChatHelpers: 定义了 hook 返回的所有功能
 * - useChat: 主要的 hook 实现
 */

import type {
  ChatRequest,
  ChatRequestOptions,
  CreateMessage,
  JSONValue,
  Message,
  UIMessage,
  UseChatOptions,
} from '@ai-sdk/ui-utils';
import {
  callChatApi,
  extractMaxToolInvocationStep,
  fillMessageParts,
  generateId as generateIdFunc,
  getMessageParts,
  isAssistantMessageWithCompletedToolCalls,
  prepareAttachmentsForRequest,
  shouldResubmitMessages,
  updateToolCallResult,
} from '@ai-sdk/ui-utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { throttle } from './throttle';
import { useStableValue } from './util/use-stable-value';

export type { CreateMessage, Message, UseChatOptions };

/**
 * UseChatHelpers 接口定义了 useChat hook 返回的所有功能
 * 这些功能让开发者能够完全控制聊天界面的行为
 */
export type UseChatHelpers = {
  /** 当前聊天中的所有消息 */
  messages: UIMessage[];
  
  /** API 请求的错误对象(如果有的话) */
  error: undefined | Error;
  
  /**
   * 向聊天列表添加用户消息
   * 这会触发 API 调用来获取 AI 助手的响应
   * 
   * @param message - 要添加的消息
   * @param options - 传递给 API 的额外选项
   * @returns 返回生成的消息ID或null
   */
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;

  /**
   * 重新加载最后一条 AI 响应
   * 如果最后一条消息不是来自 AI,会请求 API 生成新的响应
   */
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;

  /** 立即中止当前请求,保留已生成的内容 */
  stop: () => void;

  /**
   * 本地更新 messages 状态
   * 用于在客户端编辑消息,然后手动触发 reload 重新生成 AI 响应
   */
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;

  /** 输入框的当前值 */
  input: string;
  
  /** 用于更新输入值的 setState 方法 */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  
  /** 适用于 input/textarea 的 onChange 处理函数 */
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;

  /** 
   * 表单提交处理函数
   * 自动重置输入并追加用户消息 
   */
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;

  /** 可选的元数据对象 */
  metadata?: Object;

  /** 
   * API 请求是否正在进行中
   * @deprecated 请使用 status 代替
   */
  isLoading: boolean;

  /**
   * Hook 状态:
   * - submitted: 消息已发送到 API,等待响应流开始
   * - streaming: 正在从 API 接收流式响应数据
   * - ready: 完整响应已接收并处理完成,可以提交新消息
   * - error: API 请求过程中发生错误
   */
  status: 'submitted' | 'streaming' | 'ready' | 'error';

  /** 服务器通过 StreamData 添加的额外数据 */
  data?: JSONValue[];

  /** 
   * 设置聊天数据
   * 可用于转换或清除聊天数据
   */
  setData: (
    data:
      | JSONValue[]
      | undefined
      | ((data: JSONValue[] | undefined) => JSONValue[] | undefined),
  ) => void;

  /** 聊天会话的唯一标识符 */
  id: string;
};

/**
 * useChat - AI 聊天功能的核心 Hook
 * 
 * @param options - Hook 配置选项
 * @param options.api - API 端点,默认为 '/api/chat'
 * @param options.id - 可选的聊天 ID
 * @param options.initialMessages - 初始消息列表
 * @param options.initialInput - 输入框的初始值
 * @param options.sendExtraMessageFields - 是否发送消息的额外字段
 * @param options.onToolCall - 工具调用的处理函数
 * @param options.experimental_prepareRequestBody - 自定义请求体处理函数
 * @param options.maxSteps - 最大连续 LLM 调用次数,默认为 1
 * @param options.streamProtocol - 流协议类型,默认为 'data'
 * @param options.onResponse - 响应处理回调
 * @param options.onFinish - 完成处理回调
 * @param options.onError - 错误处理回调
 * @param options.credentials - 认证信息
 * @param options.headers - 请求头
 * @param options.body - 请求体
 * @param options.generateId - ID 生成函数
 * @param options.fetch - 自定义 fetch 函数
 * @param options.keepLastMessageOnError - 发生错误时是否保留最后一条消息
 * @param options.experimental_throttle - 消息更新节流等待时间(ms)
 * 
 * @returns UseChatHelpers 对象,包含控制聊天的所有方法
 */
export function useChat({
  api = '/api/chat',
  id,
  initialMessages,
  initialInput = '',
  sendExtraMessageFields,
  onToolCall,
  experimental_prepareRequestBody,
  maxSteps = 1,
  streamProtocol = 'data',
  onResponse,
  onFinish,
  onError,
  credentials,
  headers,
  body,
  generateId = generateIdFunc,
  fetch,
  keepLastMessageOnError = true,
  experimental_throttle: throttleWaitMs,
}: UseChatOptions & {
  key?: string;

  /**
   * Experimental (React only). When a function is provided, it will be used
   * to prepare the request body for the chat API. This can be useful for
   * customizing the request body based on the messages and data in the chat.
   *
   * @param messages The current messages in the chat.
   * @param requestData The data object passed in the chat request.
   * @param requestBody The request body object passed in the chat request.
   */
  experimental_prepareRequestBody?: (options: {
    id: string;
    messages: UIMessage[];
    requestData?: JSONValue;
    requestBody?: object;
  }) => unknown;

  /**
Custom throttle wait in ms for the chat messages and data updates.
Default is undefined, which disables throttling.
   */
  experimental_throttle?: number;

  /**
Maximum number of sequential LLM calls (steps), e.g. when you use tool calls.
Must be at least 1.

A maximum number is required to prevent infinite loops in the case of misconfigured tools.

By default, it's set to 1, which means that only a single LLM call is made.
 */
  maxSteps?: number;
} = {}): UseChatHelpers & {
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: any;
  }) => void;
} {
  // Generate ID once, store in state for stability across re-renders
  const [hookId] = useState(generateId);

  // Use the caller-supplied ID if available; otherwise, fall back to our stable ID
  const chatId = id ?? hookId;
  const chatKey = typeof api === 'string' ? [api, chatId] : chatId;

  // Store array of the processed initial messages to avoid re-renders:
  const stableInitialMessages = useStableValue(initialMessages ?? []);
  const processedInitialMessages = useMemo(
    () => fillMessageParts(stableInitialMessages),
    [stableInitialMessages],
  );

  // Store the chat state in SWR, using the chatId as the key to share states.
  const { data: messages, mutate } = useSWR<UIMessage[]>(
    [chatKey, 'messages'],
    null,
    { fallbackData: processedInitialMessages },
  );

  // Keep the latest messages in a ref.
  const messagesRef = useRef<UIMessage[]>(messages || []);
  useEffect(() => {
    messagesRef.current = messages || [];
  }, [messages]);

  // stream data
  const { data: streamData, mutate: mutateStreamData } = useSWR<
    JSONValue[] | undefined
  >([chatKey, 'streamData'], null);

  // keep the latest stream data in a ref
  const streamDataRef = useRef<JSONValue[] | undefined>(streamData);
  useEffect(() => {
    streamDataRef.current = streamData;
  }, [streamData]);

  const { data: status = 'ready', mutate: mutateStatus } = useSWR<
    'submitted' | 'streaming' | 'ready' | 'error'
  >([chatKey, 'status'], null);

  const { data: error = undefined, mutate: setError } = useSWR<
    undefined | Error
  >([chatKey, 'error'], null);

  // Abort controller to cancel the current API call.
  const abortControllerRef = useRef<AbortController | null>(null);

  const extraMetadataRef = useRef({
    credentials,
    headers,
    body,
  });

  useEffect(() => {
    extraMetadataRef.current = {
      credentials,
      headers,
      body,
    };
  }, [credentials, headers, body]);

  /**
   * 聊天核心逻辑实现
   * 这个函数处理与AI的实际对话过程
   */
  const triggerRequest = useCallback(
    async (chatRequest: ChatRequest) => {
      // 设置状态为已提交并清除错误
      mutateStatus('submitted');
      setError(undefined);

      // 确保所有消息都有正确的parts字段
      const chatMessages = fillMessageParts(chatRequest.messages);

      // 获取当前消息数量和最大工具调用步骤数
      const messageCount = chatMessages.length;
      const maxStep = extractMaxToolInvocationStep(
        chatMessages[chatMessages.length - 1]?.toolInvocations,
      );

      try {
        // 创建新的中止控制器用于取消请求
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // 创建节流版本的状态更新函数
        const throttledMutate = throttle(mutate, throttleWaitMs);
        const throttledMutateStreamData = throttle(
          mutateStreamData,
          throttleWaitMs,
        );

        // 乐观更新：立即显示更新后的消息
        const previousMessages = messagesRef.current;
        throttledMutate(chatMessages, false);

        // 根据配置准备消息载荷
        // 如果sendExtraMessageFields为false，只保留基本字段
        const constructedMessagesPayload = sendExtraMessageFields
          ? chatMessages
          : chatMessages.map(
              ({
                role,
                content,
                experimental_attachments,
                data,
                annotations,
                toolInvocations,
                parts,
              }) => ({
                role,
                content,
                ...(experimental_attachments !== undefined && {
                  experimental_attachments,
                }),
                ...(data !== undefined && { data }),
                ...(annotations !== undefined && { annotations }),
                ...(toolInvocations !== undefined && { toolInvocations }),
                ...(parts !== undefined && { parts }),
              }),
            );

        const existingData = streamDataRef.current;

        // 调用聊天API
        await callChatApi({
          api,
          // 准备请求体：允许自定义或使用默认结构
          body: experimental_prepareRequestBody?.({
            id: chatId,
            messages: chatMessages,
            requestData: chatRequest.data,
            requestBody: chatRequest.body,
          }) ?? {
            id: chatId,
            messages: constructedMessagesPayload,
            data: chatRequest.data,
            ...extraMetadataRef.current.body,
            ...chatRequest.body,
          },
          streamProtocol,
          credentials: extraMetadataRef.current.credentials,
          headers: {
            ...extraMetadataRef.current.headers,
            ...chatRequest.headers,
          },
          // 提供中止控制器访问
          abortController: () => abortControllerRef.current,
          // 失败时恢复消息
          restoreMessagesOnFailure() {
            if (!keepLastMessageOnError) {
              throttledMutate(previousMessages, false);
            }
          },
          onResponse,
          // 处理流式更新
          onUpdate({ message, data, replaceLastMessage }) {
            // 设置状态为正在流式传输
            mutateStatus('streaming');

            // 更新消息列表
            throttledMutate(
              [
                ...(replaceLastMessage
                  ? chatMessages.slice(0, chatMessages.length - 1)
                  : chatMessages),
                message,
              ],
              false,
            );

            // 更新流数据
            if (data?.length) {
              throttledMutateStreamData(
                [...(existingData ?? []), ...data],
                false,
              );
            }
          },
          onToolCall,
          onFinish,
          generateId,
          fetch,
          lastMessage: chatMessages[chatMessages.length - 1],
        });

        abortControllerRef.current = null;

        // 设置状态为准备好
        mutateStatus('ready');
      } catch (err) {
        // 忽略中止错误，因为它们是预期的
        if ((err as any).name === 'AbortError') {
          abortControllerRef.current = null;
          mutateStatus('ready');
          return null;
        }

        if (onError && err instanceof Error) {
          onError(err);
        }

        setError(err as Error);
        mutateStatus('error');
      }

      // 当最后一条助手消息中的所有工具调用都有结果时自动提交
      // 并且助手尚未回答
      const messages = messagesRef.current;
      if (
        shouldResubmitMessages({
          originalMaxToolInvocationStep: maxStep,
          originalMessageCount: messageCount,
          maxSteps,
          messages,
        })
      ) {
        await triggerRequest({ messages });
      }
    },
    [
      mutate,
      mutateStatus,
      api,
      extraMetadataRef,
      onResponse,
      onFinish,
      onError,
      setError,
      mutateStreamData,
      streamDataRef,
      streamProtocol,
      sendExtraMessageFields,
      experimental_prepareRequestBody,
      onToolCall,
      maxSteps,
      messagesRef,
      abortControllerRef,
      generateId,
      fetch,
      keepLastMessageOnError,
      throttleWaitMs,
      chatId,
    ],
  );

  /**
   * 添加新消息到聊天
   * 处理附件和消息格式化，然后触发API请求
   */
  const append = useCallback(
    async (
      message: Message | CreateMessage,
      {
        data,
        headers,
        body,
        experimental_attachments,
      }: ChatRequestOptions = {},
    ) => {
      // 处理附件，确保它们准备好被发送
      const attachmentsForRequest = await prepareAttachmentsForRequest(
        experimental_attachments,
      );

      // 构建新消息对象，包含所有必要的字段
      const messages = messagesRef.current.concat({
        ...message,
        id: message.id ?? generateId(),
        createdAt: message.createdAt ?? new Date(),
        experimental_attachments:
          attachmentsForRequest.length > 0 ? attachmentsForRequest : undefined,
        parts: getMessageParts(message),
      });

      // 触发API请求
      return triggerRequest({ messages, headers, body, data });
    },
    [triggerRequest, generateId],
  );

  /**
   * 重新加载最后的对话
   * 可用于重试失败的请求或重新生成AI响应
   */
  const reload = useCallback(
    async ({ data, headers, body }: ChatRequestOptions = {}) => {
      const messages = messagesRef.current;

      if (messages.length === 0) {
        return null;
      }

      // 如果最后一条是AI的消息，则移除它并重试用户的最后一条消息
      const lastMessage = messages[messages.length - 1];
      return triggerRequest({
        messages:
          lastMessage.role === 'assistant' ? messages.slice(0, -1) : messages,
        headers,
        body,
        data,
      });
    },
    [triggerRequest],
  );

  /**
   * 停止当前正在进行的API请求
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * 更新消息列表
   * 支持直接设置消息数组或通过函数更新
   */
  const setMessages = useCallback(
    (messages: Message[] | ((messages: Message[]) => Message[])) => {
      if (typeof messages === 'function') {
        messages = messages(messagesRef.current);
      }

      const messagesWithParts = fillMessageParts(messages);
      mutate(messagesWithParts, false);
      messagesRef.current = messagesWithParts;
    },
    [mutate],
  );

  /**
   * 更新流数据
   * 支持直接设置数据或通过函数更新
   */
  const setData = useCallback(
    (
      data:
        | JSONValue[]
        | undefined
        | ((data: JSONValue[] | undefined) => JSONValue[] | undefined),
    ) => {
      if (typeof data === 'function') {
        data = data(streamDataRef.current);
      }

      mutateStreamData(data, false);
      streamDataRef.current = data;
    },
    [mutateStreamData],
  );

  // 输入状态管理
  const [input, setInput] = useState(initialInput);

  /**
   * 处理表单提交
   * 包括发送消息和处理元数据
   */
  const handleSubmit = useCallback(
    async (
      event?: { preventDefault?: () => void },
      options: ChatRequestOptions = {},
      metadata?: Object,
    ) => {
      event?.preventDefault?.();

      // 如果输入为空且不允许空提交，则直接返回
      if (!input && !options.allowEmptySubmit) return;

      // 更新元数据
      if (metadata) {
        extraMetadataRef.current = {
          ...extraMetadataRef.current,
          ...metadata,
        };
      }

      const attachmentsForRequest = await prepareAttachmentsForRequest(
        options.experimental_attachments,
      );

      const messages = messagesRef.current.concat({
        id: generateId(),
        createdAt: new Date(),
        role: 'user',
        content: input,
        experimental_attachments:
          attachmentsForRequest.length > 0 ? attachmentsForRequest : undefined,
        parts: [{ type: 'text', text: input }],
      });

      const chatRequest: ChatRequest = {
        messages,
        headers: options.headers,
        body: options.body,
        data: options.data,
      };

      triggerRequest(chatRequest);

      setInput('');
    },
    [input, generateId, triggerRequest],
  );

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  /**
   * 处理工具调用结果
   * 当AI调用了工具并获得结果时使用此函数更新状态
   */
  const addToolResult = useCallback(
    ({ toolCallId, result }: { toolCallId: string; result: unknown }) => {
      const currentMessages = messagesRef.current;

      // 将工具调用结果更新到消息中
      updateToolCallResult({
        messages: currentMessages,
        toolCallId,
        toolResult: result,
      });

      // 通过数组变更触发重新渲染
      mutate(
        [
          ...currentMessages.slice(0, currentMessages.length - 1),
          { ...currentMessages[currentMessages.length - 1] },
        ],
        false,
      );

      // 如果请求正在进行中，自动提交将在请求完成后触发
      if (status === 'submitted' || status === 'streaming') {
        return;
      }

      // 当最后一条助手消息中的所有工具调用都有结果时自动提交
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (isAssistantMessageWithCompletedToolCalls(lastMessage)) {
        triggerRequest({ messages: currentMessages });
      }
    },
    [mutate, status, triggerRequest],
  );

  /**
   * 返回 useChat hook 的所有功能
   * 
   * @returns {Object} 包含以下功能:
   * - messages: 当前的消息列表
   * - id: 聊天会话ID
   * - setMessages: 更新消息列表的函数
   * - data: 流数据
   * - setData: 更新流数据的函数
   * - error: 错误对象(如果有)
   * - append: 添加新消息的函数
   * - reload: 重新加载对话的函数
   * - stop: 停止当前请求的函数
   * - input: 输入框的当前值
   * - setInput: 更新输入值的函数
   * - handleInputChange: 处理输入变化的函数
   * - handleSubmit: 处理表单提交的函数
   * - isLoading: 是否正在加载
   * - status: 当前状态
   * - addToolResult: 添加工具调用结果的函数
   */
  return {
    messages: messages ?? [],
    id: chatId,
    setMessages,
    data: streamData,
    setData,
    error,
    append,
    reload,
    stop,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: status === 'submitted' || status === 'streaming',
    status,
    addToolResult,
  };
}
