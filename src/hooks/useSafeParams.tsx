import { useParams } from 'react-router-dom'; // eslint-disable-line no-restricted-imports

import { decodeParams } from '@/utils/pathEncoding';

type RouteParams<T> = {
  readonly [key in keyof T]: string | undefined;
};

const useSafeParams = <T extends Record<string, string | undefined>>(
  ...args: Parameters<typeof useParams>
) => {
  const params = { ...useParams(...args) };
  return decodeParams(params) as RouteParams<T>;
};

export default useSafeParams;
