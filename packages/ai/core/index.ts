/**
 * ============================================================================
 * 重新导出 @ai-sdk/provider-utils 包的功能
 * ============================================================================
 *
 * 这里我们把 `@ai-sdk/provider-utils` 这个包里面的一些好用的工具函数导出来，
 * 这样在使用 `ai` 这个核心包的时候，就不用再去单独安装和导入 `@ai-sdk/provider-utils` 了。
 *
 * 想象一下，你有一个工具箱（`@ai-sdk/provider-utils`），里面有锤子、螺丝刀。
 * 现在你要盖房子（用 `ai` 核心包），你肯定需要这些工具。与其每次都去工具箱里拿，
 * 不如直接把锤子和螺丝刀放在你盖房子的工地旁边（通过 re-export 导出）。
 *
 * - `createIdGenerator`: 创建一个用来生成独一无二 ID 的函数。就像给每个新盖的房间分配一个门牌号。
 * - `generateId`: 直接生成一个独一无二的 ID。就像直接拿到下一个可用的门牌号。
 * - `IDGenerator`: 这是 `createIdGenerator` 函数返回的那个“ID 生成器”的类型定义。
 *                  就像是“门牌号生成器”的说明书，告诉你它能干什么。
 */
export { createIdGenerator, generateId } from '@ai-sdk/provider-utils';
export type { IDGenerator } from '@ai-sdk/provider-utils';

/**
 * ============================================================================
 * 重新导出 @ai-sdk/ui-utils 包的功能
 * ============================================================================
 *
 * 这里我们又从另一个工具包 `@ai-sdk/ui-utils` 导入了一些工具。
 * 这个包主要负责处理跟用户界面（UI）交互相关的数据格式和处理逻辑。
 *
 * 想象一下，AI 模型返回的信息（比如聊天回复）是一堆原始的积木块。
 * 这些工具函数就像是乐高说明书和分类盒，帮助你把这些积木块整理好、拼装成用户能看懂的样子。
 *
 * - `formatAssistantStreamPart`, `formatDataStreamPart`: 把 AI 返回的数据流（像水流一样连续不断的数据）
 *                                                     格式化成特定的小块，方便前端展示。
 *                                                     比如把一长串文字切成一小段一小段的。
 * - `parseAssistantStreamPart`, `parseDataStreamPart`: 跟上面相反，把收到的特定格式的小块数据解析成程序能理解的内容。
 * - `jsonSchema`, `zodSchema`: 用来定义数据应该长什么样（数据结构）。
 *                              `jsonSchema` 是一种通用的标准格式。
 *                              `zodSchema` 是用 Zod 这个库来定义的格式，写起来更方便，检查也更严格。
 *                              就像是规定了“用户信息”必须包含“姓名”和“年龄”，而且“年龄”必须是数字。
 * - `processDataStream`, `processTextStream`: 处理整个数据流，把原始数据流转换成更容易使用的格式。
 *                                            就像是把源源不断流过来的水（数据流）引导到水龙头（处理后的数据）。
 *
 * 下面这些 `type` 结尾的是 TypeScript 的类型定义，它们不是实际的代码，而是告诉编译器（和开发者）
 * 这些数据应该是什么样子的，有什么属性。就像是变量的“说明书”。
 *
 * - `AssistantMessage`, `DataMessage`, `Message`, `UIMessage`: 不同类型的消息格式。比如助手说的、带数据的、通用的、给 UI 用的。
 * - `AssistantStatus`: 助手当前的状态（比如正在思考、正在回复）。
 * - `Attachment`: 消息里可能带的附件（比如图片、文件）。
 * - `ChatRequest`, `ChatRequestOptions`: 发送聊天请求时需要的数据和选项。
 * - `CreateMessage`: 创建新消息时需要的数据。
 * - `DataStreamPart`: 数据流里的一个小片段。
 * - `DeepPartial`: 一个工具类型，表示一个对象的所有属性（包括嵌套的属性）都是可选的。
 * - `IdGenerator`: 上面提过的 ID 生成器的类型。
 * - `JSONValue`: 表示一个可以是任何 JSON 格式的值（字符串、数字、布尔、数组、对象）。
 * - `RequestOptions`: 发送请求时的一些通用选项。
 * - `Schema`: 数据格式定义的通用类型。
 * - `ToolInvocation`: AI 调用外部工具（比如查天气、搜索）的信息。
 * - `UseAssistantOptions`: 使用某个 UI 助手功能时的选项。
 */
