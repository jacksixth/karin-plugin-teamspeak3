import { readFileSync, writeFileSync } from "node:fs";
import { dirPath, basename } from "./index.js";
import { watch, logger, basePath, filesByExt, copyConfigSync, requireFileSync, clearRequireFile, } from "node-karin";
import teamspeak3 from "../apps/ts3.js";
export const dir = `${basePath}/${basename}`;
export const dirConfig = `${dir}/config`;
const configFile = `${dirConfig}/config.json`;
const defDir = `${dirPath}/config`;
const defConfig = `${defDir}/config`;
/** 最近一次读写的原始配置 用于判断是否需要重连ts3 */
let lastConfig = null;
/**
 * @description 初始化配置文件
 */
copyConfigSync(defConfig, dirConfig, [".json"]);
/**
 * @description 配置文件
 */
export const config = () => {
    const cfg = requireFileSync(`${dirConfig}/config.json`);
    const def = requireFileSync(`${defConfig}/config.json`);
    return { ...def, ...cfg };
};
/**
 * @description 读取原始配置文件 绕过require缓存
 * 解析失败时不能返回空对象 否则写回会丢失用户已有配置
 */
const readConfigFile = () => {
    try {
        const config = JSON.parse(readFileSync(configFile, "utf-8"));
        if (!config || typeof config !== "object" || Array.isArray(config)) {
            return { ok: false, error: new Error("配置文件内容不是对象") };
        }
        return { ok: true, config: config };
    }
    catch (error) {
        return { ok: false, error };
    }
};
/**
 * @description 写回配置文件并清理缓存
 */
const writeConfigFile = (cfg) => {
    try {
        writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
        lastConfig = cfg;
        clearRequireFile(configFile);
        return true;
    }
    catch (error) {
        logger.error("ts3 配置文件写入失败:", error);
        return false;
    }
};
/**
 * @description 开启/关闭某个群的ts通知
 * @param groupId 群号 QQBot适配器下为群openid
 * @param enable true开启 false关闭
 */
export const setNoticeGroup = (groupId, enable) => {
    if (!groupId)
        return "missing";
    const read = readConfigFile();
    if (!read.ok) {
        logger.error("ts3 配置文件读取失败:", read.error);
        return "read-error";
    }
    const cfg = read.config;
    const groups = (cfg.NOTICE_GROUP_NO ?? []).map(String);
    if (enable) {
        if (groups.includes(groupId))
            return "exists";
        groups.push(groupId);
    }
    else {
        const index = groups.indexOf(groupId);
        if (index === -1)
            return "missing";
        groups.splice(index, 1);
    }
    cfg.NOTICE_GROUP_NO = groups;
    if (!writeConfigFile(cfg))
        return "write-error";
    return enable ? "added" : "removed";
};
/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${dirPath}/package.json`);
/** 修改这些配置后需要重连ts3 */
const reconnectKeys = [
    "HOST",
    "PROTOCOL",
    "QUERY_PORT",
    "SERVER_PORT",
    "USERNAME",
    "PASSWORD",
    "NICKNAME",
    "RECONNECT_TIMER",
    "DIS_NOTIFY_NAME_LIST",
];
const needReconnect = (old, now) => {
    if (!old || !now)
        return true;
    return reconnectKeys.some((key) => JSON.stringify(old[key]) !== JSON.stringify(now[key]));
};
/**
 * @description 监听配置文件
 */
setTimeout(() => {
    const list = filesByExt(dirConfig, ".json", "abs");
    list.forEach((file) => watch(file, (old, now) => {
        logger.info("旧数据:\n", old);
        logger.info("新数据:\n", now);
        const prev = lastConfig ?? old;
        lastConfig = now ?? null;
        // 仅通知群号变化时无需重连 事件监听中会实时读取最新配置
        if (needReconnect(prev, now)) {
            teamspeak3.init();
        }
    }));
}, 2000);
