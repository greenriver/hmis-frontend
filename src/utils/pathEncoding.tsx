import { generatePath } from 'react-router-dom';

import { NotFoundError } from '@/modules/errors/util';
import IdEncoder from '@/modules/hmis/IdEncoder';
import { HmisEnums } from '@/types/gqlEnums';

const isIdParam = (key: string) => key.match(/Id$/);

const enumParams: Record<string, string[]> = {
  formRole: Object.keys(HmisEnums.FormRole),
};

/**
 * - Decodes encrypted ID parameters
 * - Converts enum parameter values to uppercase and validates them
 * - Throws a NotFoundError for unrecognized enum parameter values
 */
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

/**
 * Generate a safe path. Should ALWAYS be used in place of "generatePath" from react-router-dom.
 *
 * @param basePath /client/:clientId
 * @param params { client: 1 }
 * @returns /client/<encoded id>
 */
export const generateSafePath: typeof generatePath = (basePath, params) => {
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
