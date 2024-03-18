import { useEffect } from 'react';
import { GenericSelectProps } from '@/components/elements/input/GenericSelect';
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
  bulk = false,
  ...props
}: {
  projectId: string;
  value: PickListOption | null;
  onChange: (val: PickListOption | null) => void;
  bulk?: boolean;
} & Omit<
  GenericSelectProps<PickListOption, false, false>,
  'options' | 'value' | 'onChange'
>) => {
  const { pickList: serviceList, loading: serviceListLoading } = usePickList({
    item: {
      ...itemDefaults,
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: bulk
        ? PickListType.AvailableBulkServiceTypes
        : PickListType.AvailableServiceTypes,
    },
    projectId,
    fetchOptions: { fetchPolicy: 'network-only' },
  });

  useEffect(() => {
    if (!serviceList) return;

    const initial = serviceList.find((s) => s.initialSelected);
    if (initial) onChange(initial);
  }, [onChange, serviceList]);

  return (
    <FormSelect
      options={serviceList || []}
      value={value}
      onChange={(e, val) => onChange(isPickListOption(val) ? val : null)}
      loading={serviceListLoading}
      label={getRequiredLabel('Service Type', true)}
      placeholder='Select a service..'
      {...props}
    />
  );
};

export default ServiceTypeSelect;
