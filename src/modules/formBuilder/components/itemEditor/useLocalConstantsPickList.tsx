import { startCase } from 'lodash-es';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { FormRole } from '@/types/gqlTypes';

interface Args {
  role?: FormRole;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLocalConstantsPickList({ role }: Args = {}) {
  const alwaysPresent = Object.keys(AlwaysPresentLocalConstants).map((key) => ({
    code: `${key}`,
    label: startCase(key),
  }));

  // TODO(#6212) include additional constants based on the role context

  return alwaysPresent;
}
