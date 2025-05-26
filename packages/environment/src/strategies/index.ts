import local from './local.strategy'
import yellow from './yellow.strategy'

export default function (env: any) {
  return {
    local: {
      ...local(env)
    },
    yellow: {
      ...yellow(env)
    }
  }
}
