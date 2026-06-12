import { useMemo } from 'react';

import AffectedUnitGroupsTable, {
  AffectedUnitGroup,
} from './AffectedUnitGroupsTable';
import ValidationDialog from '@/modules/errors/components/ValidationDialog';
import { ErrorState } from '@/modules/errors/util';

interface Props {
  errorState: ErrorState;
  loading: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

const ImpactConfirmDialog: React.FC<Props> = ({
  errorState,
  loading,
  onConfirm,
  onCancel,
}) => {
  const affectedUnitGroups = useMemo(() => {
    return errorState.warnings.flatMap(
      (warning) =>
        (warning.data?.affectedUnitGroups as AffectedUnitGroup[] | undefined) ||
        []
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
      <AffectedUnitGroupsTable unitGroups={affectedUnitGroups} />
    </ValidationDialog>
  );
};

export default ImpactConfirmDialog;
