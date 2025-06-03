import { inspect } from 'node:util';
import type { Logform } from 'winston';
import { format } from 'winston';

export const customFormat = format.printf((info: Logform.TransformableInfo) => {
  const {
    timestamp,
    level,
    ms,
    label, // Using label from format.label()
    message,
    splat,
  } = info;

  return `${timestamp} ${ms} [${level}] [${label}] ${message} ${
    splat ? inspect(splat, { depth: null }) : ''
  }`;
});
