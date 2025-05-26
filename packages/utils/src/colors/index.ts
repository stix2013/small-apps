import { generateColors } from './generate-colors'

export const colorPrimary = '#fdcb08'
export const colorOrange = '#fd9808'
export const colorDark = '#231f20'

export const colorsYellow = generateColors(colorPrimary)
export const colorsOrange = generateColors(colorOrange)

export const colorsGray = {
  DEFAULT: '#baba97',
  dark: '#696955',
  light: '#d7d7c2',
  navi: '#eeeeee',
  border: '#d1d5db', // #baba97'
  font: '#605f58'
}

export { generateColors } from './generate-colors'
