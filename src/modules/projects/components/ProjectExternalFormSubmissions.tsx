import { Paper } from '@mui/material';
import React, { useState } from 'react';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { itemDefaults } from '@/modules/form/util/formUtil';
import ProjectSubmissionsTable from '@/modules/projects/components/tables/ProjectSubmissionsTable';
import { ItemType, PickListOption, PickListType } from '@/types/gqlTypes';

interface Props {}
const ProjectExternalFormSubmissions: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const { pickList: formTypeList, loading: formTypeListLoading } = usePickList({
    item: {
      ...itemDefaults,
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.ExternalFormTypesForProject,
    },
    projectId,
  });

  const [selectedFormType, setSelectedFormType] =
    useState<PickListOption | null>(null);
  const formType =
    formTypeList.length === 1 ? formTypeList[0] : selectedFormType;

  return (
    <>
      <PageTitle title='Submissions' />

      {/* put <Loading> here, rather than using FormSelect's loading attr,
      because the FormSelect is only shown if formTypeList.length > 1 */}
      {formTypeListLoading && <Loading />}
      {!formTypeListLoading && formTypeList.length > 1 && (
        <FormSelect
          sx={{ mb: 2 }}
          options={formTypeList || []}
          value={selectedFormType}
          onChange={(e, val) =>
            setSelectedFormType(isPickListOption(val) ? val : null)
          }
          label={getRequiredLabel('Select form type', false)}
          placeholder='Select a form type'
        />
      )}

      {formType && (
        <Paper sx={{ p: 2 }}>
          <ProjectSubmissionsTable projectId={projectId} formType={formType} />
        </Paper>
      )}
    </>
  );
};

export default ProjectExternalFormSubmissions;
