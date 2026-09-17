import { describe, expect, it } from 'vitest';

import { FormIdentifierFilterOptions, PickListType } from '@/types/gqlTypes';
import { buildTableFilterType } from '@/utils/tableFilterUtil';

describe('buildTableFilterType', () => {
  it('uses a configured remote pick list for an enum filter', () => {
    const filters = buildTableFilterType<FormIdentifierFilterOptions>(
      'FormIdentifierFilterOptions'
    );

    expect(filters.formType).toMatchObject({
      type: 'remote_picklist',
      multi: true,
      pickListReference: PickListType.FormTypes,
    });
  });
});
