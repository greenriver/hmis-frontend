import { generatePath } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';

export const isIdParam = (key: string) => key.match(/Id$/);

const generateSafePath: typeof generatePath = (basePath, params) => {
  const safeParams = { ...params } as NonNullable<typeof params>;
  type Key = keyof NonNullable<typeof params>;

  for (const key in params) {
    const param = params[key as Key];
    if (isIdParam(key) && param)
      safeParams[key as Key] = IdEncoder.encode(param);
  }

  return generatePath(basePath, safeParams);
};

export default generateSafePath;
