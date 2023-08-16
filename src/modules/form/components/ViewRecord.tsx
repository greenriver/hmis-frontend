import { useMemo } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import { PickListArgs, SubmitFormAllowedTypes } from '../types';
import { createInitialValuesFromRecord } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import { FormRole } from '@/types/gqlTypes';

export interface ViewRecordProps<RecordType> {
  record: RecordType;
  formRole: FormRole;
  pickListArgs?: PickListArgs;
}

/**
 * Read-only version of EditRecord.
 * Displays a record using its form definition.
 */
const ViewRecord = <RecordType extends SubmitFormAllowedTypes>({
  record,
  formRole,
  pickListArgs,
}: ViewRecordProps<RecordType>): JSX.Element => {
  const { formDefinition, itemMap, loading } = useFormDefinition(formRole);

  // Transform record into "form state" for DynamicView
  const values = useMemo(() => {
    if (!itemMap) return {};
    const formValues = createInitialValuesFromRecord(itemMap, record);
    return formValues;
  }, [itemMap, record]);

  if (loading) return <Loading />;
  if (!formDefinition || !itemMap) return <NotFound />;

  return (
    <DynamicView
      values={values}
      definition={formDefinition.definition}
      pickListArgs={pickListArgs}
    />
  );
};

export default ViewRecord;
