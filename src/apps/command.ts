import { config, dirPath } from "../utils/index.js"
import { karin, common, segment, logger } from "node-karin"
import teamspeak3 from "./ts3.js"
const loggerPluginName = logger.chalk.hex("#90CAF9")(" ===== ts3 ===== ")
/**
 * 渲染ts3服务器内存在用户的列表
 * 触发指令: 人数
 */
export const image = karin.command(
  /^#?人数$/,
  async (e) => {
    try {
      const list = await teamspeak3.getAllChannelList()
      if (list) {
        await e.reply(segment.markdown(list))
      } else {
        await e.reply(
          segment.text("获取频道列表失败,可能是连接ts3服务器失败")
        )
      }
      return true
    } catch (error) {
      logger.error(loggerPluginName, error)
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
    name: "显示ts服务器内人数",
    /** 谁可以触发这个插件 'all' | 'master' | 'admin' | 'group.owner' | 'group.admin' */
    permission: "all",
  }
)
