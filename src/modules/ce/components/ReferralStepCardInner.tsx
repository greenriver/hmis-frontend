import React, { ReactNode, useMemo } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CompletedIcon } from '@/components/elements/SemanticIcons';
import { CeReferralStepStatus } from '@/types/gqlTypes';

interface Props {
  name: string;
  status: CeReferralStepStatus;
  action?: ReactNode;
  children?: ReactNode;
}

const ReferralStepCardInner: React.FC<Props> = ({
  name,
  status,
  action,
  children,
}) => {
  const icon =
    status === CeReferralStepStatus.Completed ? CompletedIcon : undefined;

  const sx = useMemo(() => {
    switch (status) {
      case CeReferralStepStatus.Available:
      case CeReferralStepStatus.InProgress:
        return {
          borderColor: 'primary.main',
          borderLeftWidth: '5px',
        };
      case CeReferralStepStatus.Completed:
        return {
          borderColor: 'grayscale.light',
          borderLeftWidth: '5px',
          backgroundColor: 'grayscale.surface',
        };
      case CeReferralStepStatus.Unavailable:
        return {
          borderColor: 'borders.light',
          borderLeftWidth: '5px',
          color: 'text.secondary',
        };
      default:
        return {};
    }
  }, [status]);

  return (
    <CommonCard title={name} Icon={icon} sx={sx} actions={action}>
      {children}
    </CommonCard>
  );
};

export default ReferralStepCardInner;
