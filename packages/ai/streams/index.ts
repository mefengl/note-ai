/**
 * ============================================================================
 * 重新导出核心 (core) 和错误 (errors) 模块
 * ============================================================================
 *
 * 这里我们先把 `../core/index` 和 `../errors/index` 里面的所有东西都导出去。
 * `../core/index` 就是我们上一步注释过的那个文件，包含了 AI SDK 的核心功能。
 * `../errors/index` 应该是定义了一些自定义的错误类型，方便我们知道哪里出错了。
 *
 * 这样做的好处是，如果有人想用流（stream）相关的功能，他们只需要导入 `ai/streams` 就行了，
 * 不用再分别去导入 `ai/core` 和 `ai/errors`。
 * 就像你去超市买菜，这个货架（`ai/streams`）上不仅有蔬菜（流相关的功能），
 * 还顺便把旁边的调料（核心功能）和购物袋（错误处理）也给你准备好了。
 */
export * from '../core/index';
export * from '../errors/index';

/**
 * ============================================================================
 * 导出当前目录 (streams) 下的模块
 * ============================================================================
 *
 * 这里导出的是 `streams` 文件夹自己定义的一些功能。
 *
 * - `./assistant-response`: 这个模块看名字是用来处理 AI 助手（Assistant）返回的响应流的。
 *                          比如，当 AI 助手像打字一样一点点回复你时，这个模块可能负责处理这些零碎的数据。
 *
 * - `export * as LangChainAdapter from './langchain-adapter'`: 这行有点特别。
 *   `export * as ...` 的意思是，把 `./langchain-adapter.ts` 文件里所有导出的东西，
 *   打包成一个叫做 `LangChainAdapter` 的对象再导出去。
 *   LangChain 是另一个流行的 AI 开发框架，这个 `Adapter`（适配器）的作用很可能是
 *   让 AI SDK 能跟 LangChain 互相兼容或者一起工作。
 *   就像你有一个国标插头（AI SDK），想插到美标插座（LangChain）上，你需要一个转换插头（Adapter）。
 *
 * - `export * as LlamaIndexAdapter from './llamaindex-adapter'`: 和上面类似，
 *   LlamaIndex 是另一个 AI 框架，主要用于构建基于大型语言模型的知识检索和问答系统。
 *   这个适配器就是让 AI SDK 能和 LlamaIndex 协同工作。
 *
 * - `./stream-data`: 这个模块看名字是处理流数据（Stream Data）的。
 *                   它可能包含一些工具函数，用来在数据流中嵌入额外的信息，
 *                   或者从数据流中解析这些信息。
 *                   比如，在聊天回复的文字流中间，插入一些特殊指令或者元数据。
 */
export * from './assistant-response';
export * as LangChainAdapter from './langchain-adapter';
export * as LlamaIndexAdapter from './llamaindex-adapter';
export * from './stream-data';
