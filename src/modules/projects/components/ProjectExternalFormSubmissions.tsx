import { Paper } from '@mui/material';
import React, { useState } from 'react';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { isPickListOption } from '@/modules/form/types';
import ProjectExternalSubmissionsTable from '@/modules/projects/components/tables/ProjectExternalSubmissionsTable';
import {
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {}
const ProjectExternalFormSubmissions: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const { data, loading, error } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.ExternalFormTypesForProject,
      projectId,
    },
  });
  const pickList = data?.pickList;
  if (error) console.error(error);

  const [selectedFormType, setSelectedFormType] =
    useState<PickListOption | null>(null);
  const formType =
    pickList && (pickList.length === 1 ? pickList[0] : selectedFormType);

  return (
    <>
      <PageTitle title='Submissions' />

      {/* put <Loading> here, rather than using FormSelect's loading attr,
      because the FormSelect is only shown if formTypeList.length > 1 */}
      {loading && <Loading />}
      {!loading && pickList && pickList.length > 1 && (
        <FormSelect
          sx={{ mb: 2 }}
          options={pickList || []}
          value={selectedFormType}
          onChange={(e, val) =>
            setSelectedFormType(isPickListOption(val) ? val : null)
          }
          label={getRequiredLabel('Form type', false)}
          placeholder='Select a form type'
        />
      )}

      {formType && (
        <Paper>
          <ProjectExternalSubmissionsTable
            projectId={projectId}
            formDefinitionIdentifier={formType.code}
          />
        </Paper>
      )}
    </>
  );
};

export default ProjectExternalFormSubmissions;
