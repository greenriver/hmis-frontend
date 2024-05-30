import { Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import AutofillProperties from './AutofillProperties';
import EnableWhenSelection from './EnableWhenSelection';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import FormSelect from '@/modules/form/components/FormSelect';
import { isPickListOption } from '@/modules/form/types';
import {
  MAX_INPUT_AND_LABEL_WIDTH,
  getItemMap,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import {
  AssessmentRole,
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];
const disabledDisplayPickList = localResolvePickList('DisabledDisplay') || [];
const inputSizePickList = localResolvePickList('InputSize') || [];
const pickListTypesPickList = localResolvePickList('PickListType') || [];

interface FormEditorItemPropertiesProps {
  item: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  onChangeProperty: (attr: keyof FormItem, newProperty: any) => void;
}

const FormEditorItemProperties: React.FC<FormEditorItemPropertiesProps> = ({
  item,
  definition,
  onChangeProperty,
}) => {
  const isAssessment = useMemo(
    () => (Object.values(AssessmentRole) as [string]).includes(definition.role),
    [definition.role]
  );
  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition.definition]
  );

  return (
    <>
      <Typography>Properties</Typography>
      <Stack
        gap={2}
        component='form'
        onSubmit={() => {
          // TODO(#6103)
        }}
        sx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH }}
      >
        <EnableWhenSelection
          enableBehavior={item.enableBehavior}
          onChangeEnableBehavior={(enableBehavior) =>
            onChangeProperty('enableBehavior', enableBehavior)
          }
          conditions={item.enableWhen || []}
          onChange={(conditions) => onChangeProperty('enableWhen', conditions)}
          itemMap={itemMap}
        />
        <AutofillProperties
          values={item.autofillValues || []}
          onChange={(values) => onChangeProperty('autofillValues', values)}
          itemMap={itemMap}
        />
        <TextInput
          label='Link ID'
          value={item.linkId}
          onChange={(e) => {
            // Disallow typing invalid characters
            const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
            if (regex.test(e.target.value))
              onChangeProperty('linkId', e.target.value);
          }}
          helperText='Unique ID for this form item'
        />
        {item.type === ItemType.Date && isAssessment && (
          <LabeledCheckbox
            label='Assessment date'
            checked={!!item.assessmentDate}
            onChange={(e) =>
              onChangeProperty(
                'assessmentDate',
                (e.target as HTMLInputElement).checked
              )
            }
            helperText='If checked, this date will be recorded as the Assessment Date on the assessment'
          />
        )}
        <LabeledCheckbox
          label='Required'
          checked={item.required}
          onChange={(e) =>
            onChangeProperty('required', (e.target as HTMLInputElement).checked)
          }
        />
        <LabeledCheckbox
          label='Warn if empty'
          checked={item.warnIfEmpty}
          onChange={(e) =>
            onChangeProperty(
              'warnIfEmpty',
              (e.target as HTMLInputElement).checked
            )
          }
          helperText="If checked, user will see a warning if they don't provide an answer to this question."
        />
        <TextInput
          label='Label'
          value={item.text}
          onChange={(e) => {
            onChangeProperty('text', e.target.value);
          }}
        />
        <TextInput
          label='Helper text'
          value={item.helperText || ''}
          onChange={(e) => {
            onChangeProperty('helperText', e.target.value);
          }}
        />
        <TextInput
          label='Brief label'
          value={item.briefText || ''}
          onChange={(e) => {
            onChangeProperty('briefText', e.target.value);
          }}
          helperText="Label to display when the item is referenced briefly, such as in an Autofill dialog box. If not specified, the item's normal label text is shown."
        />
        <TextInput
          label='Read-only label'
          value={item.readonlyText || ''}
          onChange={(e) => {
            onChangeProperty('readonlyText', e.target.value);
          }}
          helperText="Label to display when the item is shown in a read-only form. If not specified, the item's normal label text is shown."
        />
        <LabeledCheckbox
          label='Read-only'
          checked={item.readOnly}
          onChange={(e) =>
            onChangeProperty('readOnly', (e.target as HTMLInputElement).checked)
          }
        />
        <LabeledCheckbox
          label='Hidden'
          checked={item.hidden}
          onChange={(e) =>
            onChangeProperty('hidden', (e.target as HTMLInputElement).checked)
          }
        />
        <TextInput
          // TODO(#5776)
          label='Mapping for custom field key'
          value={item.mapping?.customFieldKey || ''}
          onChange={(e) => {
            onChangeProperty('mapping', { customFieldKey: e.target.value });
          }}
        />
        {isAssessment && (
          <FormSelect
            label='Data collected about'
            value={
              dataCollectedAboutPickList.find(
                (o) => o.code === item.dataCollectedAbout
              ) || undefined
            }
            options={dataCollectedAboutPickList}
            onChange={(_e, value) => {
              onChangeProperty(
                'dataCollectedAbout',
                isPickListOption(value) ? value.code : undefined
              );
            }}
          />
        )}
        <FormSelect
          label='Size'
          value={
            inputSizePickList.find((o) => o.code === item.size) || undefined
          }
          options={inputSizePickList}
          onChange={(_e, value) => {
            onChangeProperty(
              'size',
              isPickListOption(value) ? value.code : undefined
            );
          }}
        />
        {item.enableWhen && (
          <FormSelect
            label='Disabled Display'
            value={
              disabledDisplayPickList.find(
                (o) => o.code === item.disabledDisplay
              ) || undefined
            }
            options={disabledDisplayPickList}
            onChange={(_e, value) => {
              onChangeProperty(
                'disabledDisplay',
                isPickListOption(value) ? value.code : undefined
              );
            }}
          />
        )}
        {[ItemType.Choice, ItemType.OpenChoice].includes(item.type) && (
          <FormSelect
            label='Pick list reference'
            value={
              pickListTypesPickList.find(
                (o) => o.code === item.pickListReference
              ) || undefined
            }
            options={pickListTypesPickList}
            onChange={(_e, value) => {
              onChangeProperty(
                'pickListReference',
                isPickListOption(value) ? value.code : undefined
              );
            }}
          />
        )}
      </Stack>
    </>
  );
};

export default FormEditorItemProperties;
