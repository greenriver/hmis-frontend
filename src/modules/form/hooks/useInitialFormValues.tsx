import { useMemo } from 'react';

import { ItemMap, LocalConstants, SubmitFormAllowedTypes } from '../types';
import {
  createInitialValuesFromRecord,
  getInitialValues,
} from '../util/formUtil';

import { FormDefinitionWithJsonFragment } from '@/types/gqlTypes';

interface Args {
  record?: SubmitFormAllowedTypes;
  itemMap?: ItemMap;
  formDefinition?: FormDefinitionWithJsonFragment;
  localConstants?: LocalConstants;
}

const useInitialFormValues = ({
  record,
  itemMap,
  formDefinition,
  localConstants,
}: Args) => {
  const initialValues = useMemo(() => {
    if (!itemMap || !formDefinition) return {};
    const initialValuesFromDefinition = getInitialValues(
      formDefinition.definition,
      localConstants
    );
    if (!record) return initialValuesFromDefinition;

    const initialValuesFromRecord = createInitialValuesFromRecord(
      itemMap,
      record
    );
    const values = {
      ...initialValuesFromDefinition,
      ...initialValuesFromRecord,
    };
    console.debug('Initial form values:', values, 'from', record);
    return values;
  }, [record, formDefinition, itemMap, localConstants]);

  return initialValues;
};

export default useInitialFormValues;
