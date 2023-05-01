import { isNil } from 'lodash-es';

import { useProjectDashboardContext } from '../ProjectDashboard';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData, {
  Props as GenericTableWithDataProps,
} from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectProjectCocsDocument,
  GetProjectProjectCocsQuery,
  GetProjectProjectCocsQueryVariables,
  ProjectCocFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ProjectCocFieldsFragment>[] = [
  {
    header: 'CoC Code',
    linkTreatment: true,
    render: 'cocCode',
  },
  {
    header: 'Geocode',
    render: 'geocode',
  },
  {
    header: 'Geography Type',
    render: (c) => (
      <HmisEnum enumMap={HmisEnums.GeographyType} value={c.geographyType} />
    ),
  },
  {
    header: 'Address',
    render: (c: ProjectCocFieldsFragment) =>
      [c.address1, c.address2, c.city, c.state, c.zip]
        .filter((f) => !isNil(f))
        .join(', '),
  },
  {
    header: 'Date Created',
    render: (c: ProjectCocFieldsFragment) => parseAndFormatDate(c.dateCreated),
  },
];

type Props = Omit<
  GenericTableWithDataProps<
    GetProjectProjectCocsQuery,
    GetProjectProjectCocsQueryVariables,
    ProjectCocFieldsFragment
  >,
  'queryVariables' | 'queryDocument' | 'pagePath'
>;

const ProjectCocTable = (props: Props) => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <GenericTableWithData
        queryVariables={{ id: project.id }}
        queryDocument={GetProjectProjectCocsDocument}
        columns={columns}
        pagePath='project.projectCocs'
        noData='No Project CoC records.'
        rowLinkTo={
          project.access.canEditProjectDetails
            ? (record) =>
                generateSafePath(ProjectDashboardRoutes.EDIT_COC, {
                  projectId: project.id,
                  cocId: record.id,
                })
            : undefined
        }
        {...props}
      />
    </>
  );
};
export default ProjectCocTable;
