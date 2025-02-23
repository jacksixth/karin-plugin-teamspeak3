import { TeamSpeak } from "ts3-nodejs-library";
declare class ts3 {
    teamspeak: undefined | TeamSpeak;
    connectTimer: number;
    init: () => Promise<void>;
    getAllChannelList: () => Promise<string | undefined>;
    quitTs: () => Promise<void>;
    reconnectTs: () => Promise<void>;
}
declare const teamspeak3: ts3;
export declare const getAllUserList: () => Promise<{
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
