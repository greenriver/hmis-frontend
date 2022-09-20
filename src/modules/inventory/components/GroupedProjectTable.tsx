import { Paper, Stack, Typography, Link } from '@mui/material';
import { useCallback } from 'react';
import {
  generatePath,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { Routes } from '@/routes/routes';
import { ProjectTypeEnum } from '@/types/gqlEnums';
import {
  ProjectFieldsFragment,
  useGetOrganizationsAndProjectsQuery,
} from '@/types/gqlTypes';

const GroupedProjectTable = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useGetOrganizationsAndProjectsQuery();
  const columns: ColumnDef<ProjectFieldsFragment>[] = [
    { header: '', key: 'name', width: '30%', render: 'projectName' },
    {
      header: '',
      key: 'type',
      width: '20%',
      render: (p: ProjectFieldsFragment) =>
        p.projectType ? ProjectTypeEnum[p.projectType] : null,
    },
  ];

  const handleRowClick = useCallback(
    (project: ProjectFieldsFragment) =>
      navigate(
        generatePath(Routes.PROJECT, {
          id: project.id,
        })
      ),
    [navigate]
  );

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      {data?.organizations?.map((organization) => (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            <Stack spacing={1} direction='row'>
              <Link
                variant='h6'
                to={generatePath(Routes.ORGANIZATION, {
                  id: organization.id,
                })}
                component={RouterLink}
              >
                {organization.organizationName}
              </Link>
              <span>-</span>
              <span>{organization.projects.length} projects</span>
            </Stack>
          </Typography>
          <GenericTable<ProjectFieldsFragment>
            key={organization.id}
            columns={columns}
            rows={organization.projects}
            handleRowClick={handleRowClick}
          />
        </Paper>
      ))}
    </>
  );
};

export default GroupedProjectTable;
