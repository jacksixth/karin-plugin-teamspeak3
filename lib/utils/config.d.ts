import { Config } from "../../config/config/config.d";
export declare const dir: string;
export declare const dirConfig: string;
/**
 * @description 配置文件
 */
export declare const config: () => Config;
export type NoticeGroupResult = "added" | "removed" | "exists" | "missing" | "read-error" | "write-error";
/**
 * @description 开启/关闭某个群的ts通知
 * @param groupId 群号 QQBot适配器下为群openid
 * @param enable true开启 false关闭
 */
export declare const setNoticeGroup: (groupId: string, enable: boolean) => NoticeGroupResult;
/**
 * @description package.json
 */
export declare const pkg: () => any;
