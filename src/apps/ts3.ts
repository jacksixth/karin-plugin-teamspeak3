import { QueryProtocol, TeamSpeak } from "ts3-nodejs-library"
import { config, dirPath } from "../utils/index.js"
import karin, { logger, render, segment, app } from "node-karin"
import moment from "node-karin/moment"
import express from "node-karin/express"
const loggerHex = logger.chalk.hex("#90CAF9")
logger.info(loggerHex(" ===== ts3 ===== ") + "初始化ts3插件")
let disNotifyNameList: string[] = []
class ts3 {
  teamspeak: undefined | TeamSpeak
  connectTimer = 0
  //初始化 如果已经有连接了就关闭连接重新连接
  init = async () => {
    const TS = config()
    //fix ReferenceError: Cannot access 'config' before initialization
    disNotifyNameList = [TS.NICKNAME, ...TS.DIS_NOTIFY_NAME_LIST]
    logger.info(loggerHex(" ===== ts3 ===== ") + "开始连接ts3服务器...")
    if (this.teamspeak) {
      await this.teamspeak.quit()
      this.teamspeak = undefined
    }
    const _teamspeak = new TeamSpeak({
      host: TS.HOST,
      protocol: QueryProtocol[TS.PROTOCOL],
      queryport: TS.QUERY_PORT,
      serverport: TS.SERVER_PORT,
      username: TS.USERNAME,
      password: TS.PASSWORD,
      nickname: TS.NICKNAME,
    })
    _teamspeak.on("ready", async () => {
      logger.info(loggerHex(" ===== ts3 ===== ") + "ts3连接成功")
      this.teamspeak = _teamspeak
    })
    _teamspeak.on("close", (e) => {
      logger.error(loggerHex(" ===== ts3 ===== ") + "ts3连接断开", e)
      if (this.teamspeak) {
        logger.info(loggerHex(" ===== ts3 ===== ") + "重连中...")
        this.teamspeak
          .reconnect(TS.RECONNECT_TIMER, 1000)
          .catch((e) => {
            logger.error(loggerHex(" ===== ts3 ===== ") + "连接TS3失败", e)
          })
          .then(() => {
            logger.info(loggerHex(" ===== ts3 ===== ") + "重连成功")
          })
      }
    })
    _teamspeak.on("error", (err) => {
      logger.error(loggerHex(" ===== ts3 ===== ") + "ts3连接出错", err)
      if (this.teamspeak) {
        logger.info(loggerHex(" ===== ts3 ===== ") + "重连中...")
        this.teamspeak
          .reconnect(TS.RECONNECT_TIMER, 1000)
          .catch((e) => {
            logger.error(loggerHex(" ===== ts3 ===== ") + "连接TS3失败", e)
          })
          .then(() => {
            logger.info(loggerHex(" ===== ts3 ===== ") + "重连成功")
          })
      }
    })
    _teamspeak.on("clientconnect", (e) => {
      if (!disNotifyNameList.includes(e.client.nickname)) {
        logger.info(
          loggerHex(" ===== ts3 ===== ") + e.client.nickname + "进入ts"
        )
        const msg = segment.text(e.client.nickname + "进入ts")
        const qq = TS.BOT_SELF_ID
        TS.NOTICE_GROUP_NO.forEach((groupNo) => {
          const contact = karin.contact("group", groupNo + "")
          karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
        })
      }
    })
    _teamspeak.on("clientdisconnect", (e) => {
      if (e.client) {
        if (!disNotifyNameList.includes(e.client.nickname)) {
          logger.info(
            loggerHex(" ===== ts3 ===== ") + e.client.nickname + "离开ts"
          )
          const msg = segment.text(e.client.nickname + "离开ts")
          TS.NOTICE_GROUP_NO.forEach((groupNo) => {
            const contact = karin.contact("group", groupNo + "")
            karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
          })
        }
      }
    })
  }
  //获取ts3服务器的所有对应频道的人 -- 并组装成文字可直接发
  getAllChannelList = async () => {
    if (!this.teamspeak) {
      return
    }
    //默认尝试使用渲染器，调用失败则表示未连接渲染器
    let usePuppeteer = false
    // try {
    //   render.App()
    // } catch (error) {
    //   usePuppeteer = false
    // }
    const TS = config()
    const renderList = [] as string[]
    renderList.push(
      usePuppeteer
        ? `<h1>${TS.SERVER_NAME || TS.HOST}</h1>`
        : `====${TS.SERVER_NAME || TS.HOST}====`
    )
    renderList.push(
      usePuppeteer
        ? `<div class="tips">仅展示有人的频道</div>`
        : `仅展示有人的频道 `
    )
    if (!usePuppeteer) {
      //不渲染成图片就使用=====分割频道
      renderList.push(`======`)
    }
    const channelList = await this.teamspeak.channelList() //所有频道
    let count = 0
    for (let index = 0; index < channelList.length; index++) {
      const channel = channelList[index] //频道
      const allClient = await channel.getClients() //在当前频道的人
      //排除不显示的人
      const clients = allClient.filter(
        (c) => !disNotifyNameList.includes(c.nickname)
      )
      count += clients.length
      if (clients.length == 0) continue
      renderList.push(
        usePuppeteer ? `<ul>${channel.name}` : ` ${channel.name} `
      )
      for (let index = 0; index < clients.length; index++) {
        const client = clients[index]
        const connectTimeSec = moment().diff(
          moment.unix(client.lastconnected),
          "second"
        )
        let connectTime = `(${Math.floor(connectTimeSec / 60)}:${Math.floor(
          connectTimeSec % 60
        )}) `
        renderList.push(
          usePuppeteer
            ? `<li>${client.nickname} ${connectTime}</li>`
            : `- ${client.nickname} ${connectTime}`
        )
      }
      if (!usePuppeteer) {
        //不渲染成图片就使用=====分割频道
        renderList.push(`======`)
      } else {
        renderList.push("</ul>")
      }
    }
    renderList.splice(
      2,
      0,
      usePuppeteer
        ? `<div class="count">当前频道内共有${count}人</div>`
        : `当前频道内共有${count}人`
    )
    return usePuppeteer ? renderList.join("") : renderList.join("\n")
  }
  //关闭连接
  quitTs = async () => {
    if (this.teamspeak) {
      this.teamspeak.quit()
    }
  }
  //重新连接
  reconnectTs = async () => {
    if (this.teamspeak) {
      this.teamspeak.reconnect(config().RECONNECT_TIMER, 1000)
    }
  }
}
const teamspeak3 = new ts3()
setTimeout(() => {
  //确保配置文件生成且正确保存
  teamspeak3.init()
}, 1000)

