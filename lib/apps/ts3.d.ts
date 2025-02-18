import { TeamSpeak } from "ts3-nodejs-library";
declare class ts3 {
    teamspeak: undefined | TeamSpeak;
    connectTimer: number;
    init: () => Promise<void>;
    getAllChannelList: () => Promise<string | undefined>;
}
declare const teamspeak3: ts3;
export default teamspeak3;
