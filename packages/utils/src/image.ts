import type { Image } from '@yellow-mobile/types/app/image'

export const getImageAlt = (image: Image): string | undefined => {
  if (!image || !image.alt) {
    return undefined
  }

  return image.alt
}

export const getImageSrc = (image: Image): string | undefined => {
  if (!image || !image.src) {
    return undefined
  }

  return image.src
}
