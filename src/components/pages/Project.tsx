import {
  Button,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { generatePath, Link as RouterLink, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  HousingTypeEnum,
  ProjectTypeEnum,
  TargetPopulationEnum,
  TrackingMethodEnum,
} from '@/types/gqlEnums';
import {
  HopwaMedAssistedLivingFac,
  ProjectAllFieldsFragment,
  ProjectType,
} from '@/types/gqlTypes';

const ProjectDetails = ({ project }: { project: ProjectAllFieldsFragment }) => {
  const data = [
    {
      title: 'Operating Start Date',
      value:
        project.operatingStartDate &&
        HmisUtil.parseAndFormatDate(project.operatingStartDate),
    },
    {
      title: 'Operating End Date',
      value:
        project.operatingStartDate &&
        HmisUtil.parseAndFormatDate(project.operatingStartDate),
    },
    {
      title: 'Project Type',
      value: project.projectType && ProjectTypeEnum[project.projectType],
    },
    {
      title: 'Continuum Project',
      value: HmisUtil.yesNo(project.continuumProject) || '-',
    },
    {
      title: 'Housing Type',
      value:
        (project.housingType && HousingTypeEnum[project.housingType]) || '-',
    },
    ...(project.projectType === ProjectType.ServicesOnly
      ? [
          {
            title: 'Residential Affiliation',
            value: HmisUtil.yesNo(project.residentialAffiliation) || '-',
          },
        ]
      : []),
    ...(project.projectType === ProjectType.Es
      ? [
          {
            title: 'Tracking Method',
            value:
              (project.trackingMethod &&
                TrackingMethodEnum[project.trackingMethod]) ||
              '-',
          },
        ]
      : []),
    {
      title: 'HMIS Participating Project',
      value: HmisUtil.yesNo(project.HMISParticipatingProject) || '-',
    },
    {
      title: 'Target Population',
      value:
        project.targetPopulation &&
        TargetPopulationEnum[project.targetPopulation],
    },
    {
      title: 'HOPWA Medical Assisted Living Facility',
      value:
        isNil(project.HOPWAMedAssistedLivingFac) ||
        project.HOPWAMedAssistedLivingFac ===
          HopwaMedAssistedLivingFac.NonHopwaFundedProject
          ? '-'
          : HmisUtil.yesNo(
              project.HOPWAMedAssistedLivingFac ===
                HopwaMedAssistedLivingFac.Yes
            ),
    },
  ];

  return (
    <Grid container spacing={3}>
      {project.description && (
        <Grid item xs={12}>
          <Typography variant='subtitle2'>
            {project.description || 'No description provided.'}
          </Typography>
        </Grid>
      )}
      {data.map(({ title, value }) => (
        <Grid item xs={4} key={title}>
          <Stack>
            <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant='subtitle2'>{value}</Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};

const Project = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [crumbs, loading, project] = useProjectCrumbs();
  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Typography variant='h3' sx={{ mb: 2 }}>
          {project.projectName}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={9}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Project Details
              </Typography>
              <ProjectDetails project={project} />
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Add to Project</Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Inventory
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Funding Source
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Project CoC
                </Button>
              </Stack>
            </Paper>
            {project.contactInformation && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                  <Typography variant='h6'>Project Contact</Typography>
                  <Typography variant='body2'>
                    {project.contactInformation}
                  </Typography>
                </Stack>
              </Paper>
            )}
            <Paper sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Link
                  component={RouterLink}
                  to={generatePath(Routes.EDIT_PROJECT, {
                    projectId,
                  })}
                >
                  Edit Project
                </Link>
                <Link component={RouterLink} to=''>
                  Delete Project
                </Link>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default Project;
