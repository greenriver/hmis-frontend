import React, { useCallback, useMemo } from 'react';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  CeSwimlane,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {
  swimlane: CeSwimlane;
  users: string[];
  setUsers: (swimlaneId: string, userIds: string[]) => void;
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

  const userPickListOptions = useMemo(
    () =>
      users.map((userId) => {
        return {
          code: userId,
        };
      }),
    [users]
  );

  const handleChange = useCallback(
    (_event: React.ChangeEvent<unknown>, options: PickListOption[]) => {
      setUsers(
        swimlane.id,
        options.map((option) => option.code)
      );
    },
    [setUsers, swimlane.id]
  );

  if (staffPickListError) throw staffPickListError;

  return (
    <FormSelect
      value={userPickListOptions}
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
