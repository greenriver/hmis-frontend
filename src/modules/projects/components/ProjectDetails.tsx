import { Grid, Typography } from '@mui/material';
import { useMemo } from 'react';

import DetailGrid from '@/components/elements/DetailGrid';
import MultilineTypography from '@/components/elements/MultilineTypography';
import NotSpecified from '@/components/elements/NotSpecified';
import RouterLink from '@/components/elements/RouterLink';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HopwaMedAssistedLivingFac,
  ProjectAllFieldsFragment,
  ProjectType,
  TargetPopulation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const notSpecified = <NotSpecified />;

const ProjectDetails = ({ project }: { project: ProjectAllFieldsFragment }) => {
  const data = useMemo(
    () => [
      {
        label: 'Organization',
        value: (
          <RouterLink
            data-testid='organizationLink'
            to={generateSafePath(Routes.ORGANIZATION, {
              organizationId: project.organization.id,
            })}
          >
            {project.organization.organizationName}
          </RouterLink>
        ),
      },
      {
        label: 'Operating Start Date',
        value:
          project.operatingStartDate &&
          parseAndFormatDate(project.operatingStartDate),
      },
      {
        label: 'Operating End Date',
        value:
          (project.operatingEndDate &&
            parseAndFormatDate(project.operatingEndDate)) ||
          'Active',
      },
      {
        label: 'Project Type',
        value: (
          <HmisEnum
            value={project.projectType}
            enumMap={HmisEnums.ProjectType}
          />
        ),
      },
      {
        label: 'Continuum Project',
        value: (
          <YesNoDisplay
            enumValue={project.continuumProject}
            fallback={notSpecified}
          />
        ),
      },
      {
        label: 'Housing Type',
        value: (
          <HmisEnum
            value={project.housingType}
            enumMap={HmisEnums.HousingType}
          />
        ),
      },
      ...(project.projectType === ProjectType.ServicesOnly
        ? [
            {
              label: 'Residential Affiliation',
              value: (
                <YesNoDisplay
                  enumValue={project.residentialAffiliation}
                  fallback={notSpecified}
                />
              ),
            },
          ]
        : []),
      ...(project.projectType === ProjectType.Es
        ? [
            {
              label: 'Tracking Method',
              value: (
                <HmisEnum
                  value={project.trackingMethod}
                  enumMap={HmisEnums.TrackingMethod}
                />
              ),
            },
          ]
        : []),
      {
        label: 'HMIS Participating Project',
        value: (
          <YesNoDisplay
            enumValue={project.HMISParticipatingProject}
            fallback={notSpecified}
          />
        ),
      },
      ...(project.targetPopulation &&
      project.targetPopulation !== TargetPopulation.NotApplicable
        ? [
            {
              label: 'Target Population',
              value: (
                <HmisEnum
                  value={project.targetPopulation}
                  enumMap={HmisEnums.TargetPopulation}
                />
              ),
            },
          ]
        : []),
      ...(project.HOPWAMedAssistedLivingFac &&
      project.HOPWAMedAssistedLivingFac !==
        HopwaMedAssistedLivingFac.NonHopwaFundedProject
        ? [
            {
              label: 'HOPWA Medical Assisted Living Facility',
              value: (
                <YesNoDisplay
                  booleanValue={
                    project.HOPWAMedAssistedLivingFac ===
                    HopwaMedAssistedLivingFac.Yes
                  }
                  fallback={notSpecified}
                />
              ),
            },
          ]
        : []),
    ],
    [project]
  );

  return (
    <Grid container spacing={3}>
      {project.description && (
        <Grid item xs={12}>
          <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
            Description
          </Typography>
          <MultilineTypography variant='body1'>
            {project.description}
          </MultilineTypography>
        </Grid>
      )}
      <DetailGrid data={data} />
    </Grid>
  );
};

export default ProjectDetails;
