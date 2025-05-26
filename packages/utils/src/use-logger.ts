import consola from 'consola'

const logger = consola

export function useLogger (scope?: string) {
  return scope ? logger.withScope(scope) : logger
}
