import { useMemo } from 'react';

import { PickListArgs, SubmitFormAllowedTypes } from '../types';
import { createInitialValuesFromRecord, getItemMap } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import { FormDefinitionFieldsFragment } from '@/types/gqlTypes';

export interface ViewRecordProps<RecordType> {
  record: RecordType;
  formDefinition: FormDefinitionFieldsFragment;
  pickListArgs?: PickListArgs;
}

/**
 * Read-only version of EditRecord.
 * Displays a record using its form definition.
 */
const ViewRecord = <RecordType extends SubmitFormAllowedTypes>({
  record,
  formDefinition,
  pickListArgs,
}: ViewRecordProps<RecordType>): JSX.Element => {
  // Transform record into "form state" for DynamicView
  const values = useMemo(() => {
    const itemMap = getItemMap(formDefinition.definition);
    const formValues = createInitialValuesFromRecord(itemMap, record);
    return formValues;
  }, [formDefinition.definition, record]);

  return (
    <DynamicView
      values={values}
      definition={formDefinition.definition}
      pickListArgs={pickListArgs}
    />
  );
};

export default ViewRecord;
