import { ReactNode, useCallback, useMemo } from 'react';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  PickListOption,
  PickListType,
  ProjectAllFieldsFragment,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {
  project: ProjectAllFieldsFragment;
  value: PickListOption | null;
  onChange: (value: PickListOption | null) => void;
  helperText?: string;
  label?: ReactNode;
}
const CocPicker: React.FC<Props> = ({
  project,
  value,
  onChange,
  helperText,
  label,
}) => {
  const { data, loading, error } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.Coc,
      projectId: project.id,
    },
  });

  const pickList = useMemo(() => {
    return data?.pickList || [];
  }, [data]);

  const handleChange = useCallback(
    (_event: any, val: PickListOption | null) => onChange(val),
    [onChange]
  );

  if (error) throw error;

  return (
    <FormSelect<false>
      value={value}
      options={pickList}
      onChange={handleChange}
      loading={loading}
      label={label}
      helperText={helperText}
      placeholder='Select CoC...'
    />
  );
};

export default CocPicker;
