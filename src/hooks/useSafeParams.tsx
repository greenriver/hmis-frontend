import { useParams } from 'react-router-dom';

import IdEncoder from '@/modules/hmis/IdEncoder';
import { HmisEnums } from '@/types/gqlEnums';
import { isIdParam } from '@/utils/generateSafePath';

const enumParams: Record<string, string[]> = {
  formRole: Object.keys(HmisEnums.FormRole),
};

const useSafeParams = (...args: Parameters<typeof useParams>) => {
  const params = { ...useParams(...args) };

  for (const key in params) {
    if (isIdParam(key) && params[key])
      params[key] = IdEncoder.decode(params[key] as string);

    if (key in enumParams && params[key]) {
      params[key] = params[key]?.toUpperCase();
      if (
        enumParams[key] &&
        enumParams[key].indexOf(params[key] as string) === -1
      ) {
        throw Error(`Unrecognized Parameter: ${params[key]}`);
      }
    }
  }

  // checkAgainstEnums(...)
  // if (params.formRole) {

  // }

  return { ...params } as const;
};

export default useSafeParams;
