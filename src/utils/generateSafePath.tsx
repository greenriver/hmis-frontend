import { generatePath } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';

export const isIdParam = (key: string) => key.match(/Id$/);

export const withHash = (path: string, hash: string) =>
  [path, hash].join('#').replace(/#+/, '#');

const generateSafePath: typeof generatePath = (basePath, params) => {
  const safeParams: { [x: string]: string | undefined } = { ...params };
  type Key = keyof NonNullable<typeof params>;

  for (const key in params) {
    const param = params[key as Key];
    if (isIdParam(key) && param) {
      safeParams[key] = IdEncoder.encode(param);
    }
  }

  return generatePath(basePath, safeParams as typeof params);
};

export default generateSafePath;
