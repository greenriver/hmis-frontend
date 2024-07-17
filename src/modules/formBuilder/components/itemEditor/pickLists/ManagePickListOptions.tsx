import React, { useCallback } from 'react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import PickListOption from './PickListOption';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import CardGroup, {
  RemovableCard,
} from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import { FormItemControl } from '@/modules/formBuilder/components/itemEditor/types';
import { Component } from '@/types/gqlTypes';

export interface ManagePickListOptionsProps {
  control: FormItemControl;
  formItemComponent: Component;
}

const ManagePickListOptions: React.FC<ManagePickListOptionsProps> = ({
  control,
  formItemComponent,
}) => {
  const pickListTypesPickList = localResolvePickList('PickListType') || [];

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'pickListOptions',
  });

  const {
    field: { onChange: onChangePickListReference },
  } = useController({
    control,
    name: 'pickListReference',
  });

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
        onChange={(value) => {
          if (value) replace([]);
        }}
      />
    </>
  );
};

export default ManagePickListOptions;
