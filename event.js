// @see https://docs.aircode.io/guide/functions/
const aircode = require('aircode')
const lark = require('@larksuiteoapi/node-sdk')
var axios = require('axios')
const EventDB = aircode.db.table('event')

const client = new lark.Client({
  appId: process.env.APPID,
  appSecret: process.env.SECRET,
  disableTokenCache: false
})
//用于存放历史问答，写死支持10个，下面有判断
const historyQuestion = []
const historyQuestionGroup = []

// 回复消息
async function reply(messageId, content) {
  return await client.im.message.reply({
    path: {
      message_id: messageId
    },
    data: {
      content: JSON.stringify({
        text: content
      }),
      msg_type: 'text'
    }
  })
}

// 通过 OpenAI API 获取回复
async function getOpenAIReply(content) {
  var prompt =
    '你是 ChatGPT, 一个由 OpenAI 训练的大型语言模型, 你旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。\n请回答我下面的问题\nQ: ' +
    content +
    '\nA: '

  var data = JSON.stringify({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 1024,
    temperature: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    top_p: 1,
    stop: ['#']
  })

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.openai.com/v1/completions',
    headers: {
      Authorization: `Bearer ${process.env.KEY}`,
      'Content-Type': 'application/json'
    },
    data: data
  }

  const response = await axios(config)
  // 去除多余的换行
  return response.data.choices[0].text.replace('\n\n', '')
}

module.exports = async function (params, context) {
  // 处理飞书开放平台的服务端校验
  if (params.type == 'url_verification') {
    return {
      challenge: params.challenge
    }
  }
  // 处理飞书开放平台的事件回调
  if ((params.header.event_type = 'im.message.receive_v1')) {
    let eventId = params.header.event_id
    let messageId = params.event.message.message_id

    // 对于同一个事件，只处理一次
    const count = await EventDB.where({ event_id: eventId }).count()
    if (count != 0) {
      return { code: 1 }
    }
    await EventDB.save({ event_id: eventId })

    // 私聊直接回复
    if (params.event.message.chat_type == 'p2p') {
      // 不是文本消息，不处理
      if (params.event.message.message_type != 'text') {
        await reply(messageId, '暂不支持其他类型的提问')
      }
      const historyText = historyQuestion.join(' ')
      // 是文本消息，直接回复
      const userInput = JSON.parse(params.event.message.content)

      const openaiResponse = await getOpenAIReply(
        `${historyText}\nHuman: ${userInput.text}`
      )

      historyQuestion.push(`\nHuman: ${userInput}\nAI: ${openaiResponse}`)
      //最多存10个问答
      if (historyQuestion.length > 10) {
        historyQuestion = historyQuestion.slice(1, historyQuestion.length)
      }
      await reply(messageId, openaiResponse)
    }

    // 群聊，需要 @ 机器人
    if (params.event.message.chat_type == 'group') {
      // 这是日常群沟通，不用管
      if (
        !params.event.message.mentions ||
        params.event.message.mentions.length == 0
      ) {
        return { code: 0 }
      }
      // 没有 mention 机器人，则退出。
      if (params.event.message.mentions[0].name != process.env.BOTNAME) {
        return { code: 0 }
      }
      const userInput = JSON.parse(params.event.message.content)
      const historyText = historyQuestionGroup.join(' ')
      const question = userInput.text.replace('@_user_1', '')
      const openaiResponse = await getOpenAIReply(
        `${historyText}\nHuman: ${question}`
      )
      historyQuestionGroup.push(`\nHuman: ${question}\nAI: ${openaiResponse}`)
      if (historyQuestionGroup.length > 10) {
        historyQuestionGroup = historyQuestionGroup.slice(
          1,
          historyQuestionGroup.length
        )
      }
      await reply(messageId, openaiResponse)
      return { code: 0 }
    }
  }
  return {
    code: 2
  }
}
