import { useMemo } from 'react';

import { ItemMap, LocalConstants } from '../types';
import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromRecord,
  getInitialValues,
  getItemMap,
} from '../util/formUtil';

import { FormDefinitionJsonFieldsFragment } from '@/types/gqlTypes';

interface Args {
  record?: Record<string, any> | null;
  itemMap?: ItemMap;
  definition?: FormDefinitionJsonFieldsFragment;
  localConstants?: LocalConstants;
}

const useInitialFormValues = ({
  record,
  itemMap: itemMapArg,
  definition,
  localConstants,
}: Args) => {
  const itemMap = useMemo(() => {
    if (!definition) return;
    return itemMapArg || getItemMap(definition);
  }, [itemMapArg, definition]);

  const initialValues = useMemo(() => {
    if (!definition || !itemMap) return {};
    const initialValuesFromDefinition = getInitialValues(definition, {
      ...localConstants,
      ...AlwaysPresentLocalConstants,
    });
    if (!record) return initialValuesFromDefinition;

    const initialValuesFromRecord = createInitialValuesFromRecord(
      itemMap,
      record
    );
    const values = {
      ...initialValuesFromDefinition,
      ...initialValuesFromRecord,
    };
    // console.debug('Initial form values:', values, 'from', record);
    return values;
  }, [record, definition, itemMap, localConstants]);

  return initialValues;
};

export default useInitialFormValues;
