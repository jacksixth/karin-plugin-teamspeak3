import { karin, segment, logger } from "node-karin";
import teamspeak3 from "./ts3.js";
import { setNoticeGroup } from "../utils/index.js";
const loggerPluginName = logger.chalk.hex("#90CAF9")(" ===== ts3 ===== ");
/**
 * 渲染ts3服务器内存在用户的列表
 * 触发指令: 人数（支持 / 或 # 前缀）
 */
export const image = karin.command(/^[/#]?人数$/, async (e) => {
    try {
        const list = await teamspeak3.getAllChannelList();
        if (list) {
            await e.reply(segment.text(list));
        }
        else {
            await e.reply(segment.text("获取频道列表失败,可能是连接ts3服务器失败"));
        }
        return true;
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
/**
 * 开启/关闭当前群聊的ts通知
 * 仅群主、管理员或karin的主人/管理员可以操作
 */
const toggleNotice = async (e, enable) => {
    if (!e.isGroup) {
        await e.reply(segment.text("该指令仅限群聊使用"));
        return true;
    }
    if (!e.hasPermission("group.admin")) {
        await e.reply(segment.text("只有群主或管理员才能开启或关闭 TS 通知"));
        return true;
    }
    const groupId = e.groupId;
    const result = setNoticeGroup(groupId, enable);
    let message;
    switch (result) {
        case "read-error":
            message = "配置读取失败，请检查 config.json 是否存在且格式正确";
            break;
        case "write-error":
            message = "配置写入失败，请检查 config.json 是否可写";
            break;
        case "added":
            message = "已开启本群 TS 进出通知";
            break;
        case "removed":
            message = "已关闭本群 TS 进出通知";
            break;
        case "exists":
            message = "本群已开启 TS 进出通知，无需重复开启";
            break;
        case "missing":
            message = enable
                ? "未获取到本群群号，无法开启 TS 通知"
                : "本群未开启 TS 进出通知";
            break;
    }
    logger.info(loggerPluginName +
        `群 ${groupId} ${enable ? "开启" : "关闭"}ts通知: ${result}`);
    await e.reply(segment.text(message));
    return true;
};
/**
 * 开启ts通知
 * 触发指令: 开启ts通知（支持 / 或 # 前缀）
 */
export const enableNotice = karin.command(/^[/#]?开启ts通知$/i, async (e) => toggleNotice(e, true), {
    priority: 9999,
    log: true,
    name: "开启ts通知",
    permission: "all",
});
/**
 * 关闭ts通知
 * 触发指令: 关闭ts通知（支持 / 或 # 前缀）
 */
export const disableNotice = karin.command(/^[/#]?关闭ts通知$/i, async (e) => toggleNotice(e, false), {
    priority: 9999,
    log: true,
    name: "关闭ts通知",
    permission: "all",
});
