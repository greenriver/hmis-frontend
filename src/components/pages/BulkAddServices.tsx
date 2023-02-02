import { Stack, Typography } from '@mui/material';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import {
  ServiceFieldsFragment,
  UpdateProjectCocDocument,
  UpdateProjectCocMutation,
  UpdateProjectCocMutationVariables,
} from '@/types/gqlTypes';

const BulkAddServices = () => {
  // const navigate = useNavigate();
  // const { projectId } = useSafeParams() as {
  //   projectId: string;
  // };
  const title = 'Add Services';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  if (crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  const common = {
    definitionIdentifier: 'service',
    title: (
      <Stack direction={'row'} spacing={2}>
        <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
          {title}
        </Typography>
        <InactiveChip project={project} />
      </Stack>
    ),
  };
  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<
        ServiceFieldsFragment,
        UpdateProjectCocMutation,
        UpdateProjectCocMutationVariables
      >
        queryDocument={UpdateProjectCocDocument}
        onCompleted={console.log}
        submitButtonText='Save Changes'
        getErrors={() => []}
        {...common}
      />
    </ProjectLayout>
  );
};
export default BulkAddServices;
