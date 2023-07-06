import { useMemo } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import { SubmitFormAllowedTypes } from '../types';
import { createInitialValuesFromRecord } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import { FormRole } from '@/types/gqlTypes';

export interface ViewRecordProps<RecordType> {
  record: RecordType;
  formRole: FormRole;
  pickListRelationId?: string;
}

/**
 * Read-only version of EditRecord.
 * Displays a record using its form definition.
 */
const ViewRecord = <RecordType extends SubmitFormAllowedTypes>({
  record,
  formRole,
  pickListRelationId,
}: ViewRecordProps<RecordType>): JSX.Element => {
  const { formDefinition, itemMap, loading } = useFormDefinition(formRole);

  // Transform record into "form state" for DynamicView
  const values = useMemo(() => {
    if (!itemMap) return {};
    const formValues = createInitialValuesFromRecord(itemMap, record);
    console.debug('Display values:', formValues, 'from', record);
    return formValues;
  }, [itemMap, record]);

  if (loading) return <Loading />;
  if (!formDefinition || !itemMap) return <NotFound />;

  return (
    <DynamicView
      values={values}
      definition={formDefinition.definition}
      pickListRelationId={pickListRelationId}
    />
  );
};

export default ViewRecord;
