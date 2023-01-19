import { useParams } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';
import { isIdParam } from '@/utils/generateSafePath';

const useSafeParams = (...args: Parameters<typeof useParams>) => {
  const params = { ...useParams(...args) };

  for (const key in params) {
    if (isIdParam(key) && params[key])
      params[key] = IdEncoder.decode(params[key] as string);
  }

  return { ...params } as const;
};

export default useSafeParams;
