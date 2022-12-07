import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
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

  const onCompleted = useCallback(() => {
    navigate(generatePath(Routes.PROJECT, { projectId }), {
      state: { refetchProjectCoc: create ? true : false },
    });
  }, [navigate, projectId, create]);

  const { data, loading, error } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (error) throw error;
  if (!crumbs || !project) throw Error('Project not found');

  const common = {
    definitionIdentifier: 'project_coc',
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
              onCompleted={onCompleted}
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
              onCompleted={onCompleted}
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
