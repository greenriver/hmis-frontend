import { Grid, Typography } from '@mui/material';
import { useMemo } from 'react';

import DetailGrid from '@/components/elements/DetailGrid';
import MultilineTypography from '@/components/elements/MultilineTypography';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HopwaMedAssistedLivingFac,
  ProjectAllFieldsFragment,
  ProjectType,
  TargetPopulation,
} from '@/types/gqlTypes';

const notSpecified = (
  <Typography variant='inherit' color='text.secondary'>
    Not specified
  </Typography>
);

const ProjectDetails = ({ project }: { project: ProjectAllFieldsFragment }) => {
  const data = useMemo(
    () => [
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
        value:
          project.projectType && HmisEnums.ProjectType[project.projectType],
      },
      {
        label: 'Continuum Project',
        value: (
          <YesNoDisplay
            booleanValue={project.continuumProject}
            fallback={notSpecified}
          />
        ),
      },
      {
        label: 'Housing Type',
        value:
          (project.housingType && HmisEnums.HousingType[project.housingType]) ||
          notSpecified,
      },
      ...(project.projectType === ProjectType.ServicesOnly
        ? [
            {
              label: 'Residential Affiliation',
              value: (
                <YesNoDisplay
                  booleanValue={project.residentialAffiliation}
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
              value:
                (project.trackingMethod &&
                  HmisEnums.TrackingMethod[project.trackingMethod]) ||
                notSpecified,
            },
          ]
        : []),
      {
        label: 'HMIS Participating Project',
        value: (
          <YesNoDisplay
            booleanValue={project.HMISParticipatingProject}
            fallback={notSpecified}
          />
        ),
      },
      ...(project.targetPopulation &&
      project.targetPopulation !== TargetPopulation.NotApplicable
        ? [
            {
              label: 'Target Population',
              value:
                (project.targetPopulation &&
                  HmisEnums.TargetPopulation[project.targetPopulation]) ||
                notSpecified,
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
