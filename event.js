// @version 0.0.5 新增 logger 函数和加密事件的输出
const aircode = require("aircode");
const lark = require("@larksuiteoapi/node-sdk");
var axios = require("axios");
const EventDB = aircode.db.table("event");

// 如果你不想配置环境变量，或环境变量不生效，则可以把结果填写在每一行最后的 "" 内部
const FEISHU_APP_ID = process.env.APPID || ""; // 飞书的应用 ID
const FEISHU_APP_SECRET = process.env.SECRET || ""; // 飞书的应用的 Secret
const FEISHU_BOTNAME = process.env.BOTNAME || ""; // 飞书机器人的名字
const OPENAI_KEY = process.env.KEY || ""; // OpenAI 的 Key
const OPENAI_MODEL = process.env.MODEL || "text-davinci-003"; // 使用的模型
const OPENAI_MAX_TOKEN = process.env.MAX_TOKEN || 1024; // 最大 token 的值

const globalSession = new Map(); // 用于保存历史会话的map对象

const client = new lark.Client({
  appId: FEISHU_APP_ID,
  appSecret: FEISHU_APP_SECRET,
  disableTokenCache: false,
});

// 日志辅助函数，请贡献者使用此函数打印关键日志
function logger(param) {
  console.warn(`[CF]`, param);
}

// 回复消息
async function reply(messageId, content) {
  try{
    return await client.im.message.reply({
    path: {
      message_id: messageId,
    },
    data: {
      content: JSON.stringify({
        text: content,
      }),
      msg_type: "text",
    },
  });
  } catch(e){
    logger("send message to feishu erro",e,messageId,content);
  }
}


// 根据用户id构造用户会话
function buildSessionQuery(sessionId, question) {
  // 根据中英文设置不同的 prompt
  let prompt = "你是 ChatGPT, 一个由 OpenAI 训练的大型语言模型, 你旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。\n请回答我下面的问题\n";
  if ((question[0] >= "a" && question[0] <= "z") || (question[0] >= "A" && question[0] <= "Z")) {
    return "You are ChatGPT, a LLM model trained by OpenAI. \nplease answer my following question\n";
  }

  // 从 session 中取出历史记录构造 question
  let userSession = globalSession.get(sessionId);
  if (userSession){
      for (conversation of userSession) {
          prompt += "Q: " + conversation.question + "\nA: " + conversation.answer + "\n\n";
      }
  }

  // 拼接最新 question
  return prompt + "Q: " + question + "\nA: ";
}

// 保存用户会话
function saveSession(sessionId, question, answer) {
  let conversation = { question, answer };
  let userSession = globalSession.get(sessionId);
  
  // 有历史会话存在则追加并判断是否需要抛弃历史，否则新建会话并保存
  if (userSession) {
    userSession.push(conversation);
    discardConversation(userSession);
  } else {
    globalSession.set(sessionId, [conversation]);
  }
}

// 如果历史会话记录大于OPENAI_MAX_TOKEN，则第一条开始抛弃超过限制的对话
function discardConversation(userSession) {
  let count = 0;
  let countList = [];
  let sessionLen = userSession.length;
  for (i = sessionLen - 1; i >= 0; i--) {
    count += userSession[i].question.length + userSession[i].answer.length;
    countList.push(count);
  }
  for (c of countList) {
    if (c > OPENAI_MAX_TOKEN) {
      userSession.shift();
    }
  }
}

// 清除历史会话
function clearSession(sessionId) {
  globalSession.delete(sessionId);
}

// 通过 OpenAI API 获取回复
async function getOpenAIReply(prompt) {
  logger("send prompt: " + prompt);

  var data = JSON.stringify({
    model: OPENAI_MODEL,
    prompt: prompt,
    max_tokens: OPENAI_MAX_TOKEN,
    temperature: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    top_p: 1,
    stop: ["#"],
  });

  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.openai.com/v1/completions",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  try{
      const response = await axios(config);
      // 去除多余的换行
      return response.data.choices[0].text.replace("\n\n", "");
    
  }catch(e){
     logger(e)
     return "请求失败";
  }

}

