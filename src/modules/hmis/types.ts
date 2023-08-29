import { isNil } from 'lodash-es';
import { CustomDataElementFieldsFragment } from '@/types/gqlTypes';

export function hasCustomDataElements(
  value: any | null | undefined
): value is { customDataElements: CustomDataElementFieldsFragment[] } {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !!value.customDataElements
  );
}
