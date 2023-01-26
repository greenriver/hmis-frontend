import { generatePath } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';

export const isIdParam = (key: string) => key.match(/Id$/);

const generateSafePath: typeof generatePath = (basePath, params) => {
  if (!params) return generatePath(basePath);

  const safeParams = Object.assign({}, params) as NonNullable<typeof params>;

  for (const key in safeParams) {
    if (isIdParam(key) && safeParams[key])
      safeParams[key] = IdEncoder.encode(safeParams[key] as string);
  }

  return generatePath(basePath, safeParams);
};

export default generateSafePath;
