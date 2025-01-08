import { QueryProtocol, TeamSpeak } from "ts3-nodejs-library"
import { config } from "../utils/index.js"
import karin, { logger, segment } from "node-karin"
import moment from "node-karin/moment"
const disNotifyNameList = [config().NICKNAME, ...config()?.DIS_NOTIFY_NAME_LIST]
class ts3 {
  teamspeak: undefined | TeamSpeak
  connectTimer = 0
  init = async () => {
    logger.info("初始化ts3插件")
    const TS = config()
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
      logger.info("ts3连接成功")
      if (!this.teamspeak) {
        this.teamspeak = _teamspeak
        this.getAllChannelList()
      }
    })
    _teamspeak.on("close", (e) => {
      logger.error("ts3连接断开", e)
      if (this.connectTimer < TS.RECONNECT_TIMER) {
        this.connectTimer++
        if (this.teamspeak) {
          logger.info("重连中...")
          this.teamspeak.reconnect().catch((e) => {
            logger.error("连接TS3失败", e)
          })
        }
      }
    })
    _teamspeak.on("error", (err) => {
      logger.error("ts3连接出错", err)
      if (this.connectTimer < TS.RECONNECT_TIMER) {
        this.connectTimer++
        if (this.teamspeak) {
          logger.info("重连中...")
          this.teamspeak.reconnect().catch((e) => {
            logger.error("连接TS3失败", e)
          })
        }
      }
    })
    _teamspeak.on("clientconnect", (e) => {
      if (!disNotifyNameList.includes(e.client.nickname)) {
        logger.info(e.client.nickname + "进入ts")
        const msg = segment.text(e.client.nickname + "进入ts")
        const qq = config().BOT_SELF_ID
        config().NOTICE_GROUP_NO.forEach((groupNo) => {
          const contact = karin.contact("group", groupNo)
          karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
        })
      }
    })
    _teamspeak.on("clientdisconnect", (e) => {
      if (e.client) {
        if (!disNotifyNameList.includes(e.client.nickname)) {
          logger.info(e.client.nickname + "离开ts")
          const msg = segment.text(e.client.nickname + "离开ts")
          config().NOTICE_GROUP_NO.forEach((groupNo) => {
            const contact = karin.contact("group", groupNo)
            karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
          })
        }
      }
    })
  }
  //获取ts3服务器的所有对应频道的人
  getAllChannelList = async () => {
    if (!this.teamspeak) {
      return
    }
    const usePuppeteer = config().USE_PUPPETEER || false

    const renderList = [] as string[]
    renderList.push(
      usePuppeteer
        ? `<h1>${config().SERVER_NAME || "TeamSpeak服务器"}</h1>`
        : `====${config().SERVER_NAME || "TeamSpeak服务器"}====`
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
}

const teamspeak3 = new ts3()
teamspeak3.init()
export default teamspeak3
