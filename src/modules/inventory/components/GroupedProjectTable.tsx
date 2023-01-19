import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import ProjectsTable from './ProjectsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import { Routes } from '@/routes/routes';
import { GetAllOrganizationsQuery } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const GroupedProjectTable = ({
  organizations,
}: {
  organizations: GetAllOrganizationsQuery['organizations']['nodes'];
}) => {
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
              minHeight: '48px',
              '.MuiAccordionSummary-content': {
                my: 1,
                '&.Mui-expanded': {
                  my: 1,
                },
              },
              '&.Mui-expanded': {
                minHeight: '48px',
                my: 0,
              },
            }}
          >
            <Stack
              justifyContent='space-between'
              direction='row'
              sx={{ width: '100%', pr: 2 }}
            >
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                {organization.organizationName}
              </Typography>

              <Typography variant='body1'>
                {organization.projects.nodesCount} project
                {organization.projects.nodesCount !== 1 ? 's' : ''}
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
            <Stack spacing={2}>
              <ButtonLink
                variant='outlined'
                color='secondary'
                size='small'
                to={generateSafePath(Routes.ORGANIZATION, {
                  organizationId: organization.id,
                })}
                sx={{ mx: 1, my: 1, float: 'left', width: 150 }}
              >
                View Organization
              </ButtonLink>
              <ProjectsTable organizationId={organization.id} hideSearch />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default GroupedProjectTable;
