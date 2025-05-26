import local from './local.strategy'
import yellow from './yellow.strategy'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
