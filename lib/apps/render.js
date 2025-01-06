import { dirPath } from '../utils/index.js'
import { karin, render, common, segment, logger } from 'node-karin'

/**
 * 渲染demo
 * 触发指令: #测试渲染
 */
export const image = karin.command(/^#?测试渲染$/, async (e) => {
  try {
    const filePath = common.absPath(dirPath + '/resources')
    const html = filePath + '/template/test.html'
    const list = []
    for (let i = 0; i < 10; i++) {
      list.push(`<li>${i}</li>`)
    }
    const img = await render.render({
      file: html,
      data: {
        list: list.join('')
      },
    })
    await e.reply(segment.image('base64://' + img))
    return true
  } catch (error) {
    logger.error(error)
    await e.reply(JSON.stringify(error))
    return true
  }
}, {
  /** 插件优先级 */
  priority: 9999,
  /** 插件触发是否打印触发日志 */
  log: true,
  /** 插件名称 */
  name: '测试渲染',
  /** 谁可以触发这个插件 'all' | 'master' | 'admin' | 'group.owner' | 'group.admin' */
  permission: 'all',
})