import { useMemo } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import { PickListArgs, SubmitFormAllowedTypes } from '../types';
import { createInitialValuesFromRecord } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import { RecordFormRole } from '@/types/gqlTypes';

export interface ViewRecordProps<RecordType> {
  record: RecordType;
  formRole: RecordFormRole;
  pickListArgs?: PickListArgs;
  projectId?: string; // Project context for fetching form definition
}

/**
 * Read-only version of EditRecord.
 * Displays a record using its form definition.
 */
const ViewRecord = <RecordType extends SubmitFormAllowedTypes>({
  record,
  formRole,
  pickListArgs,
  projectId,
}: ViewRecordProps<RecordType>): JSX.Element => {
  const { formDefinition, itemMap, loading } = useFormDefinition({
    role: formRole,
    id: 'formDefinitionId' in record ? record.formDefinitionId : undefined,
    projectId,
  });

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
