import React, { useCallback } from 'react';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  CeReferralSwimlaneFieldsFragment,
  PickListOption,
  PickListType,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {
  swimlane: CeReferralSwimlaneFieldsFragment;
  users: PickListOption[];
  setUsers: (userIds: PickListOption[]) => void;
  projectId: string;
}
const AssignContactFormItem: React.FC<Props> = ({
  swimlane,
  users,
  setUsers,
  projectId,
}) => {
  const {
    data: { pickList: staffPickList } = {},
    loading: staffPickListLoading,
    error: staffPickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.EligibleReferralStepAssignmentUsers,
      projectId: projectId,
    },
  });

  const handleChange = useCallback(
    (_event: React.ChangeEvent<unknown>, options: PickListOption[]) => {
      setUsers(options);
    },
    [setUsers]
  );

  if (staffPickListError) throw staffPickListError;

  return (
    <FormSelect
      value={users}
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
