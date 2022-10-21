import { Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import { ProjectCocFormDefinition } from '@/modules/form/data';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import {
  CreateProjectCocDocument,
  CreateProjectCocMutation,
  CreateProjectCocMutationVariables,
  ProjectCocFieldsFragment,
  UpdateProjectCocDocument,
  UpdateProjectCocMutation,
  UpdateProjectCocMutationVariables,
  useGetProjectCocQuery,
} from '@/types/gqlTypes';

const ProjectCoc = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, cocId } = useParams() as {
    projectId: string;
    cocId: string;
  };
  const title = create ? `Add Project CoC` : `Edit Project CoC`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  // FIXME why isn't cache working
  const { data, loading, error } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (error) throw error;
  if (!crumbs || !project) throw Error('Project not found');

  const common = {
    definition: ProjectCocFormDefinition,
  };
  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <InactiveBanner project={project} />
          {create ? (
            <EditRecord<
              ProjectCocFieldsFragment,
              CreateProjectCocMutation,
              CreateProjectCocMutationVariables
            >
              inputVariables={{ projectId }}
              queryDocument={CreateProjectCocDocument}
              onCompleted={() => navigate(-1)}
              getErrors={(data: CreateProjectCocMutation) =>
                data?.createProjectCoc?.errors
              }
              {...common}
            />
          ) : (
            <EditRecord<
              ProjectCocFieldsFragment,
              UpdateProjectCocMutation,
              UpdateProjectCocMutationVariables
            >
              record={data?.projectCoc || undefined}
              queryDocument={UpdateProjectCocDocument}
              onCompleted={() => navigate(-1)}
              getErrors={(data: UpdateProjectCocMutation) =>
                data?.updateProjectCoc?.errors
              }
              {...common}
            />
          )}
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default ProjectCoc;
