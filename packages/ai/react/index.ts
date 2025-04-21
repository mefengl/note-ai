/**
 * ============================================================================
 * 从 @ai-sdk/react 导入并重新导出 React Hooks 和类型
 * ============================================================================
 *
 * 这个文件的主要作用是作为一个“中转站”或者“别名”。
 * 它从 `@ai-sdk/react` 这个专门为 React 框架准备的包里，导入了几个核心的 Hooks
 * （比如 `useChat`, `useCompletion`, `useAssistant`）和一些类型定义。
 *
 * 然后，它又把这些导入的东西原封不动地导出去。
 *
 * **但是，请注意！**
 * 所有的导出项都被标记了 `@deprecated`。
 * 这意味着这些导出方式已经过时了，不推荐再这样使用了。
 * 正确的做法是直接从 `@ai-sdk/react` 包里导入这些 Hooks 和类型。
 *
 * 这样做可能是为了保持旧版本代码的兼容性，或者是在项目结构调整过程中的一个临时措施。
 * 想象一下，你家搬家了（代码库重构），你在旧地址（`ai/react`）留了个牌子，
 * 告诉来找你的人（开发者）：“我们搬到新地址（`@ai-sdk/react`）了，请去那边找我们。”
 *
 * - `useChatReact`, `useCompletionReact`, `useAssistantReact`, `experimental_useObjectReact`: 
 *   这些是从 `@ai-sdk/react` 导入的实际功能，加了 `React` 后缀以区分。
 */
import {
  useChat as useChatReact,
  useCompletion as useCompletionReact,
  useAssistant as useAssistantReact,
  experimental_useObject as experimental_useObjectReact,
} from '@ai-sdk/react';

/**
 * @deprecated 请直接使用 `@ai-sdk/react` 包中的 `useChat`。
 * 这个导出是为了兼容旧代码，新代码不应该再使用它。
 */
export const useChat = useChatReact;

/**
 * @deprecated 请直接使用 `@ai-sdk/react` 包中的 `useCompletion`。
 * 这个导出是为了兼容旧代码，新代码不应该再使用它。
 */
export const useCompletion = useCompletionReact;

/**
 * @deprecated 请直接使用 `@ai-sdk/react` 包中的 `useAssistant`。
 * 这个导出是为了兼容旧代码，新代码不应该再使用它。
 */
export const useAssistant = useAssistantReact;

/**
 * @deprecated 请直接使用 `@ai-sdk/react` 包中的 `experimental_useObject`。
 * 这个导出是为了兼容旧代码，新代码不应该再使用它。
 * `experimental_` 前缀表示这还是一个实验性功能，未来可能会有变化。
 */
export const experimental_useObject = experimental_useObjectReact;

/**
 * ============================================================================
 * 重新导出 @ai-sdk/react 中的类型定义
 * ============================================================================
 *
 * 这里同样导出了 `@ai-sdk/react` 中的一些 TypeScript 类型定义。
 * 同样，它们也都被标记为 `@deprecated`，建议直接从 `@ai-sdk/react` 导入。
 *
 * - `CreateMessage`: 创建消息时的数据结构类型。
 * - `Message`: 通用消息对象的类型。
 * - `UseChatOptions`: `useChat` Hook 的配置选项类型。
 * - `UseChatHelpers`: `useChat` Hook 返回的辅助函数和状态的类型。
 */
export type {
  /**
   * @deprecated 请直接从 `@ai-sdk/react` 导入 `CreateMessage` 类型。
   */
  CreateMessage,

  /**
   * @deprecated 请直接从 `@ai-sdk/react` 导入 `Message` 类型。
   */
  Message,

  /**
   * @deprecated 请直接从 `@ai-sdk/react` 导入 `UseChatOptions` 类型。
   */
  UseChatOptions,

  /**
   * @deprecated 请直接从 `@ai-sdk/react` 导入 `UseChatHelpers` 类型。
   */
  UseChatHelpers,
} from '@ai-sdk/react;
