/**
 * ============================================================================
 * 导出 React Server Components (RSC) 相关的类型定义
 * ============================================================================
 *
 * 这个文件本身不包含任何运行时代码，它只负责导出 TypeScript 类型定义。
 * 这些类型是专门为 Vercel AI SDK 与 React Server Components (RSC) 集成而设计的。
 *
 * React Server Components 是一种 React 的新特性，允许组件在服务器端执行和渲染，
 * 并将结果流式传输到客户端。这有助于减少发送到浏览器的 JavaScript 代码量，
 * 提高初始加载速度，并能更方便地在服务器上访问数据源。
 *
 * 这个文件将类型分成了几个来源：
 * 1. `./rsc-server`: 包含在服务器环境 (Server Components) 中使用的类型。
 * 2. `./rsc-client`: 包含在客户端环境 (Client Components) 中使用的类型，通常是 Hooks。
 * 3. `./streamable-value/streamable-value`: 一个核心类型，用于处理可以在服务器和客户端之间流式传输的值。
 */

/**
 * ============================================================================
 * 从 './rsc-server' 导出服务器端类型
 * ============================================================================
 *
 * 这些类型主要用于在 React Server Components 内部与 AI SDK 交互。
 *
 * - `getAIState`: 获取当前 AI 状态的函数类型。
 * - `getMutableAIState`: 获取可变的 AI 状态的函数类型 (允许在服务器端修改状态)。
 * - `createStreamableUI`: 创建一个可以流式传输 UI 更新到客户端的函数类型。
 *                        想象一下 AI 正在逐步生成一个复杂的界面，这个函数可以把生成的每一小块 UI 发送给用户。
 * - `createStreamableValue`: 创建一个可以流式传输普通值 (非 UI) 的函数类型。
 *                           比如，AI 正在计算一个数字或生成一段文本，可以把中间结果或最终结果流式发送。
 * - `streamUI`: 用于将 React 组件流式传输到客户端的函数类型。
 * - `createAI`: 创建和配置 AI 交互核心逻辑的函数类型。
 */
export type {
  getAIState,
  getMutableAIState,
  createStreamableUI,
  createStreamableValue,
  streamUI,
  createAI,
} from './rsc-server';

/**
 * ============================================================================
 * 从 './rsc-client' 导出客户端类型 (主要是 Hooks)
 * ============================================================================
 *
 * 这些类型主要用于在 React Client Components 中与从服务器流式传输过来的 AI 状态和 UI 进行交互。
 *
 * - `readStreamableValue`: 读取流式值的函数类型 (已废弃，推荐使用 `useStreamableValue`)。
 * - `useStreamableValue`: 一个 React Hook，用于在客户端订阅和读取从服务器流式传输过来的值。
 *                        当服务器使用 `createStreamableValue` 发送数据时，客户端用这个 Hook 来接收。
 * - `useUIState`: 一个 React Hook，用于获取和更新流式 UI 的状态。
 *                 当服务器使用 `createStreamableUI` 或 `streamUI` 发送 UI 更新时，客户端用这个 Hook 来管理和展示这些 UI。
 * - `useAIState`: 一个 React Hook，用于在客户端访问 AI 的状态。
 *                 服务器通过 `getAIState` 或 `getMutableAIState` 管理状态，客户端用这个 Hook 读取。
 * - `useActions`: 一个 React Hook，用于获取在服务器端定义的 AI 操作 (Actions)。
 *                 允许客户端触发在 Server Components 中定义的函数。
 * - `useSyncUIState`: 一个 React Hook，用于在 URL 和 UI 状态之间进行同步。
 *                     比如，可以把聊天记录的状态同步到 URL 查询参数中，方便分享和刷新。
 */
export type {
  readStreamableValue,
  useStreamableValue,
  useUIState,
  useAIState,
  useActions,
  useSyncUIState,
} from './rsc-client';

/**
 * ============================================================================
 * 从 './streamable-value/streamable-value' 导出核心类型
 * ============================================================================
 *
 * - `StreamableValue`: 这是流式值的核心类型定义。
 *                      它代表一个可以在服务器和客户端之间逐步传输的数据。
 */
export type { StreamableValue } from './streamable-value/streamable-value';
