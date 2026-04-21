import { Query } from "teamspeak.js"
import { config, dirPath } from "../utils/index.js"
import karin, { logger, render, segment, app } from "node-karin"
import moment from "node-karin/moment"
import express from "node-karin/express"
const loggerPluginName = logger.chalk.hex("#90CAF9")(" ===== ts3 ===== ")
logger.info(loggerPluginName + "初始化ts3插件")
let disNotifyNameList: string[] = []
class ts3 {
  teamspeak: undefined | Query
  connectTimer = 0
  private isReConnecting = false
  //初始化 如果已经有连接了就关闭连接重新连接
  init = async () => {
    const TS = config()
    this.isReConnecting = false
    disNotifyNameList = [TS.NICKNAME, ...TS.DIS_NOTIFY_NAME_LIST]
    logger.info(loggerPluginName + "开始连接ts3服务器...")
    if (this.teamspeak) {
      await this.quitTs()
    }
    const _teamspeak = new Query({
      host: "jacksixth.top",
      port: 10011,
      protocol: TS.PROTOCOL == "SSH" ? "ssh" : "tcp",
    })
    _teamspeak.on("Ready", async () => {
      if (this.isReConnecting) {
        logger.info(loggerPluginName + "ts3重连成功")
      } else {
        logger.info(loggerPluginName + "ts3连接成功")
      }
      this.isReConnecting = false
      await _teamspeak.login(TS.USERNAME, TS.PASSWORD)
      await _teamspeak.virtualServers.use(1)
      await _teamspeak.notifications.subscribeAll()
      await _teamspeak.client.setNickname(TS.NICKNAME)
      this.teamspeak = _teamspeak
    })
    _teamspeak.on("Close", () => {
      logger.error(loggerPluginName + "ts3连接断开")
      this.handelReconnect()
    })
    _teamspeak.on("Error", (err) => {
      logger.error(loggerPluginName + "ts3连接出错", err)
    })
    _teamspeak.on("ClientEnterView", (e) => {
      if (e.nickname && !disNotifyNameList.includes(e.nickname)) {
        logger.info(loggerPluginName + e.nickname + "进入ts")
        const msg = segment.text(e.nickname + "进入ts")
        TS.NOTICE_GROUP_NO.forEach((groupNo) => {
          const contact = karin.contact("group", groupNo + "")
          karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
        })
      }
    })
    _teamspeak.on("ClientLeaveView", (e) => {
      if (e.nickname) {
        if (!disNotifyNameList.includes(e.nickname)) {
          logger.info(loggerPluginName + e.nickname + "离开ts")
          const msg = segment.text(e.nickname + "离开ts")
          TS.NOTICE_GROUP_NO.forEach((groupNo) => {
            const contact = karin.contact("group", groupNo + "")
            karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
          })
        }
      }
    })
    // 监听用户移动频道事件
    _teamspeak.on("ClientMove", (e) => {
      if (
        TS.ENABLE_CHANNEL_MOVE_NOTIFY === "true" &&
        e.nickname &&
        e.channel &&
        !disNotifyNameList.includes(e.nickname)
      ) {
        logger.info(
          loggerPluginName + e.nickname + "移动到频道: " + e.channel.name,
        )
        const msg = segment.text(e.nickname + "移动到频道: " + e.channel.name)
        TS.NOTICE_GROUP_NO.forEach((groupNo) => {
          const contact = karin.contact("group", groupNo + "")
          karin.sendMsg(karin.getBotAll()[1].account.selfId, contact, msg)
        })
      }
    })
    _teamspeak.connect()
  }
  //获取ts3服务器的所有对应频道的人 -- 并组装成文字可直接发
  getAllChannelList = async () => {
    if (!this.teamspeak) {
      return
    }
    const TS = config()
    const renderList = [] as string[]
    renderList.push(`====${TS.SERVER_NAME || TS.HOST}====`)
    renderList.push(`仅展示有人的频道 `)
    renderList.push(`======`)
    const channels = await this.teamspeak.channels.fetch() //所有频道
    const channelList = channels.map((i) => i)
    let count = 0
    const allClients = await this.teamspeak.clients.fetch() //所有在线用户
    const allClient = allClients
      .filter((c) => !disNotifyNameList.includes(c.nickname!))
      .map((i) => i) //过滤掉不提醒的用户
    for (let index = 0; index < channelList.length; index++) {
      const channel = channelList[index] //频道
      const clients = allClient.filter((c) => c.channelId == channel.id) //频道内所有用户
      count += clients.length
      if (clients.length == 0) continue
      renderList.push(` ${channel.name} `)
      for (let index = 0; index < clients.length; index++) {
        const client = clients[index]
        if (client.databaseId) {
          const cdb = await this.teamspeak.getRawClientDatabaseProperties(
            client.databaseId,
          )
          const connectTimeSec = moment().diff(
            moment.unix(Number(cdb.client_lastconnected)),
            "second",
          )
          let connectTime = `(${Math.floor(connectTimeSec / 60)}:${Math.floor(
            connectTimeSec % 60,
          )}) `
          renderList.push(`- ${client.nickname} ${connectTime}`)
        }
      }
      renderList.push(`======`)
    }
    renderList.splice(2, 0, `当前频道内共有${count}人`)
    return renderList.join("\n")
  }
  //关闭连接
  quitTs = async () => {
    if (this.teamspeak) {
      try {
        this.teamspeak.removeAllListeners()
        this.teamspeak.destroy()
        this.teamspeak = undefined
      } catch (error) {
        logger.info(loggerPluginName + "关闭连接失败", error)
        this.teamspeak = undefined
      }
    }
  }
  //重连逻辑
  private async handelReconnect() {
    //没走过重连
    if (!this.teamspeak || this.isReConnecting) return
    this.isReConnecting = true
    logger.info(loggerPluginName + "重连中...")
    try {
      this.quitTs()
      await teamspeak3.init()
    } catch (e) {
      logger.error(loggerPluginName + "连接TS3失败", e)
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

    const channels = await teamspeak3.teamspeak.channels.fetch() //所有频道
    const channelList = channels.map((i) => i)
    const allClients = await teamspeak3.teamspeak.clients.fetch()
    const allClient = allClients
      .filter((c) => !disNotifyNameList.includes(c.nickname!))
      .map((i) => i)
    for (let index = 0; index < channelList.length; index++) {
      const channel = channelList[index] //频道
      const clients = allClient.filter((c) => c.channelId == channel.id)
      count += clients.length
      if (channel.name) {
        res[channel.name] = []
        for (let index = 0; index < clients.length; index++) {
          const client = clients[index]
          const cdb = await teamspeak3.teamspeak.getRawClientDatabaseProperties(
            client.databaseId!,
          )
          const connectTimeSec = moment().diff(
            moment.unix(Number(cdb.client_lastconnected)),
            "second",
          )
          let connectTime = `(${Math.floor(connectTimeSec / 60)}:${Math.floor(
            connectTimeSec % 60,
          )}) `
          res[channel.name].push({
            nickName: client.nickname!,
            connectTime,
            lastconnected: moment
              .unix(Number(cdb.client_lastconnected))
              .format("YYYY-MM-DD HH:mm:ss"), //上次连接进来的时间
          })
        }
      }
    }
    return {
      name: config().SERVER_NAME || config().HOST,
      res,
      count,
    }
  } else {
    return null
  }
}
const router = express.Router()
router.get(
  "/getAllUserList",
  async (req: express.Request, res: express.Response) => {
    const result = await getAllUserList()
    res.send(result)
  },
)
//将路由挂载到express实例中
app.use("/api/teamspeak", router)
export default teamspeak3