export {
  formatAssistantStreamPart,
  formatDataStreamPart,
  jsonSchema,
  parseAssistantStreamPart,
  parseDataStreamPart,
  processDataStream,
  processTextStream,
  zodSchema,
} from '@ai-sdk/ui-utils';
export type {
  AssistantMessage,
  AssistantStatus,
  Attachment,
  ChatRequest,
  ChatRequestOptions,
  CreateMessage,
  DataMessage,
  DataStreamPart,
  DeepPartial,
  IdGenerator,
  JSONValue,
  Message,
  UIMessage,
  RequestOptions,
  Schema,
  ToolInvocation,
  UseAssistantOptions,
} from '@ai-sdk/ui-utils';

/**
 * ============================================================================
 * 导出当前目录 (core) 下的其他模块
 * ============================================================================
 *
 * `export * from './xxx'` 这种语法的意思是，把 `./xxx.ts` (或者 `./xxx/index.ts`)
 * 文件里所有导出的东西，再从当前这个 `index.ts` 文件导出去。
 *
 * 这就像是把分散在不同房间（不同文件）里的工具和零件，全部搬到大门口（`core/index.ts`），
 * 方便别人一次性找到所有核心功能。
 *
 * - `./data-stream`: 处理数据流相关的功能。
 * - `./embed`: 把文本转换成向量（Embedding）的功能，用于语义搜索等。
 * - `./generate-image`: 调用 AI 生成图片的功能。
 * - `./generate-object`: 让 AI 生成结构化数据（比如 JSON 对象）的功能。
 * - `./generate-text`: 调用 AI 生成文本（比如聊天回复、文章）的功能。
 * - `./generate-speech`: 调用 AI 生成语音的功能。
 * - `./transcribe`: 把语音转换成文字的功能。
 * - `./middleware`: 中间件，可以在请求处理流程中插入自定义逻辑。
 * - `./prompt`: 构建和管理提示词（Prompt）相关的功能。
 * - `./registry`: 用于注册和查找模型或其他资源。
 * - `./tool`: 定义和使用 AI 工具（Tool Calling）相关的功能。
 * - `./types`: 一些通用的类型定义。
 */
export * from './data-stream';
export * from './embed';
export * from './generate-image';
export * from './generate-object';
export * from './generate-text';
export * from './generate-speech';
export * from './transcribe';
export * from './middleware';
export * from './prompt';
export * from './registry';
export * from './tool';
export * from './types';

/**
 * ============================================================================
 * 导出遥测 (Telemetry) 相关的类型
 * ============================================================================
 *
 * 遥测是用来收集程序运行时的匿名数据，帮助开发者了解软件是怎么被使用的，
 * 以便改进产品。这里导出了遥测设置的类型定义。
 *
 * - `TelemetrySettings`: 遥测设置的类型说明书。
 */
export type { TelemetrySettings } from './telemetry/telemetry-settings';

/**
 * ============================================================================
 * 导出工具函数 (Utilities)
 * ============================================================================
 *
 * 这里导出了一些内部使用的工具函数。
 *
 * - `cosineSimilarity`: 计算两个向量之间的余弦相似度。常用于判断文本或数据的相似程度。
 *                       想象一下，你有两个箭头，这个函数可以告诉你这两个箭头指向的方向有多接近。
 * - `simulateReadableStream`: 模拟一个可读的数据流。主要用于测试目的，
 *                            可以创建一个假的数据流来测试处理数据流的代码。
 */
export { cosineSimilarity } from './util/cosine-similarity';
export { simulateReadableStream } from './util/simulate-readable-stream';
