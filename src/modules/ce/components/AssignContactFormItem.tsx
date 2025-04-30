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
      // TODO(#7506) (or later), add a new pick list type ELIGIBLE_REFERRAL_PARTICIPANT_USERS
      // and pass in the projectId to get users who are allowed to participate in this referral
      pickListType: PickListType.Users,
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
