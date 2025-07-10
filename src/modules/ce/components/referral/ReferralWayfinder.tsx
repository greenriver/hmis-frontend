import React from 'react';
import WayfindingDialog from '@/components/elements/navigation/WayfindingDialog';
import { DeclinedIcon } from '@/components/elements/SemanticIcons';
import { useReferralContext } from '@/modules/ce/components/referral/ReferralPage';
import { EnrollmentDashboardRoutes, Routes } from '@/routes/routes';
import { CeReferralStatus } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  open: boolean;
  onClose: VoidFunction;
}
const ReferralWayfinder: React.FC<Props> = ({ open, onClose }) => {
  const { referral, unitPath } = useReferralContext();

  const { status, opportunity, clientName } = referral;

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
              title: 'Go to HMIS Dashboard',
              to: generateSafePath(Routes.USER_DASHBOARD),
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
            ...(unitPath
              ? [
                  {
                    title: 'Back to Unit',
                    to: unitPath,
                  },
                ]
              : []),
            {
              title: 'Go to HMIS Dashboard',
              to: generateSafePath(Routes.USER_DASHBOARD),
            },
          ]}
        />
      );
    default:
      return undefined;
  }
};

export default ReferralWayfinder;
