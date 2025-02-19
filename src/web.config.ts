import { Config } from "config/config/config"
import { components } from "node-karin"

export default {
  info: {
    // 插件信息配置
  },
  /** 动态渲染的组件 */
  components: () => [
    components.divider.create("divider1"),
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: Config) => {
    console.log("保存的配置:", config)
    // 在这里处理保存逻辑
    return {
      success: true,
      message: "保存成功",
    }
  },
}
