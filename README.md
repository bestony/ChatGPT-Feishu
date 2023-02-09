# ChatGPT-Feishu
给飞书用户准备的 ChatGPT 机器人。视频演示如下，生成略慢，请耐心等待~

## 效果

<video src="https://postimg.aliavv.com/picgo/202302100113456.mp4"/>

## 如何使用本项目代码？

> 视频教程见 -> 

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

### 3. 配置环境变量

接下来我们来配置环境变量，你需要配置三个环境变量 `APPID` 、`SECRET` 和 `BOTNAME`，APPID 填写你刚刚在飞书开放平台获取的 APPID，SECRET 填写你在飞书开放平台获取到的 SECRET，BOTNAME 填写你的机器人的名字。

![image-20230210013355689](https://postimg.aliavv.com/picgo/202302100133798.png)

配置完成后，点击上方的 **Deploy** 按钮部署，使这些环境变量生效。

![image-20230210013518142](https://postimg.aliavv.com/picgo/202302100135209.png)

会变成这样的

![image-20230210013603084](https://postimg.aliavv.com/picgo/202302100136124.png)

### 4. 获取 OpenAI 的 KEY ，并配置环境变量

访问 [Account API Keys - OpenAI API](https://platform.openai.com/account/api-keys) ，点击这里的 Create new secret key ，创建一个新的 key ，并保存备用。

![image-20230210013702015](https://postimg.aliavv.com/picgo/202302100137078.png)

重新回到 Aircode， 配置一个名为 `KEY` 的环境变量，并填写你刚刚生成的 Key 。配置完成后，点击部署使其生效。

![image-20230210022322720](https://postimg.aliavv.com/picgo/202302100223839.png)

### 5. 开启权限并配置事件

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

### 6. 发布版本，等待审核

上述这些都配置完成后，你的机器人就配置好了，接下来只需要在飞书开放平台后台找到应用发布，创建一个全新的版本并发布版本即可。

## 如何贡献？

欢迎通过 issue 提交你的想法，帮助我迭代这个项目 or 直接通过 Pull Request 来提交你的代码。发布成功后，你就可以在飞书当中体验 ChatGPT 了。

![image-20230210022834052](https://postimg.aliavv.com/picgo/202302100228159.png)



## LICENSE

[GPLv3](LICENSE)