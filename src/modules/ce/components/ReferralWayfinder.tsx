import React from 'react';
import WayfindingDialog from '@/components/elements/navigation/WayfindingDialog';
import { DeclinedIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from '@/routes/routes';
import { CeReferralStatus } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  open: boolean;
  onClose: VoidFunction;
}
const ReferralWayfinder: React.FC<Props> = ({ open, onClose }) => {
  const { referral } = useReferralContext();
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const { status, opportunity } = referral;
  const clientName = clientNameFromRecordWithOptionalClient(referral);

  switch (status) {
    case CeReferralStatus.Accepted:
      return (
        <WayfindingDialog
          open={open}
          onClose={onClose}
          title='Referral Complete'
          alertTitle='Referral Completed'
          alertText={`${clientName} has been accepted to ${opportunity.name}`}
          items={[
            {
              title: 'Return to Unit Overview',
              to: generateSafePath(ProjectDashboardRoutes.CE, { projectId }),
            },
            {
              title: 'Go to My Dashboard',
              to: generateSafePath(Routes.MY_DASHBOARD),
            },
            ...(!!referral.targetEnrollment
              ? [
                  {
                    title: `Go to Enrollment`,
                    to: generateSafePath(
                      EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                      {
                        clientId: referral.targetEnrollment.client.id,
                        enrollmentId: referral.targetEnrollment.id,
                      }
                    ),
                  },
                ]
              : []),
          ]}
        />
      );
    case CeReferralStatus.Rejected:
      return (
        <WayfindingDialog
          open={open}
          onClose={onClose}
          title='Referral Complete'
          alertTitle='Referral Declined'
          alertText={`${clientName} has been declined from ${opportunity.name}`}
          AlertProps={{
            icon: <DeclinedIcon />,
            severity: 'info',
          }}
          items={[
            {
              title: 'Back to Unit',
              to: generateSafePath(ProjectDashboardRoutes.UNIT, {
                projectId,
                unitId: opportunity.unit?.id,
              }),
            },
            {
              title: 'Go to My Dashboard',
              to: generateSafePath(Routes.MY_DASHBOARD),
            },
          ]}
        />
      );
    default:
      return undefined;
  }
};

export default ReferralWayfinder;
