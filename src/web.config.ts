import { Config } from "config/config/config"
import { components, logger } from "node-karin"

export default {
  info: {
    // 插件信息配置
  },
  /** 动态渲染的组件 */
  components: () => [
    components.input.string("HOST", {
      label: "teamspeak 服务器地址(不带端口)",
      variant: "underlined",
      placeholder: "请输入服务器地址",
      rules: [
        {
          regex:
            /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
          error: "请输入正确的IP地址",
        },
      ],
    }),
    components.input.string("SERVER_NAME", {
      label: "展示的服务器名(不填写则显示服务器地址)",
      placeholder: "请输入展示的服务器名",
      variant: "underlined",
      isRequired: false,
    }),
    components.radio.group("PROTOCOL", {
      defaultValue: "RAW",
      label: "teamspeak 服务器查询 (一般使用默认的RAW即可)",
      size: "sm",
      orientation: "horizontal",
      radio: [
        {
          componentType: "radio",
          key: "PROTOCOL_RAW",
          value: "RAW",
          label: "RAW",
        },
        {
          componentType: "radio",
          key: "PROTOCOL_SSH",
          value: "SSH",
          label: "SSH",
        },
      ],
    }),
    components.input.number("QUERY_PORT", {
      label: "teamspeak 服务器查询端口 (一般使用默认 10011 即可)",
      type: "number",
      placeholder: "请输入服务器查询端口",
      variant: "underlined",
      defaultValue: "10011",
      rules: [{ min: 1, max: 65535 }],
    }),
    components.input.number("SERVER_PORT", {
      label: "teamspeak 服务器语音端口 (一般使用默认 9987 即可)",
      defaultValue: "9987",
      placeholder: "请输入服务器语音端口",
      variant: "underlined",
      rules: [{ min: 1, max: 65535 }],
    }),
    components.input.number("RECONNECT_TIMER", {
      label: "teamspeak 连接断开后重连次数 (-1表示将不断尝试)",
      defaultValue: "5",
      placeholder: "请输入重连次数",
      variant: "underlined",
      rules: [{ min: -1 }],
    }),
    components.input.string("USERNAME", {
      label:
        "teamspeak 管理员用户名 (建服时出现的,没修改时默认是 serveradmin )",
      defaultValue: "serveradmin",
      placeholder: "请输入管理员用户名",
      variant: "underlined",
    }),
    components.input.string("PASSWORD", {
      label: "teamspeak 管理员密码 (建服时出现的,每个服务器都不一样)",
      placeholder: "请输入管理员密码",
      variant: "underlined",
    }),
    components.input.string("NICKNAME", {
      label:
        "插件连接进服务器时使用的昵称 (默认为TSBOT,···客户端看不到该用户···) ",
      placeholder: "请输入连接昵称",
      defaultValue: "TSBOT",
      variant: "underlined",
    }),
    components.input.group("NOTICE_GROUP_NO", {
      label: "通知用户进出ts3的群号 可多个",
      template: {
        componentType: "input",
        key: "NOTICE_GROUP_NO",
        type: "number",
        variant: "faded",
        placeholder: "请输入群号",
      },
      data: [],
    }),
    components.input.group("DIS_NOTIFY_NAME_LIST", {
      label:
        "不提醒的昵称列表 可多个 (不会提醒当前机器人，无需添加当前机器人昵称)",
      template: {
        componentType: "input",
        key: "DIS_NOTIFY_NAME",
        type: "text",
        variant: "faded",
        placeholder: "请输入昵称",
      },
      data: [],
    }),
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: Config) => {
    console.log("保存的配置:", config)
    logger.info("保存的配置:", config)
    // 在这里处理保存逻辑
    return {
      success: true,
      message: "保存成功",
    }
  },
}
