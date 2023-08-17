import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { itemDefaults } from '@/modules/form/util/formUtil';
import { ItemType, PickListOption, PickListType } from '@/types/gqlTypes';

const ServiceTypeSelect = ({
  projectId,
  value,
  onChange,
}: {
  projectId: string;
  value: PickListOption | null;
  onChange: (val: PickListOption | null) => void;
}) => {
  const { pickList: serviceList, loading: serviceListLoading } = usePickList({
    item: {
      ...itemDefaults,
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.AvailableServiceTypes,
    },
    projectId,
    fetchOptions: { fetchPolicy: 'network-only' },
  });

  return (
    <FormSelect
      options={serviceList || []}
      value={value}
      onChange={(e, val) => onChange(isPickListOption(val) ? val : null)}
      loading={serviceListLoading}
      label={getRequiredLabel('Service Type', true)}
      placeholder='Select a service..'
    />
  );
};

export default ServiceTypeSelect;
