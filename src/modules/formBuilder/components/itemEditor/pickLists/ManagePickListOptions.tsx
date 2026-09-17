import { IconButton } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, UseFormSetValue, useWatch } from 'react-hook-form';
import PickListOption from './PickListOption';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import CardGroup, { RemovableCard } from '@/components/elements/CardGroup';
import {
  ExpandLessIcon,
  ExpandMoreIcon,
} from '@/components/elements/SemanticIcons';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { chooseSelectComponentType } from '@/modules/form/util/formUtil';
import {
  FormItemControl,
  FormItemState,
} from '@/modules/formBuilder/components/itemEditor/types';
import { supportedPickListReferencesOptions } from '@/modules/formBuilder/formBuilderUtil';
import { ItemType } from '@/types/gqlTypes';

export interface ManagePickListOptionsProps {
  control: FormItemControl;
  setValue: UseFormSetValue<FormItemState>;
}

const ManagePickListOptions: React.FC<ManagePickListOptionsProps> = ({
  control,
  setValue,
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

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'pickListOptions',
  });

  const isCodeUnique = useCallback(
    (code: string) => {
      if (!pickListOptionsValue) return true;
      return (
        pickListOptionsValue.filter((field) => field?.code === code).length <= 1
      );
    },
    [pickListOptionsValue]
  );

  const isInitialSelectedUnique = useCallback(
    (checked: boolean) => {
      if (!pickListOptionsValue) return true;
      if (!checked) return true;
      return (
        pickListOptionsValue.filter((field) => field?.initialSelected).length <=
        1
      );
    },
    [pickListOptionsValue]
  );

  const eitherOptionsOrReferenceProvided = useMemo(
    () =>
      !!pickListReferenceValue ||
      (pickListOptionsValue && pickListOptionsValue.length > 0),
    [pickListReferenceValue, pickListOptionsValue]
  );

  if (!formItemComponent) return;

  return (
    <>
      <CardGroup
        onAddItem={() => {
          append({});
          setValue('pickListReference', null);
        }}
        addItemText='Add Option'
      >
        {fields.map((option, index) => (
          <RemovableCard
            key={option.id}
            onRemove={() => remove(index)}
            removeTooltip={'Remove Option'}
            additionalActions={
              <>
                <ButtonTooltipContainer title='Move up'>
                  <IconButton
                    onClick={() => move(index, index - 1)}
                    size='small'
                    disabled={index === 0}
                    aria-label={`Option ${index + 1} move up`}
                  >
                    <ExpandLessIcon fontSize='small' />
                  </IconButton>
                </ButtonTooltipContainer>
                <ButtonTooltipContainer title='Move down'>
                  <IconButton
                    onClick={() => move(index, index + 1)}
                    size='small'
                    disabled={index === fields.length - 1}
                    aria-label={`Option ${index + 1} move down`}
                  >
                    <ExpandMoreIcon fontSize='small' />
                  </IconButton>
                </ButtonTooltipContainer>
              </>
            }
          >
            <PickListOption
              control={control}
              index={index}
              formItemComponent={formItemComponent}
              isCodeUnique={isCodeUnique}
              isInitialSelectedUnique={isInitialSelectedUnique}
            />
          </RemovableCard>
        ))}
      </CardGroup>
      <ControlledSelect
        name='pickListReference'
        control={control}
        label='Or, use a reference list for options'
        placeholder='Select list'
        options={supportedPickListReferencesOptions}
        rules={{
          validate: () =>
            eitherOptionsOrReferenceProvided ||
            'Required: Either choose a reference list or Add Choice above',
        }}
        onChange={(code) => {
          if (!!code) setValue('pickListOptions', []);
        }}
      />
    </>
  );
};

export default ManagePickListOptions;
