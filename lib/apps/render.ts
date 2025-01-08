import { dirPath } from "../utils/index.js"
import { karin, render, common, segment, logger } from "node-karin"
import teamspeak3 from "./ts3.js"
/**
 * 渲染ts3服务器内存在用户的列表
 * 触发指令: 人数
 */
export const image = karin.command(
  /^#?人数$/,
  async (e) => {
    try {
      const filePath = common.absPath(dirPath + "/resources")
      const bg = filePath + "/image/bg.png"
      const html = filePath + "/template/ts3.html"
      const list = await teamspeak3.getAllChannelList()
      if (list) {
        const img = await render.render({
          name: "ts3",
          file: html,
          data: {
            render: list,
            bg: bg,
          },
          pageGotoParams: {
            waitUntil: "networkidle2",
          },
        })
        await e.reply(segment.image("base64://" + img))
        return true
      } else {
        await e.reply(segment.text("获取频道列表失败,可能是连接ts3服务器失败"))
        return false
      }
    } catch (error) {
      logger.error(error)
      await e.reply(JSON.stringify(error))
      return true
    }
  },
  {
    /** 插件优先级 */
    priority: 9999,
    /** 插件触发是否打印触发日志 */
    log: true,
    /** 插件名称 */
    name: "显示ts3内人数",
    /** 谁可以触发这个插件 'all' | 'master' | 'admin' | 'group.owner' | 'group.admin' */
    permission: "all",
  }
)
