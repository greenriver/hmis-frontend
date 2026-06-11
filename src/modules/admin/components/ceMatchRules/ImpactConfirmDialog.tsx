import AffectedUnitGroupsTable from './AffectedUnitGroupsTable';
import { getAffectedUnitGroups } from './ceMatchRuleUtil';
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
  const affectedUnitGroups = getAffectedUnitGroups(errorState.warnings);

  return (
    <ValidationDialog
      open
      maxWidth='md'
      errorState={errorState}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText='Save Anyway'
      warningExtraContent={
        <AffectedUnitGroupsTable unitGroups={affectedUnitGroups} />
      }
    />
  );
};

export default ImpactConfirmDialog;