// 自检函数
async function doctor() {
  if (FEISHU_APP_ID === "") {
    return {
      code: 1,
      message: {
        zh_CN: "你没有配置飞书应用的 AppID，请检查 & 部署后重试",
        en_US:
          "Here is no FeiSHu APP id, please check & re-Deploy & call again",
      },
    };
  }
  if (!FEISHU_APP_ID.startsWith("cli_")) {
    return {
      code: 1,
      message: {
        zh_CN:
          "你配置的飞书应用的 AppID 是错误的，请检查后重试。飞书应用的 APPID 以 cli_ 开头。",
        en_US:
          "Your FeiShu App ID is Wrong, Please Check and call again. FeiShu APPID must Start with cli",
      },
    };
  }
  if (FEISHU_APP_SECRET === "") {
    return {
      code: 1,
      message: {
        zh_CN: "你没有配置飞书应用的 Secret，请检查 & 部署后重试",
        en_US:
          "Here is no FeiSHu APP Secret, please check & re-Deploy & call again",
      },
    };
  }

  if (FEISHU_BOTNAME === "") {
    return {
      code: 1,
      message: {
        zh_CN: "你没有配置飞书应用的名称，请检查 & 部署后重试",
        en_US:
          "Here is no FeiSHu APP Name, please check & re-Deploy & call again",
      },
    };
  }

  if (OPENAI_KEY === "") {
    return {
      code: 1,
      message: {
        zh_CN: "你没有配置 OpenAI 的 Key，请检查 & 部署后重试",
        en_US: "Here is no OpenAI Key, please check & re-Deploy & call again",
      },
    };
  }

  if (!OPENAI_KEY.startsWith("sk-")) {
    return {
      code: 1,
      message: {
        zh_CN:
          "你配置的 OpenAI Key 是错误的，请检查后重试。飞书应用的 APPID 以 cli_ 开头。",
        en_US:
          "Your OpenAI Key is Wrong, Please Check and call again. FeiShu APPID must Start with cli",
      },
    };
  }
  return {
    code: 0,
    message: {
      zh_CN:
        "✅ Configuration is correct, you can use this bot in your FeiShu App",
      en_US:
        "✅ 配置成功，接下来你可以在飞书应用当中使用机器人来完成你的工作。",
    },
    meta: {
      FEISHU_APP_ID,
      OPENAI_MODEL,
      OPENAI_MAX_TOKEN,
      FEISHU_BOTNAME,
    },
  };
}

module.exports = async function (params, context) {
  // 如果存在 encrypt 则说明配置了 encrypt key
  if (params.encrypt) {
    logger("user enable encrypt key");
    return {
      code: 1,
      message: {
        zh_CN: "你配置了 Encrypt Key，请关闭该功能。",
        en_US: "You have open Encrypt Key Feature, please close it.",
      },
    };
  }
  // 处理飞书开放平台的服务端校验
  if (params.type === "url_verification") {
    logger("deal url_verification");
    return {
      challenge: params.challenge,
    };
  }
  // 自检查逻辑
  if (!params.hasOwnProperty("header") || context.trigger === "DEBUG") {
    logger("enter doctor");
    return await doctor();
  }
  // 处理飞书开放平台的事件回调
  if ((params.header.event_type === "im.message.receive_v1")) {
    let eventId = params.header.event_id;
    let messageId = params.event.message.message_id;
    let chatId = params.event.message.chat_id;
    let senderId = params.event.sender.sender_id.user_id;
    let sessionId = chatId + senderId;

    // 对于同一个事件，只处理一次
    const count = await EventDB.where({ event_id: eventId }).count();
    if (count != 0) {
      logger("deal repeat event");
      return { code: 1 };
    }
    await EventDB.save({ event_id: eventId });

    // 私聊直接回复
    if (params.event.message.chat_type === "p2p") {
      // 不是文本消息，不处理
      if (params.event.message.message_type != "text") {
        await reply(messageId, "暂不支持其他类型的提问");
        logger("skip and reply not support");
        return { code: 0 };
      }
      // 是文本消息，直接回复
      const userInput = JSON.parse(params.event.message.content);
      const question = userInput.text;
      if (question.trim() == "#清除记忆") {
        clearSession(sessionId)
        await reply(messageId, "记忆已清除");
        return { code: 0 };
      }
      const prompt = buildSessionQuery(sessionId, question);
      const openaiResponse = await getOpenAIReply(prompt);
      saveSession(sessionId, question, openaiResponse)
      await reply(messageId, openaiResponse);
      return { code: 0 };
    }

    // 群聊，需要 @ 机器人
    if (params.event.message.chat_type === "group") {
      // 这是日常群沟通，不用管
      if (
        !params.event.message.mentions ||
        params.event.message.mentions.length === 0
      ) {
        logger("not process message without mention");
        return { code: 0 };
      }
      // 没有 mention 机器人，则退出。
      if (params.event.message.mentions[0].name != FEISHU_BOTNAME) {
        logger("bot name not equal first mention name ");
        return { code: 0 };
      }
      const userInput = JSON.parse(params.event.message.content);
      const question = userInput.text.replace("@_user_1", "");
      if (question.trim() == "#清除记忆") {
        clearSession(sessionId);
        await reply(messageId, "记忆已清除");
        return { code: 0 };
      }
      const prompt = buildSessionQuery(sessionId, question);
      const openaiResponse = await getOpenAIReply(prompt);
      saveSession(sessionId, question, openaiResponse)
      await reply(messageId, openaiResponse);
      return { code: 0 };
    }
  }

  logger("return without other log");
  return {
    code: 2,
  };
};
