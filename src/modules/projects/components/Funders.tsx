import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FunderFieldsFragment,
  FundingSource,
  GetProjectFundersDocument,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<FunderFieldsFragment>[] = [
  {
    header: 'Funder',
    linkTreatment: true,
    render: (f: FunderFieldsFragment) =>
      f.funder === FundingSource.LocalOrOtherFundingSource && f.otherFunder ? (
        f.otherFunder
      ) : (
        <HmisEnum
          value={f.funder}
          enumMap={HmisEnums.FundingSource}
          color='inherit'
        />
      ),
  },
  {
    header: 'Active Period',
    render: (f: FunderFieldsFragment) =>
      parseAndFormatDateRange(f.startDate, f.endDate),
  },
  { header: 'Grant ID', render: 'grantId' },
  HudRecordMetadataHistoryColumn,
];

// interface Props
//   extends Omit<
//     GenericTableWithDataProps<
//       GetProjectFundersQuery,
//       GetProjectFundersQueryVariables,
//       FunderFieldsFragment
//     >,
//     'queryVariables' | 'queryDocument' | 'pagePath'
//   > {
//   projectId: string;
// }

const FunderTable = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const [canEditProject] = useHasProjectPermissions(projectId, [
    'canEditProjectDetails',
  ]);

  return (
    <>
      <PageTitle
        title='Funders'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEditProjectDetails'
          >
            <ButtonLink
              data-testid='addFunderButton'
              to={generateSafePath(ProjectDashboardRoutes.NEW_FUNDER, {
                projectId,
              })}
              Icon={AddIcon}
            >
              Add Funder
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Paper data-testid='funderCard'>
        <GenericTableWithData
          queryVariables={{ id: projectId }}
          queryDocument={GetProjectFundersDocument}
          columns={columns}
          recordType='Funder'
          pagePath='project.funders'
          noData='No funding sources'
          rowLinkTo={
            canEditProject
              ? (record) =>
                  generateSafePath(ProjectDashboardRoutes.EDIT_FUNDER, {
                    projectId,
                    funderId: record.id,
                  })
              : undefined
          }
        />
      </Paper>
    </>
  );
};
export default FunderTable;
