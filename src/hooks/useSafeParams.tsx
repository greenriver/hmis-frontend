import { useParams } from 'react-router-dom'; // eslint-disable-line no-restricted-imports

import { NotFoundError } from '@/modules/errors/util';
import IdEncoder from '@/modules/hmis/IdEncoder';
import { HmisEnums } from '@/types/gqlEnums';
import { isIdParam } from '@/utils/generateSafePath';

const enumParams: Record<string, string[]> = {
  formRole: Object.keys(HmisEnums.FormRole),
};

type RouteParams<T> = {
  readonly [key in keyof T]: string | undefined;
};

export const decodeParams = (params: Record<string, string | undefined>) => {
  for (const key in params) {
    if (isIdParam(key) && params[key])
      params[key] = IdEncoder.decode(params[key] as string);

    if (key in enumParams && params[key]) {
      params[key] = params[key]?.toUpperCase();
      if (
        enumParams[key] &&
        enumParams[key].indexOf(params[key] as string) === -1
      ) {
        // error boundary should show this is as Not Found
        throw new NotFoundError(`Unrecognized Parameter: ${params[key]}`);
      }
    }
  }

  return params;
};

const useSafeParams = <T extends Record<string, string | undefined>>(
  ...args: Parameters<typeof useParams>
) => {
  const params = { ...useParams(...args) };
  return decodeParams(params) as RouteParams<T>;
};

export default useSafeParams;
