# karin-plugin-teamspeak3

karin 下的 [teamspeak](https://www.teamspeak.com/zh-CN/) 插件，使用 ts 开发。
需要搭配 [karin](https://karin.fun/) 使用。
在用户进入离开 ts 服务器时在群里发送用户进出提示
也会响应 QQ 群或私聊的 `人数` 命令发送当前服务器内有人在的频道的人数和进入时长

# 使用方法

1. 安装该插件
   - `包管理器` 可以通过 `pnpm add karin-plugin-teamspeak@latest -w` 安装
   - `使用编译产物` 可以 clone 该仓库的 build 分支 `git clone --depth=1 -b build https://github.com/jacksixth/karin-plugin-teamspeak3.git ./plugins/karin-plugin-teamspeak/`，然后通过运行 `pnpm install --filter=karin-plugin-teamspeak` 安装
2. 运行 `npx karin .`
3. 在 karin web 界面的插件页签中配置该插件
4. 保存配置后查看命令行是否成功连接服务器
