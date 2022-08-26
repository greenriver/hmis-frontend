import { useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<EnrollmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Project',
    render: (e) => e.project.projectName,
  },
  {
    header: 'Start Date',
    render: (e) =>
      e.entryDate ? HmisUtil.parseAndFormatDate(e.entryDate) : 'Unknown',
  },
  {
    header: 'End Date',
    render: (e) =>
      e.exitDate ? HmisUtil.parseAndFormatDate(e.exitDate) : 'Active',
  },
];
interface Props {
  clientId: string;
}

const EnrollmentsTable = ({ clientId }: Props) => {
  const navigate = useNavigate();

  const handleRowClick = useMemo(() => {
    return (enrollment: EnrollmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
          clientId,
          enrollmentId: enrollment.id,
        })
      );
  }, [clientId, navigate]);

  return (
    <GenericTableWithData<
      GetClientEnrollmentsQuery,
      GetClientEnrollmentsQueryVariables,
      EnrollmentFieldsFragment
    >
      queryVariables={{ id: clientId }}
      queryDocument={GetClientEnrollmentsDocument}
      handleRowClick={handleRowClick}
      columns={columns}
      toNodes={(data: GetClientEnrollmentsQuery) =>
        data.client?.enrollments?.nodes || []
      }
      toNodesCount={(data: GetClientEnrollmentsQuery) =>
        data.client?.enrollments?.nodesCount
      }
    />
  );
};

export default EnrollmentsTable;
