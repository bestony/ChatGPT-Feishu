# ChatGPT-Feishu
给飞书用户准备的 ChatGPT 机器人。视频演示如下，生成略慢，请耐心等待~



## 效果


https://user-images.githubusercontent.com/13283837/217905601-6e1ff237-5275-4deb-8135-3071b1e977a8.mp4


## 如何使用本项目代码？

> 视频教程见 -> https://youtu.be/axvH1D0Dhnk | https://www.bilibili.com/video/BV1uT411R7TL/

### 1. 创建一个飞书开放平台应用，并获取到 APPID 和 Secret

访问 [开发者后台](https://open.feishu.cn/app?lang=zh-CN)，创建一个名为 **ChatGPT** 的应用，并上传应用头像。创建完成后，访问【凭证与基础信息】页面，复制 APPID 和 Secret 备用。

![image-20230210012031179](https://postimg.aliavv.com/picgo/202302100120339.png)

### 2. 开启机器人能力

打开应用的机器人应用功能

![image-20230210012110735](https://postimg.aliavv.com/picgo/202302100121008.png)

### 3. 访问 [AirCode](https://aircode.io/dashboard) ，创建一个新的项目

登录 [AirCode](https://aircode.io/dashboard) ，创建一个新的 Node.js v16 的项目，项目名可以根据你的需要填写，可以填写 ChatGPT

![image-20230210012334145](https://postimg.aliavv.com/picgo/202302100123254.png)

### 4. 复制本项目下的 event.js 的源码内容，并粘贴到 Aircode 当中

访问[ChatGPT-Feishu/event.js at master · bestony/ChatGPT-Feishu (github.com)](https://github.com/bestony/ChatGPT-Feishu/blob/master/event.js)，复制代码

![image-20230210012555571](https://postimg.aliavv.com/picgo/202302100125750.png)

并把代码粘贴到 AIrcode 默认创建的 hello.js 。然后点击顶部的 deploy ，完成第一次部署。

![image-20230210012653296](https://postimg.aliavv.com/picgo/202302100126536.png)

部署成功后，可以在下方看到。

![image-20230210012808063](https://postimg.aliavv.com/picgo/202302100128288.png)



### 5. 安装所需依赖

这个开发过程中，我们使用了飞书开放平台官方提供的 SDK，以及 axios 来完成调用。点击页面左下角的包管理器，安装 `axios` 和 `@larksuiteoapi/node-sdk`。安装完成后，点击上方的部署，使其生效。

![image-20230210025955556](https://postimg.aliavv.com/picgo/202302100259761.png)

### 6. 配置环境变量

接下来我们来配置环境变量，你需要配置三个环境变量 `APPID` 、`SECRET` 和 `BOTNAME`，APPID 填写你刚刚在飞书开放平台获取的 APPID，SECRET 填写你在飞书开放平台获取到的 SECRET，BOTNAME 填写你的机器人的名字。

> 配置环境变量可能会失败，可以多 deploy 几次，确保配置成功。

![image-20230210013355689](https://postimg.aliavv.com/picgo/202302100133798.png)

配置完成后，点击上方的 **Deploy** 按钮部署，使这些环境变量生效。

![image-20230210013518142](https://postimg.aliavv.com/picgo/202302100135209.png)

会变成这样的

![image-20230210013603084](https://postimg.aliavv.com/picgo/202302100136124.png)

### 7. 获取 OpenAI 的 KEY ，并配置环境变量

访问 [Account API Keys - OpenAI API](https://platform.openai.com/account/api-keys) ，点击这里的 Create new secret key ，创建一个新的 key ，并保存备用。

![image-20230210013702015](https://postimg.aliavv.com/picgo/202302100137078.png)

重新回到 Aircode， 配置一个名为 `KEY` 的环境变量，并填写你刚刚生成的 Key 。配置完成后，点击部署使其生效。

![image-20230210022322720](https://postimg.aliavv.com/picgo/202302100223839.png)

### 8. 开启权限并配置事件

访问开放平台页面，开通如下 6 个权限：

- im:message
- im:message.group_at_msg
- im:message.group_at_msg:readonly
- im:message.p2p_msg
- im:message.p2p_msg:readonly
- im:message:send_as_bot

![image-20230210022432066](https://postimg.aliavv.com/picgo/202302100224325.png)

然后回到 AirCode ，复制函数的调用地址。

![image-20230210022628784](https://postimg.aliavv.com/picgo/202302100226846.png)

然后回到事件订阅界面，添加事件。

![image-20230210022720552](https://postimg.aliavv.com/picgo/202302100227786.png)

### 9. 发布版本，等待审核

上述这些都配置完成后，你的机器人就配置好了，接下来只需要在飞书开放平台后台找到应用发布，创建一个全新的版本并发布版本即可。

## 如何贡献？

欢迎通过 issue 提交你的想法，帮助我迭代这个项目 or 直接通过 Pull Request 来提交你的代码。发布成功后，你就可以在飞书当中体验 ChatGPT 了。

![image-20230210022834052](https://postimg.aliavv.com/picgo/202302100228159.png)


## 有问题沟通可加群

![飞书20230418-015544](https://user-images.githubusercontent.com/13283837/232570671-1058555f-c9e5-4f64-889b-1d8efd0101ba.png)


## FAQ

### 1. 提交事件订阅地址时提示 Challenge Code 没有返回？
可以看看是不是配置了  Encrypt Key ，暂时不支持对加密数据解密。路径是应用后台 - 事件订阅

![image](https://user-images.githubusercontent.com/13283837/218002249-362a40ab-3f5d-493b-80ec-a2b0efa2b5c9.png)

### 2. 可以私聊回复，但没办法群聊回复？

确保 6 项开放平台权限都已经开通且已经发布版本，权限进入可用状态。

另一情况是飞书机器人名称与 BOTNAME 变量不一致。由于 aircode 的环境变量**不支持中文**，如果机器人名称为中文也会造成部署失败。

解决办法：修改飞书机器人的名称为英文，或直接修改代码中的 BOTNAME 值。

### 3. aircode 提示报错 failed to obtain token?

说明你的 aircode 的环境变量配置没成功，可以重新配置一下，然后再部署一下。

### 4. cannot set propoertis of undefined (setting 'event_type')?

说明你用 HTTP 发起请求 / 或者用了 aircode 的debug 功能，是正常现象。

## LICENSE

[GPLv3](LICENSE)
