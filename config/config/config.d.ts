// 定义 config.json 的类型
export interface Config {
  BOT_SELF_ID: number //当前机器人的QQ号
  //ts的连接信息
  HOST: string //ts3服务器地址
  PROTOCOL: "RAW" | "SSH" //ts3服务器协议 RAW 或是 SSH 一般默认RAW不用改
  QUERY_PORT: number //ts3服务器查询端口
  SERVER_PORT: number //ts3服务器语音端口
  USERNAME: string //ts3服务器admin账号 创建时出现的那个
  PASSWORD: string //ts3服务器admin密码  创建时出现的那个
  NICKNAME: string //连接到ts3服务器使用的用户名 -- 不会显式出现在ts3服务器中可通过查询api查看到
  NOTICE_GROUP_NO: number[] //通知用户进出ts3的群号 可多个
  RECONNECT_TIMER: number //断线重连次数 -1表示将不断尝试
  DIS_NOTIFY_NAME_LIST: string[] //不提醒的昵称列表 可多个 默认不提醒当前加入ts的机器人
  SERVER_NAME: string //展示的服务器名
  ENABLE_CHANNEL_MOVE_NOTIFY: string //是否开启移动频道播报功能 ("true" | "false")
}
