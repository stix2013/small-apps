import type { Image } from '@yellow-mobile/types/app/image'

export const getImageAlt = (image: Image): string | undefined => {
  if (!image || image.alt === null || image.alt === undefined) {
    return undefined;
  }
  return image.alt; // This will correctly return '' if image.alt is ''
};

export const getImageSrc = (image: Image): string | undefined => {
  if (!image || image.src === null || image.src === undefined) {
    return undefined;
  }
  return image.src; // This will correctly return '' if image.src is ''
};
