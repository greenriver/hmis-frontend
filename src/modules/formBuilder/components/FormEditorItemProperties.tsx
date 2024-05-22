import { Stack, Typography } from '@mui/material';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import FormSelect from '@/modules/form/components/FormSelect';
import { isPickListOption } from '@/modules/form/types';
import {
  localResolvePickList,
  MAX_INPUT_AND_LABEL_WIDTH,
} from '@/modules/form/util/formUtil';
import { FormItem } from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];
const disabledDisplayPickList = localResolvePickList('DisabledDisplay') || [];
const inputSizePickList = localResolvePickList('InputSize') || [];

interface FormEditorItemPropertiesProps {
  item: FormItem;
  onChangeProperty: (attr: keyof FormItem, newProperty: any) => void;
}

const FormEditorItemProperties: React.FC<FormEditorItemPropertiesProps> = ({
  item,
  onChangeProperty,
}) => {
  return (
    <>
      <Typography>Properties</Typography>
      <Stack
        gap={2}
        component='form'
        onSubmit={() => {
          console.log('submitted'); // TODO(#6103)
        }}
        sx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH }}
      >
        <TextInput
          label='Link ID'
          value={item.linkId}
          onChange={(e) => {
            onChangeProperty('linkId', e.target.value);
          }}
          helperText='Unique ID for this form item'
        />
        <LabeledCheckbox
          label='Assessment date'
          checked={!!item.assessmentDate}
          onChange={(e) =>
            onChangeProperty(
              'assessmentDate',
              (e.target as HTMLInputElement).checked
            )
          }
        />
        <LabeledCheckbox
          label='Required'
          checked={item.required}
          onChange={(e) =>
            onChangeProperty('required', (e.target as HTMLInputElement).checked)
          }
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
        <LabeledCheckbox
          label='Warn if empty'
          checked={item.warnIfEmpty}
          onChange={(e) =>
            onChangeProperty(
              'warnIfEmpty',
              (e.target as HTMLInputElement).checked
            )
          }
        />
        <FormSelect
          label='Data collected about'
          value={
            dataCollectedAboutPickList.find(
              (o) => o.code === item.dataCollectedAbout
            ) || undefined
          }
          options={dataCollectedAboutPickList}
          onChange={(_e, value) => {
            console.log(value);
            onChangeProperty(
              'dataCollectedAbout',
              isPickListOption(value) ? value.code : undefined
            );
          }}
        />
        <FormSelect
          label='Size'
          value={
            inputSizePickList.find((o) => o.code === item.size) || undefined
          }
          options={inputSizePickList}
          onChange={(_e, value) => {
            console.log(value);
            onChangeProperty(
              'size',
              isPickListOption(value) ? value.code : undefined
            );
          }}
        />
        <FormSelect
          label='Disabled Display'
          value={
            disabledDisplayPickList.find(
              (o) => o.code === item.disabledDisplay
            ) || undefined
          }
          options={disabledDisplayPickList}
          onChange={(_e, value) => {
            console.log(value);
            onChangeProperty(
              'disabledDisplay',
              isPickListOption(value) ? value.code : undefined
            );
          }}
        />
        <TextInput
          label='Pick list reference'
          value={item.pickListReference || ''}
          onChange={(e) => {
            onChangeProperty('pickListReference', e.target.value);
          }}
        />
      </Stack>
    </>
  );
};

export default FormEditorItemProperties;
