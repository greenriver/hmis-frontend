import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import {
  generatePath,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetOrganizationsAndProjectsQuery,
  ProjectFieldsFragment,
} from '@/types/gqlTypes';

const GroupedProjectTable = ({
  organizations,
}: {
  organizations: GetOrganizationsAndProjectsQuery['organizations'];
}) => {
  const navigate = useNavigate();

  const columns: ColumnDef<ProjectFieldsFragment>[] = [
    { header: 'Project', key: 'name', width: '10%', render: 'projectName' },
    {
      header: 'Project Type',
      key: 'type',
      width: '20%',
      render: (p: ProjectFieldsFragment) =>
        p.projectType ? HmisEnums.ProjectType[p.projectType] : null,
    },
    // {
    //   header: '',
    //   key: 'view',
    //   width: '10%',
    //   render: (p: ProjectFieldsFragment) => (
    //     <Button
    //       variant='outlined'
    //       color='secondary'
    //       size='small'
    //       to={generatePath(Routes.PROJECT, {
    //         projectId: p.id,
    //       })}
    //       component={RouterLink}
    //       sx={{ py: 0, float: 'right' }}
    //     >
    //       View Project
    //     </Button>
    //   ),
    // },
  ];

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    organizations.length < 6
      ? Object.fromEntries(organizations.map(({ id }) => [id, true]))
      : {}
  );

  const handleChange = (id: string) => () => {
    setExpanded((current) => {
      const copy = { ...current };
      if (id in copy) {
        delete copy[id];
      } else {
        copy[id] = true;
      }
      return copy;
    });
  };

  const handleRowClick = useCallback(
    (project: ProjectFieldsFragment) =>
      navigate(
        generatePath(Routes.PROJECT, {
          projectId: project.id,
        })
      ),
    [navigate]
  );

  return (
    <>
      {organizations.map((organization) => (
        <Accordion
          expanded={organization.id in expanded}
          onChange={handleChange(organization.id)}
          key={organization.id}
          sx={{
            mb: 1,
            '&.Mui-expanded': {
              my: 1,
            },
            '&::before': {
              height: '0px',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${organization.id}-content`}
            id={`panel-${organization.id}-header`}
            sx={{
              minHeight: '36px',
              '.MuiAccordionSummary-content': {
                my: 1,
                '&.Mui-expanded': {
                  my: 1,
                },
              },
              '&.Mui-expanded': {
                minHeight: '36px',
                my: 0,
              },
            }}
          >
            <Stack
              justifyContent='space-between'
              direction='row'
              sx={{ width: '100%', pr: 2 }}
            >
              <Typography variant='body1'>
                {organization.organizationName}
              </Typography>

              <Typography sx={{ color: 'text.secondary' }} variant='body2'>
                {organization.projects.length} project
                {organization.projects.length !== 1 ? 's' : ''}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              px: 0,
              py: 1,
              borderTop: (theme) => `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            <Button
              variant='outlined'
              color='secondary'
              size='small'
              to={generatePath(Routes.ORGANIZATION, {
                organizationId: organization.id,
              })}
              component={RouterLink}
              sx={{ mx: 1, my: 1, float: 'left' }}
            >
              View Organization
            </Button>
            <GenericTable<ProjectFieldsFragment>
              key={organization.id}
              columns={columns}
              rows={organization.projects}
              handleRowClick={handleRowClick}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default GroupedProjectTable;
