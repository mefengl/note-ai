/**
 * ============================================================================
 * @ai-sdk/react 包入口文件
 * ============================================================================
 *
 * 这个 `index.ts` 文件是 `@ai-sdk/react` 这个包的主要入口点。
 * 它的作用非常简单：就是把当前目录下其他文件中定义的、最重要的 React Hooks
 * （自定义的 React 函数，通常以 `use` 开头）收集起来，然后一起导出去。
 *
 * 这样做的好处是，当其他开发者想要使用这个包提供的 Hooks 时，
 * 他们只需要写 `import { useChat, useCompletion } from '@ai-sdk/react';`
 * 而不需要关心这些 Hooks 具体是在哪个子文件里实现的。
 * 就像一个工具箱的目录，告诉你箱子里有哪些工具，而不用管工具具体放在哪个隔间。
 *
 * `export * from './xxx'` 语法的意思是：
 * “把 `./xxx.ts` 文件里所有导出的东西，全部再从我这里（`index.ts`）导出去。”
 */

/**
 * 导出 `./use-assistant` 模块中的所有内容。
 * 这个模块很可能包含了 `useAssistant` 这个 Hook，用于构建类似 OpenAI Assistant API 的交互体验。
 * 这种助手通常能调用工具、维护状态等。
 */
export * from './use-assistant';

/**
 * 导出 `./use-chat` 模块中的所有内容。
 * 这个模块包含了核心的 `useChat` Hook，是构建聊天机器人界面的主要工具。
 * 它负责管理消息列表、处理用户输入、发送请求给后端、接收流式响应等。
 */
export * from './use-chat';

/**
 * 导出 `./use-completion` 模块中的所有内容。
 * 这个模块包含了 `useCompletion` Hook，用于处理简单的文本补全场景。
 * 比如，根据用户输入的前缀，实时生成建议或补全后续文本。
 * 和 `useChat` 不同，它通常不维护完整的对话历史。
 */
export * from './use-completion';

/**
 * 导出 `./use-object` 模块中的所有内容。
 * 这个模块可能包含 `useObject` Hook (或者类似的实验性 Hook，比如之前看到的 `experimental_useObject`)。
 * 这个 Hook 的目的是让 AI 返回结构化的数据（比如 JSON 对象），而不是纯文本。
 * 并且可以在客户端实时接收和使用这个流式生成或最终生成的对象。
 */
export * from './use-object';
