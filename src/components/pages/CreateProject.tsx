import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import {
  CreateProjectDocument,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

const CreateProject = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams() as {
    organizationId: string;
  };
  const { crumbs, organizationName } = useOrganizationCrumbs('Add Project');

  const onCompleted = useCallback(
    (data: CreateProjectMutation) => {
      const id = data?.createProject?.project?.id;
      if (id) {
        navigate(generatePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate]
  );

  if (!crumbs) throw Error('Organization not found');

  return (
    <ProjectLayout>
      {crumbs && <Breadcrumbs crumbs={crumbs} />}
      {organizationName && (
        <Typography variant='h3' sx={{ mb: 4 }}>
          Add a new Project to {organizationName}
        </Typography>
      )}
      <Grid container>
        <Grid item xs={9}>
          <EditRecord<
            ProjectAllFieldsFragment,
            CreateProjectMutation,
            CreateProjectMutationVariables
          >
            definitionIdentifier='project'
            queryDocument={CreateProjectDocument}
            onCompleted={onCompleted}
            inputVariables={{ organizationId }}
            getErrors={(data: CreateProjectMutation) =>
              data?.createProject?.errors
            }
            submitButtonText='Create Project'
          />
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default CreateProject;
