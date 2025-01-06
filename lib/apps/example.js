import { copyConfigSync } from 'node-karin'
import { dirPath } from '../utils'
const main = () => {
  const configDef = copyConfigSync(dirPath + '/config/config.yaml', 'config.yaml')
  
}
main()