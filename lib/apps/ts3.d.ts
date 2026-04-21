import { Query } from "teamspeak.js";
declare class ts3 {
    teamspeak: undefined | Query;
    connectTimer: number;
    private isReConnecting;
    init: () => Promise<void>;
    getAllChannelList: () => Promise<string | undefined>;
    quitTs: () => Promise<void>;
    private handelReconnect;
}
declare const teamspeak3: ts3;
export declare const getAllUserList: () => Promise<{
    name: string;
    res: {
        [name: string]: {
            nickName: string;
            lastconnected: string;
            connectTime: string;
        }[];
    };
    count: number;
} | null>;
export default teamspeak3;
