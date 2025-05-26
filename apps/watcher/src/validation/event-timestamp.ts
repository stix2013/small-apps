export const validPosition = (value: string): boolean => {
  const regex = /^\d{4}$/

  return regex.test(value)
}
