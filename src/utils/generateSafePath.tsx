import { generatePath } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';

export const isIdParam = (key: string) => key.match(/Id$/);

const generateSafePath: typeof generatePath = (basePath, params) => {
  const safeParams = { ...params };

  for (const key in params) {
    if (isIdParam(key) && params[key])
      safeParams[key] = IdEncoder.encode(params[key] as string);
  }

  const path = generatePath(basePath, safeParams);

  return path;
};

export default generateSafePath;