//获取ts3服务器内所有频道内在线人数 -- 给接口用
export const getAllUserList = async () => {
  if (teamspeak3.teamspeak) {
    let count = 0
    const res = {} as {
      [name: string]: Array<{
        nickName: string
        lastconnected: string
        connectTime: string
      }>
    }
    const channelList = await teamspeak3.teamspeak.channelList() //所有频道
    for (let index = 0; index < channelList.length; index++) {
      const channel = channelList[index] //频道
      const allClient = await channel.getClients() //在当前频道的人
      //排除不显示的人
      const clients = allClient.filter(
        (c) => !disNotifyNameList.includes(c.nickname)
      )
      count += clients.length
      res[channel.name] = clients.map((c) => {
        const connectTimeSec = moment().diff(
          moment.unix(c.lastconnected),
          "second"
        )
        let connectTime = `${Math.floor(connectTimeSec / 60)}:${Math.floor(
          connectTimeSec % 60
        )}`
        return {
          nickName: c.nickname, //昵称
          lastconnected: moment
            .unix(c.lastconnected)
            .format("YYYY-MM-DD HH:mm:ss"), //上次连接进来的时间
          connectTime, //已经连接的时间 - 单位分:秒
        }
      })
    }
    return {
      res,
      count,
    }
  } else {
    return null
  }
}
const router = express.Router()
router.get("/getAllUserList", async (req, res) => {
  const result = await getAllUserList()
  res.send(result)
})
app.use("/ts3Api", router)
app.use(express.static(dirPath + "/resources/static"))

export default teamspeak3
