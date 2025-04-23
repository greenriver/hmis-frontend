import React, { useCallback, useMemo } from 'react';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  CeReferralSwimlaneFieldsFragment,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {
  swimlane: CeReferralSwimlaneFieldsFragment;
  users: string[];
  setUsers: (userIds: string[]) => void;
}
const AssignContactFormItem: React.FC<Props> = ({
  swimlane,
  users,
  setUsers,
}) => {
  const {
    data: { pickList: staffPickList } = {},
    loading: staffPickListLoading,
    error: staffPickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.Users,
    },
  });

  const selectedUsers = useMemo(
    () =>
      users.map((userId) => {
        return { code: userId };
      }),
    [users]
  );

  const handleChange = useCallback(
    (_event: React.ChangeEvent<unknown>, options: PickListOption[]) => {
      setUsers(options.map((option) => option.code));
    },
    [setUsers]
  );

  if (staffPickListError) throw staffPickListError;

  return (
    <FormSelect
      value={selectedUsers}
      placeholder={'Select Staff'}
      label={swimlane.name}
      loading={staffPickListLoading}
      options={staffPickList || []}
      onChange={handleChange}
      multiple={true}
    />
  );
};

export default AssignContactFormItem;
