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

# 功能

1. 监听 ts 服务器用户进入离开事件，在配置的群聊里发送用户进出提示 如:`xxx进入ts`、`xxx离开ts`
2. 在群聊或私聊发送`人数`时，发送当前服务器内有人在的频道的人数和进入时长 如：
   ```
   ====服务器名====
   仅展示有人的频道
   当前频道内共有4人
   ======
    聊天听歌等待区
   - BOT (29005287:9)
   - xxx (0:4)
   ======
    fps2
   - xxx (0:31)
   ======
    fps3
   - xxx (96:31)
   ======
   ```
3. 可以通过调用接口 `/api/teamspeak/getAllUserList` 来获取当前服务器内所有频道内人数和进入时长包括没人在的频道，返回的数据格式为：

```json
{
  "name": "配置内的服务器名或host",
  "res": "
   {
   频道1:[{
      nickName:'xxx', //昵称
      lastconnected: 'YYYY-MM-DD HH:mm:ss', //上次连接进来的时间
      connectTime:'', //已经连接的时间 - 单位分:秒
   },{},...],
   频道2:[{}],
   频道3:[{}],
   ...
   }",
  "count": "频道内总人数"
}
```
