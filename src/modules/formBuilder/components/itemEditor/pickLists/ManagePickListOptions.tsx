import React, { useCallback, useEffect, useMemo } from 'react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import PickListOption from './PickListOption';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import {
  chooseSelectComponentType,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import CardGroup, {
  RemovableCard,
} from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import { FormItemControl } from '@/modules/formBuilder/components/itemEditor/types';
import { ItemType } from '@/types/gqlTypes';

export interface ManagePickListOptionsProps {
  control: FormItemControl;
}

const ManagePickListOptions: React.FC<ManagePickListOptionsProps> = ({
  control,
}) => {
  const itemTypeValue = useWatch({ control, name: 'type' });
  const itemComponentValue = useWatch({ control, name: 'component' });
  const repeatsValue = useWatch({ control, name: 'repeats' });
  const pickListOptionsValue = useWatch({ control, name: 'pickListOptions' });
  const pickListReferenceValue = useWatch({
    control,
    name: 'pickListReference',
  });

  // Whereas `itemComponentValue` above contains the user-provided component override (null if not specified),
  // `realItemComponent` is the actual component for the item, since Choice/Open Choice types
  // have their own rules for whether to show a dropdown or radio if the user hasn't specified anything.
  const formItemComponent = useMemo(() => {
    if (
      itemTypeValue &&
      [ItemType.Choice, ItemType.OpenChoice].includes(itemTypeValue)
    ) {
      return chooseSelectComponentType(
        itemComponentValue,
        repeatsValue,
        pickListOptionsValue?.length,
        !pickListReferenceValue
      );
    }
  }, [
    itemTypeValue,
    itemComponentValue,
    repeatsValue,
    pickListOptionsValue,
    pickListReferenceValue,
  ]);

  const pickListTypesPickList = localResolvePickList('PickListType') || [];

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'pickListOptions',
  });

  const {
    field: { onChange: onChangePickListReference, value: pickListReference },
  } = useController({
    control,
    name: 'pickListReference',
  });

  useEffect(() => {
    if (pickListReference) {
      replace([]);
    }
  }, [pickListReference, replace]);

  // `fields` above contains the defaultValues, so we also useWatch to get recent updates
  const fieldsWatch = useWatch({
    control,
    name: 'pickListOptions',
  });

  const setPickListInitialSelected = useCallback(
    (code: string) => {
      if (!fieldsWatch) return;
      const newFields = fieldsWatch.map((field) => {
        return { ...field, initialSelected: field?.code === code };
      });
      replace(newFields);
    },
    [replace, fieldsWatch]
  );

  const isCodeUnique = useCallback(
    (code: string) => {
      if (!fieldsWatch) return true;
      return fieldsWatch.filter((field) => field?.code === code).length <= 1;
    },
    [fieldsWatch]
  );

  if (!formItemComponent) return;

  return (
    <>
      <CardGroup
        onAddItem={() => {
          append({}, { shouldFocus: false });
          onChangePickListReference(null);
        }}
        addItemText='Add Choice'
      >
        {fields.map((option, index) => (
          <RemovableCard
            key={option.id}
            onRemove={() => remove(index)}
            removeTooltip={'Remove Choice'}
          >
            <PickListOption
              code={
                fieldsWatch && fieldsWatch[index]
                  ? fieldsWatch[index]?.code
                  : ''
              }
              control={control}
              index={index}
              formItemComponent={formItemComponent}
              setPickListInitialSelected={setPickListInitialSelected}
              isCodeUnique={isCodeUnique}
            />
          </RemovableCard>
        ))}
      </CardGroup>
      <ControlledSelect
        name='pickListReference'
        control={control}
        label='Or, use a reference list for choices'
        placeholder='Select list'
        options={pickListTypesPickList}
      />
    </>
  );
};

export default ManagePickListOptions;
