// filepath: /Volumes/MI-1T/Developer/GitHub/note-ai/packages/openai/src/openai-provider.ts

/**
 * OpenAI提供商模块 - 这是AI SDK与OpenAI API交互的核心文件
 * 
 * 本文件实现了OpenAI各种AI模型的提供商接口，包括：
 * 1. 聊天模型(GPT-3.5/4等) - 用于生成对话式文本
 * 2. 文本补全模型 - 用于根据提示生成文本
 * 3. 文本嵌入模型 - 将文本转换为数值向量，用于语义搜索等
 * 4. 图像生成模型 - 根据文本描述生成图像
 * 5. 语音识别模型 - 将语音转换为文本
 * 6. 语音合成模型 - 将文本转换为语音
 * 
 * 这个文件就像是一个"翻译官"，帮助你的代码和OpenAI的服务器进行沟通。
 * 你只需调用简单的函数，它就会帮你处理所有复杂的API调用细节。
 */

import {
  EmbeddingModelV1,
  ImageModelV1,
  TranscriptionModelV1,
  LanguageModelV1,
  ProviderV1,
  SpeechModelV1,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { OpenAIChatLanguageModel } from './openai-chat-language-model';
import { OpenAIChatModelId, OpenAIChatSettings } from './openai-chat-settings';
import { OpenAICompletionLanguageModel } from './openai-completion-language-model';
import {
  OpenAICompletionModelId,
  OpenAICompletionSettings,
} from './openai-completion-settings';
import { OpenAIEmbeddingModel } from './openai-embedding-model';
import {
  OpenAIEmbeddingModelId,
  OpenAIEmbeddingSettings,
} from './openai-embedding-settings';
import { OpenAIImageModel } from './openai-image-model';
import {
  OpenAIImageModelId,
  OpenAIImageSettings,
} from './openai-image-settings';
import { OpenAITranscriptionModel } from './openai-transcription-model';
import { OpenAITranscriptionModelId } from './openai-transcription-settings';
import { OpenAIResponsesLanguageModel } from './responses/openai-responses-language-model';
import { OpenAIResponsesModelId } from './responses/openai-responses-settings';
import { openaiTools } from './openai-tools';
import { OpenAISpeechModel } from './openai-speech-model';
import { OpenAISpeechModelId } from './openai-speech-settings';

/**
 * OpenAIProvider接口 - 定义了与OpenAI交互的所有方法
 * 
 * 这个接口就像是一个"菜单"，列出了你可以使用的所有OpenAI功能。
 * 例如：生成文字、创建图片、处理语音等等。
 * 
 * 每个方法都接收模型ID和设置选项，返回相应的模型实例。
 * 这样设计让你可以轻松切换不同的AI模型，而不需要改变代码逻辑。
 */
export interface OpenAIProvider extends ProviderV1 {
  /**
   * 默认调用方法 - 可以直接将provider作为函数调用
   * 
   * 例如: openai('gpt-4', { temperature: 0.7 })
   * 这种写法更简洁，适合快速使用
   */
  (
    modelId: 'gpt-3.5-turbo-instruct',
    settings?: OpenAICompletionSettings,
  ): OpenAICompletionLanguageModel;
  (modelId: OpenAIChatModelId, settings?: OpenAIChatSettings): LanguageModelV1;

  /**
   * 创建OpenAI语言模型
   * 
   * 这是一个通用方法，会根据模型ID自动选择聊天模型或补全模型
   * 例如：gpt-4会使用聊天模型，gpt-3.5-turbo-instruct会使用补全模型
   */
  languageModel(
    modelId: 'gpt-3.5-turbo-instruct',
    settings?: OpenAICompletionSettings,
  ): OpenAICompletionLanguageModel;
  languageModel(
    modelId: OpenAIChatModelId,
    settings?: OpenAIChatSettings,
  ): LanguageModelV1;

  /**
   * 创建OpenAI聊天模型
   * 
   * 聊天模型适合多轮对话，可以记住上下文
   * 比如：制作一个能与用户交流的AI助手
   */
  chat(
    modelId: OpenAIChatModelId,
    settings?: OpenAIChatSettings,
  ): LanguageModelV1;

  /**
   * 创建OpenAI响应API模型
   * 
   * 这是OpenAI的一种特殊API，专为响应生成优化
   */
  responses(modelId: OpenAIResponsesModelId): LanguageModelV1;

  /**
   * 创建OpenAI补全模型
   * 
   * 补全模型适合单次文本生成，不保持对话上下文
   * 比如：根据提示生成一段文章或代码
   */
  completion(
    modelId: OpenAICompletionModelId,
    settings?: OpenAICompletionSettings,
  ): LanguageModelV1;

  /**
   * 创建文本嵌入模型
   * 
   * 嵌入模型可以将文本转换为数字向量
   * 这些向量可用于计算文本相似度、聚类分析等
   * 比如：构建一个能理解语义的搜索引擎
   */
  embedding(
    modelId: OpenAIEmbeddingModelId,
    settings?: OpenAIEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
   * 创建文本嵌入模型（已废弃）
   * 
   * 这是旧版方法，建议使用textEmbeddingModel替代
   * @deprecated 使用 `textEmbeddingModel` 代替
   */
  textEmbedding(
    modelId: OpenAIEmbeddingModelId,
    settings?: OpenAIEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
   * 创建文本嵌入模型
   * 
   * 与embedding方法功能相同，命名更明确
   */
  textEmbeddingModel(
    modelId: OpenAIEmbeddingModelId,
    settings?: OpenAIEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
   * 创建图像生成模型
   * 
   * 可以根据文本描述生成图像
   * 比如：根据"一只戴着墨镜的猫"生成相应图片
   */
  image(
    modelId: OpenAIImageModelId,
    settings?: OpenAIImageSettings,
  ): ImageModelV1;

  /**
   * 创建图像模型
   * 
   * 与image方法功能相同，命名更明确
   */
  imageModel(
    modelId: OpenAIImageModelId,
    settings?: OpenAIImageSettings,
  ): ImageModelV1;

  /**
   * 创建语音转文本模型
   * 
   * 将音频转换为文本，即语音识别
   * 比如：将录音内容转为文字记录
   */
  transcription(modelId: OpenAITranscriptionModelId): TranscriptionModelV1;

  /**
   * 创建文本转语音模型
   * 
   * 将文本转换为语音，即语音合成
   * 比如：让AI为你的应用朗读文本内容
   */
  speech(modelId: OpenAISpeechModelId): SpeechModelV1;

  /**
   * OpenAI特定工具
   * 
   * 包含一些OpenAI专用的扩展功能
   */
  tools: typeof openaiTools;
}

/**
 * OpenAI提供商设置接口
 * 
 * 这个接口定义了配置OpenAI提供商所需的各种选项
 * 就像是告诉AI"我想要怎样使用你的服务"的说明书
 */
export interface OpenAIProviderSettings {
  /**
   * OpenAI API的基础URL
   * 
   * 默认是官方API地址: https://api.openai.com/v1
   * 如果你使用自定义部署或代理，可以修改这个值
   */
  baseURL?: string;

  /**
   * API密钥，用于身份验证
   * 
   * 如果不提供，会尝试从环境变量OPENAI_API_KEY中获取
   * 这就像是你的"会员卡"，没有它就无法使用OpenAI服务
   */
  apiKey?: string;

  /**
   * OpenAI组织ID
   * 
   * 如果你的API密钥属于多个组织，可以用这个指定使用哪个组织
   */
  organization?: string;

  /**
   * OpenAI项目ID
   * 
   * 用于跟踪和管理API使用情况
   */
  project?: string;

  /**
   * 自定义请求头
   * 
   * 可以添加额外的HTTP请求头信息
   */
  headers?: Record<string, string>;

  /**
   * OpenAI兼容性模式
   * 
   * - strict: 严格模式，用于官方OpenAI API
   * - compatible: 兼容模式，用于第三方兼容API提供商
   * 
   * 在兼容模式下，会省略一些较新的参数，如streamOptions
   * 默认为'compatible'，确保与大多数第三方提供商兼容
   */
  compatibility?: 'strict' | 'compatible';

  /**
   * 提供商名称
   * 
   * 可以覆盖默认的'openai'名称，适用于第三方提供商
   * 这个名称会用于日志和调试信息
   */
  name?: string;

  /**
   * 自定义fetch实现
   * 
   * 可以用作中间件拦截请求，或为测试提供自定义fetch实现
   * 比如：添加额外的日志记录、修改请求或响应等
   */
  fetch?: FetchFunction;
}

/**
 * 创建OpenAI提供商实例
 * 
 * 这个函数是整个模块的核心，它创建了与OpenAI交互的主要接口
 * 返回的对象既是函数，又包含多种方法，非常灵活
 * 
 * @param options OpenAI提供商设置选项
 * @returns OpenAI提供商实例
 * 
 * 使用示例:
 * ```
 * const myOpenAI = createOpenAI({
 *   apiKey: 'your-api-key',
 *   compatibility: 'strict'
 * });
 * 
 * // 直接调用
 * const model = myOpenAI('gpt-4');
 * 
 * // 或使用方法
 * const chatModel = myOpenAI.chat('gpt-4');
 * ```
 */
export function createOpenAI(
  options: OpenAIProviderSettings = {},
): OpenAIProvider {
  // 设置API基础URL，如果没有提供则使用OpenAI官方URL
  const baseURL =
    withoutTrailingSlash(options.baseURL) ?? 'https://api.openai.com/v1';

  // 默认使用兼容模式，因为严格模式可能会导致第三方提供商(如Groq)出错
  const compatibility = options.compatibility ?? 'compatible';

  // 设置提供商名称，默认为"openai"
  const providerName = options.name ?? 'openai';

  /**
   * 获取请求头
   * 
   * 构建API请求所需的HTTP头信息，包括授权信息和其他设置
   * 每次请求都会调用此函数获取最新的头信息
   */
  const getHeaders = () => ({
    // 添加Bearer令牌验证，从options或环境变量中获取API密钥
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'OPENAI_API_KEY',
      description: 'OpenAI',
    })}`,
    'OpenAI-Organization': options.organization,
    'OpenAI-Project': options.project,
    ...options.headers, // 合并自定义请求头
  });

  /**
   * 创建聊天模型
   * 
   * 用于处理对话式交互的模型，如GPT-4, GPT-3.5-turbo等
   * 
   * @param modelId 模型标识符，如'gpt-4'
   * @param settings 模型设置，如temperature, maxTokens等
   * @returns 聊天语言模型实例
   */
  const createChatModel = (
    modelId: OpenAIChatModelId,
    settings: OpenAIChatSettings = {},
  ) =>
    new OpenAIChatLanguageModel(modelId, settings, {
      provider: `${providerName}.chat`, // 提供商标识
      url: ({ path }) => `${baseURL}${path}`, // 构建API URL
      headers: getHeaders, // 设置请求头
      compatibility, // 兼容性模式
      fetch: options.fetch, // 自定义fetch实现
    });

  /**
   * 创建补全模型
   * 
   * 用于文本补全的模型，如gpt-3.5-turbo-instruct
   * 
   * @param modelId 模型标识符
   * @param settings 模型设置
   * @returns 文本补全模型实例
   */
  const createCompletionModel = (
    modelId: OpenAICompletionModelId,
    settings: OpenAICompletionSettings = {},
  ) =>
    new OpenAICompletionLanguageModel(modelId, settings, {
      provider: `${providerName}.completion`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      compatibility,
      fetch: options.fetch,
    });

  /**
   * 创建嵌入模型
   * 
   * 用于将文本转换为向量表示的模型
   * 
   * @param modelId 模型标识符，如'text-embedding-ada-002'
   * @param settings 模型设置
   * @returns 文本嵌入模型实例
   */
  const createEmbeddingModel = (
    modelId: OpenAIEmbeddingModelId,
    settings: OpenAIEmbeddingSettings = {},
  ) =>
    new OpenAIEmbeddingModel(modelId, settings, {
      provider: `${providerName}.embedding`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  /**
   * 创建图像模型
   * 
   * 用于生成图像的模型，如DALL-E
   * 
   * @param modelId 模型标识符，如'dall-e-3'
   * @param settings 模型设置，如尺寸、质量等
   * @returns 图像生成模型实例
   */
  const createImageModel = (
    modelId: OpenAIImageModelId,
    settings: OpenAIImageSettings = {},
  ) =>
    new OpenAIImageModel(modelId, settings, {
      provider: `${providerName}.image`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  /**
   * 创建语音转文本模型
   * 
   * 用于语音识别的模型，如Whisper
   * 
   * @param modelId 模型标识符，如'whisper-1'
   * @returns 语音识别模型实例
   */
  const createTranscriptionModel = (modelId: OpenAITranscriptionModelId) =>
    new OpenAITranscriptionModel(modelId, {
      provider: `${providerName}.transcription`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  /**
   * 创建文本转语音模型
   * 
   * 用于语音合成的模型
   * 
   * @param modelId 模型标识符，如'tts-1'
   * @returns 语音合成模型实例
   */
  const createSpeechModel = (modelId: OpenAISpeechModelId) =>
    new OpenAISpeechModel(modelId, {
      provider: `${providerName}.speech`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  /**
   * 创建语言模型(通用方法)
   * 
   * 根据模型ID自动选择使用聊天模型或补全模型
   * 
   * @param modelId 模型标识符
   * @param settings 模型设置
   * @returns 语言模型实例
   */
  const createLanguageModel = (
    modelId: OpenAIChatModelId | OpenAICompletionModelId,
    settings?: OpenAIChatSettings | OpenAICompletionSettings,
  ) => {
    // 防止使用new关键字调用
    if (new.target) {
      throw new Error(
        'The OpenAI model function cannot be called with the new keyword.',
      );
    }

    // 根据模型ID选择合适的模型类型
    if (modelId === 'gpt-3.5-turbo-instruct') {
      return createCompletionModel(
        modelId,
        settings as OpenAICompletionSettings,
      );
    }

    // 默认使用聊天模型
    return createChatModel(modelId, settings as OpenAIChatSettings);
  };

  /**
   * 创建响应模型
   * 
   * 用于OpenAI的响应API
   * 
   * @param modelId 模型标识符
   * @returns 响应语言模型实例
   */
  const createResponsesModel = (modelId: OpenAIResponsesModelId) => {
    return new OpenAIResponsesLanguageModel(modelId, {
      provider: `${providerName}.responses`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });
  };

  /**
   * 创建提供商函数
   * 
   * 这个函数既可以直接调用，也包含多个方法
   * 是整个提供商接口的入口点
   */
  const provider = function (
    modelId: OpenAIChatModelId | OpenAICompletionModelId,
    settings?: OpenAIChatSettings | OpenAICompletionSettings,
  ) {
    return createLanguageModel(modelId, settings);
  };

  // 为provider对象添加各种方法
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  provider.responses = createResponsesModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel; // 旧方法，保持兼容性
  provider.textEmbeddingModel = createEmbeddingModel;

  provider.image = createImageModel;
  provider.imageModel = createImageModel;

  provider.transcription = createTranscriptionModel;
  provider.transcriptionModel = createTranscriptionModel;

  provider.speech = createSpeechModel;
  provider.speechModel = createSpeechModel;

  // 添加工具函数
  provider.tools = openaiTools;

  // 返回完整的提供商接口
  return provider as OpenAIProvider;
}

/**
 * 默认OpenAI提供商实例
 * 
 * 使用严格兼容模式，专为官方OpenAI API优化
 * 这是最常用的入口点，大多数情况下你只需要导入这个变量即可
 * 
 * 使用示例:
 * ```
 * import { openai } from '@ai-sdk/openai';
 * 
 * const model = openai('gpt-4');
 * const result = await model.generateText('你好，世界!');
 * ```
 */
export const openai = createOpenAI({
  compatibility: 'strict', // 为官方OpenAI API使用严格模式
});
