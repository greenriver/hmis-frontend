import { useMemo } from 'react';

import CeMatchRuleAffectedUnitGroupsTable, {
  CeMatchRuleAffectedUnitGroup,
} from './CeMatchRuleAffectedUnitGroupsTable';
import ValidationDialog from '@/modules/errors/components/ValidationDialog';
import { ErrorState } from '@/modules/errors/util';

interface Props {
  errorState: ErrorState;
  loading: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

const CeMatchRuleConfirmationDialog: React.FC<Props> = ({
  errorState,
  loading,
  onConfirm,
  onCancel,
}) => {
  const affectedUnitGroups = useMemo(() => {
    return errorState.warnings.flatMap(
      (warning) =>
        (warning.data?.affectedUnitGroups as
          | CeMatchRuleAffectedUnitGroup[]
          | undefined) || []
    );
  }, [errorState.warnings]);

  return (
    <ValidationDialog
      open
      maxWidth='md'
      errorState={errorState}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText='Save Anyway'
    >
      <CeMatchRuleAffectedUnitGroupsTable unitGroups={affectedUnitGroups} />
    </ValidationDialog>
  );
};

export default CeMatchRuleConfirmationDialog;
