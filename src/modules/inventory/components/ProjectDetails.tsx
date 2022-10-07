import { Grid, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import DetailGrid from '@/components/elements/DetailGrid';
import MultilineTypography from '@/components/elements/MultilineTypography';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HopwaMedAssistedLivingFac,
  ProjectAllFieldsFragment,
  ProjectType,
} from '@/types/gqlTypes';

const ProjectDetails = ({ project }: { project: ProjectAllFieldsFragment }) => {
  const data = useMemo(
    () => [
      {
        label: 'Operating Start Date',
        value:
          project.operatingStartDate &&
          HmisUtil.parseAndFormatDate(project.operatingStartDate),
      },
      {
        label: 'Operating End Date',
        value:
          project.operatingEndDate &&
          HmisUtil.parseAndFormatDate(project.operatingEndDate),
      },
      {
        label: 'Project Type',
        value:
          project.projectType && HmisEnums.ProjectType[project.projectType],
      },
      {
        label: 'Continuum Project',
        value: HmisUtil.yesNo(project.continuumProject) || '-',
      },
      {
        label: 'Housing Type',
        value:
          (project.housingType && HmisEnums.HousingType[project.housingType]) ||
          '-',
      },
      ...(project.projectType === ProjectType.ServicesOnly
        ? [
            {
              label: 'Residential Affiliation',
              value: HmisUtil.yesNo(project.residentialAffiliation) || '-',
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
                '-',
            },
          ]
        : []),
      {
        label: 'HMIS Participating Project',
        value: HmisUtil.yesNo(project.HMISParticipatingProject) || '-',
      },
      {
        label: 'Target Population',
        value:
          project.targetPopulation &&
          HmisEnums.TargetPopulation[project.targetPopulation],
      },
      {
        label: 'HOPWA Medical Assisted Living Facility',
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
