# karin-plugin-template

karin 下的 teamspeak3 插件，使用ts开发。
需要搭配 [karin](https://karin.fun/) 使用。karin版本: 0.12.25-beta.pr.206.1-1735239377
在用户进入离开ts服务器时在群里发送用户进出提示
也会响应QQ群或私聊的 `人数` 命令发送当前服务器内有人在的频道的人数和进入时长

## 拉取

```bash
git clone https://github.com/karinjs/karin-plugin-template.git
```

## 安装依赖

```bash
pnpm i
```

## 运行karin

回到项目根目录下 运行 `npx karin ts` 生成配置文件

## 修改配置文件 填写ts服务器相关信息

修改位于 `/@karinjs/karin-plugin-teamspeak3/config` 文件夹下的 `config.yaml` 文件
