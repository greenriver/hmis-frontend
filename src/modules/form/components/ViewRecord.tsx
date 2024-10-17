import { useMemo } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import { PickListArgs, SubmitFormAllowedTypes } from '../types';
import { createInitialValuesFromRecord } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import Loading from '@/components/elements/Loading';
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
    // record.formDefinitionId comes from the form processor. It is the form that was last used to create/edit the record.
    // If the record has formDefinitionId, then we should just use that definition, rather than trying to find the best
    // definition based on the role and project ID
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

  return (
    <>
      {formDefinition && (
        <DynamicView
          values={values}
          definition={formDefinition.definition}
          pickListArgs={pickListArgs}
        />
      )}
    </>
  );
};

export default ViewRecord;
