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
}) => (
  <ValidationDialog
    open
    errorState={errorState}
    loading={loading}
    onConfirm={onConfirm}
    onCancel={onCancel}
    confirmText='Save Anyway'
  />
);

export default ImpactConfirmDialog;
