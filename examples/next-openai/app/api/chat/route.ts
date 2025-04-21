/**
 * 聊天API路由文件
 * --------------------------------------
 * 这个文件是一个Next.js的API路由处理程序，专门用来处理AI聊天功能的后端逻辑。
 * 
 * 整体功能：当用户在前端发送消息时，这个API会接收消息，将其传给OpenAI的模型，
 * 然后以流式(stream)方式返回AI的回复。这种流式返回方式让用户可以看到AI正在实时
 * 生成的回答，而不必等待完整回答生成后才显示。
 * 
 * 想象一下：这就像是你在和一个人聊天，他一边思考一边回答，你可以看到他实时打字的过程，
 * 而不是等他完全想好、打完字后才一次性看到回复。
 */

import { openai } from '@ai-sdk/openai';  // 导入OpenAI的工具，让我们能和OpenAI的AI模型对话
import { streamText } from 'ai';  // 导入流文本功能，让AI回复能一段一段地返回，而不是等全部生成完

/**
 * 设置响应的最大持续时间为30秒
 * 
 * 这就像是在说："如果AI思考和回答的时间超过30秒，我们就不再等它了"
 * 这样可以避免用户等待太久，也可以节省服务器资源
 */
export const maxDuration = 30;

/**
 * POST请求处理函数 - 处理用户发来的聊天消息
 * 
 * 这个函数就像一个邮递员，它：
 * 1. 接收用户发来的"信件"(聊天消息)
 * 2. 把这些消息送给AI
 * 3. 然后把AI的回复一句一句地送回给用户
 * 
 * @param req - 请求对象，包含了用户发送的数据
 * @returns - 返回AI的流式回复
 */
export async function POST(req: Request) {
  // 从请求中提取messages(聊天记录)和id(对话标识符)
  // 这就像是从信封里取出信的内容和信的编号
  const { messages, id } = await req.json();

  // 在控制台打印聊天ID，方便开发者追踪和调试
  // 这个ID可以用来保存聊天记录，比如存到数据库中
  console.log('chat id', id); // 可以用于持久化存储聊天记录

  /**
   * 调用AI语言模型生成回复
   * 
   * 这一步就像是：
   * 1. 我们选择了一个AI助手(这里是GPT-4o)
   * 2. 给它看之前的聊天记录(messages)
   * 3. 请它思考并回答
   * 4. 设置了一个"回答完成后"要做的事情(onFinish函数)
   */
  const result = streamText({
    model: openai('gpt-4o'),  // 使用OpenAI的GPT-4o模型，这是他们最先进的模型之一
    messages,  // 传入聊天记录，让AI了解对话上下文
    async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // 当AI回答完成后可以执行的额外操作
      // 例如：可以在这里把聊天记录保存到数据库
      // 或者记录token使用情况，以便于计费或监控使用量
    },
  });

  // 将AI的回复作为数据流返回给前端
  // 这样用户就能看到AI正在"打字"的效果，而不是等待整个回答生成完毕
  return result.toDataStreamResponse();
}
