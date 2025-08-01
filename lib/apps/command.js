import { dirPath } from "../utils/index.js";
import { karin, render, common, segment, logger } from "node-karin";
import teamspeak3 from "./ts3.js";
const loggerPluginName = logger.chalk.hex("#90CAF9")(" ===== ts3 ===== ");
/**
 * 渲染ts3服务器内存在用户的列表
 * 触发指令: 人数
 */
export const image = karin.command(/^#?人数$/, async (e) => {
    try {
        //默认尝试使用渲染器，调用失败则表示未连接将使用文字形式发送服务器人数
        let usePuppeteer = false;
        // try {
        //   render.App()
        // } catch (error) {
        //   usePuppeteer = false
        // }
        if (usePuppeteer) {
            const filePath = common.absPath(dirPath + "/resources");
            const bg = filePath + "/image/bg.png";
            const html = filePath + "/template/ts3.html";
            const list = await teamspeak3.getAllChannelList();
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
                });
                await e.reply(segment.image("base64://" + img));
            }
            else {
                await e.reply(segment.text("获取频道列表失败,可能是连接ts3服务器失败"));
            }
            return true;
        }
        else {
            const list = await teamspeak3.getAllChannelList();
            if (list) {
                await e.reply(segment.text(list));
            }
            else {
                await e.reply(segment.text("获取频道列表失败,可能是连接ts3服务器失败"));
            }
            return true;
        }
    }
    catch (error) {
        logger.error(loggerPluginName, error);
        await e.reply(JSON.stringify(error));
        return true;
    }
}, {
    /** 插件优先级 */
    priority: 9999,
    /** 插件触发是否打印触发日志 */
    log: true,
    /** 插件名称 */
    name: "显示ts服务器内人数",
    /** 谁可以触发这个插件 'all' | 'master' | 'admin' | 'group.owner' | 'group.admin' */
    permission: "all",
});
