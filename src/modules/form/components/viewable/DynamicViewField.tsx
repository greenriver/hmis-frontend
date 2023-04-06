import { Box, Stack, Typography } from '@mui/material';
import { intersectionBy } from 'lodash-es';
import React from 'react';

import { usePickList } from '../../hooks/usePickList';
import {
  ChangeType,
  DynamicViewFieldProps,
  DynamicInputCommonProps,
  isPickListOption,
  isPickListOptionArray,
} from '../../types';
import { hasMeaningfulValue } from '../../util/formUtil';

// import CreatableFormSelect from './CreatableFormSelect';
// import DynamicDisplay from './DynamicDisplay';
// import FormSelect from './FormSelect';
// import InputContainer from './InputContainer';

// import DatePicker from '@/components/elements/input/DatePicker';
// import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
// import NoYesMissingCheckbox from '@/components/elements/input/NoYesMissingCheckbox';
// import NumberInput from '@/components/elements/input/NumberInput';
// import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
// import SsnInput from '@/components/elements/input/SsnInput';
// import TextInput from '@/components/elements/input/TextInput';
// import YesNoRadio from '@/components/elements/input/YesNoRadio';
// import Uploader from '@/components/elements/upload/UploaderBase';
import {
  INVALID_ENUM,
  // parseHmisDateString
} from '@/modules/hmis/hmisUtil';
import { Component, FormItem, InputSize, ItemType } from '@/types/gqlTypes';

const getLabel = (item: FormItem, horizontal?: boolean) => {
  if (!item.prefix && !item.text) return null;

  return (
    <Stack direction='row' spacing={1}>
      <Typography
        variant='body2'
        fontWeight={
          item.component === Component.Checkbox || horizontal ? undefined : 600
        }
      >
        {item.text}
      </Typography>
      {item.required && (
        <Typography variant='body2' color='error'>
          (Required)
        </Typography>
      )}
    </Stack>
  );
};

// const MAX_INPUT_AND_LABEL_WIDTH = 600; // allow label to extend past input before wrapping
// const MAX_INPUT_WIDTH = 430;
const FIXED_WIDTH_SMALL = 200;
const FIXED_WIDTH_X_SMALL = 100;

export const maxWidthAtNestingLevel = (nestingLevel: number) =>
  600 - nestingLevel * 26;

const DynamicField: React.FC<DynamicViewFieldProps> = ({
  item,
  itemChanged,
  nestingLevel,
  value,
  disabled = false,
  horizontal = false,
  errors,
  inputProps,
  pickListRelationId,
  noLabel = false,
  warnIfEmpty = false,
}) => {
  const { linkId } = item;

  const label = noLabel ? null : getLabel(item, horizontal);
  let maxWidth = maxWidthAtNestingLevel(nestingLevel);
  const minWidth = undefined;
  let width;

  if (item.size === InputSize.Small || item.type === ItemType.Date) {
    width = FIXED_WIDTH_SMALL;
  } else if (item.size === InputSize.Xsmall) {
    width = FIXED_WIDTH_X_SMALL;
  }

  if (item.component === Component.RadioButtons) {
    maxWidth = 600;
  }

  const commonContainerProps = { errors, horizontal };

  const isInvalidEnumValue =
    value === INVALID_ENUM || value?.code === INVALID_ENUM;

  const commonInputProps: DynamicInputCommonProps = {
    disabled,
    label,
    error: !!(errors && errors.length > 0) || isInvalidEnumValue,
    helperText: item.helperText,
    id: linkId,
    ...inputProps,
  };
  commonInputProps.warnIfEmptyTreatment =
    warnIfEmpty &&
    (!!item.warnIfEmpty || !!item.required) &&
    !commonInputProps.disabled &&
    !commonInputProps.error &&
    !hasMeaningfulValue(value);

  const [options, pickListLoading, isLocalPickList] = usePickList(
    item,
    pickListRelationId,
    {
      fetchPolicy: 'network-only', // Always fetch, because ProjectCoC and Enrollment records change
      onCompleted: (data) => {
        if (!data?.pickList) return;

        // If there is no value, look for InitialSelected value and set it
        if (!hasMeaningfulValue(value)) {
          const initial = item.repeats
            ? data.pickList.filter((o) => o.initialSelected)
            : data.pickList.find((o) => o.initialSelected);
          if (initial) {
            itemChanged({ linkId, value: initial, type: ChangeType.System });
          }
          return;
        }

        // Try to find the "full" option (including label) for this value from the pick list
        let fullOption;
        if (isPickListOption(value)) {
          fullOption = data.pickList.find((o) => o.code === value.code);
        } else if (isPickListOptionArray(value)) {
          fullOption = intersectionBy(data.pickList, value, 'code');
        }

        if (fullOption) {
          // Update the value so that it shows the complete label
          itemChanged({ linkId, value: fullOption, type: ChangeType.System });
        } else {
          console.warn(
            `Selected value '${JSON.stringify(
              value
            )}' is not present in option list '${item.pickListReference}'`
          );
        }
      },
    }
  );

  const placeholder =
    item.size === InputSize.Xsmall
      ? undefined
      : `Select ${item.briefText || item.text || ''}...`;

  return (
    <Box>
      <Typography>
        {item.type}
      </Typography>
    </Box>
  )

  // switch (item.type) {
  //   case ItemType.Display:
  //     return <DynamicDisplay maxWidth={maxWidth + 100} item={item} />;
  //   case ItemType.Boolean:
  //     if (item.component === Component.Checkbox) {
  //       return (
  //         <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //           <LabeledCheckbox
  //             checked={!!value}
  //             onChange={(e) =>
  //               itemChanged({
  //                 linkId,
  //                 value: (e.target as HTMLInputElement).checked,
  //                 type: ChangeType.User,
  //               })
  //             }
  //             horizontal={horizontal}
  //             {...commonInputProps}
  //           />
  //         </InputContainer>
  //       );
  //     }
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <YesNoRadio
  //           value={value}
  //           onChange={onChangeValue}
  //           {...commonInputProps}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.String:
  //   case ItemType.Text:
  //     if (item.component === Component.Ssn)
  //       return (
  //         <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //           <SsnInput
  //             id={linkId}
  //             name={linkId}
  //             value={value || ''}
  //             onChange={onChangeValue}
  //             sx={{
  //               width,
  //               maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
  //               '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
  //             }}
  //             {...commonInputProps}
  //           />
  //         </InputContainer>
  //       );

  //     const multiline = item.type === ItemType.Text;
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <TextInput
  //           value={value || ''}
  //           onChange={onChangeEvent}
  //           multiline={multiline}
  //           minRows={multiline ? 2 : undefined}
  //           horizontal={horizontal}
  //           sx={{
  //             width,
  //             maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
  //             '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
  //           }}
  //           {...commonInputProps}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.Integer:
  //   case ItemType.Currency:
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <NumberInput
  //           value={isNil(value) ? '' : value}
  //           onChange={onChangeEvent}
  //           horizontal={horizontal}
  //           currency={item.type === ItemType.Currency}
  //           inputWidth={width}
  //           disableArrowKeys={item.type === ItemType.Currency}
  //           {...commonInputProps}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.Date:
  //     const datePickerProps = {};
  //     const dateValue =
  //       value && typeof value === 'string' ? parseHmisDateString(value) : value;
  //     // item.type === ItemType.Dob
  //     //   ? { openTo: 'year' as CalendarPickerView, disableFuture: true }
  //     //   : {};
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <DatePicker
  //           value={dateValue || null}
  //           onChange={onChangeValue}
  //           textInputProps={{
  //             id: linkId,
  //             horizontal,
  //             sx: { width },
  //           }}
  //           {...datePickerProps}
  //           {...commonInputProps}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.OpenChoice:
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const selectedChoiceVal = value ? value : item.repeats ? [] : null;
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <CreatableFormSelect
  //           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //           value={selectedChoiceVal}
  //           options={options || []}
  //           onChange={onChangeEventValue}
  //           multiple={!!item.repeats}
  //           loading={pickListLoading}
  //           placeholder={placeholder}
  //           textInputProps={{
  //             horizontal,
  //             sx: {
  //               maxWidth: MAX_INPUT_AND_LABEL_WIDTH,
  //               '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
  //             },
  //           }}
  //           {...commonInputProps}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.Choice:
  //     const currentValue = value ? value : item.repeats ? [] : null;

  //     let inputComponent;
  //     if (
  //       item.component === Component.Checkbox &&
  //       item.pickListReference === 'NoYesMissing'
  //     ) {
  //       inputComponent = (
  //         <NoYesMissingCheckbox
  //           value={currentValue}
  //           onChange={onChangeValue}
  //           horizontal={horizontal}
  //           {...commonInputProps}
  //         />
  //       );
  //     } else if (
  //       item.component === Component.RadioButtons ||
  //       item.component === Component.RadioButtonsVertical ||
  //       (isLocalPickList && options && options.length > 0 && options.length < 4)
  //     ) {
  //       inputComponent = (
  //         <RadioGroupInput
  //           value={currentValue}
  //           onChange={onChangeValue}
  //           options={options || []}
  //           row={item.component !== Component.RadioButtonsVertical}
  //           clearable
  //           checkbox
  //           {...commonInputProps}
  //         />
  //       );
  //     } else {
  //       inputComponent = (
  //         <FormSelect
  //           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //           value={currentValue}
  //           options={options || []}
  //           onChange={onChangeEventValue}
  //           multiple={!!item.repeats}
  //           loading={pickListLoading}
  //           placeholder={placeholder}
  //           textInputProps={{
  //             name: linkId,
  //             horizontal,
  //             sx: {
  //               width,
  //               // cant allow label to extend, because it messes up click target for closing dropdwon
  //               maxWidth: MAX_INPUT_WIDTH,
  //               '.MuiInputBase-root': { maxWidth: MAX_INPUT_WIDTH },
  //             },
  //           }}
  //           sx={{ maxWidth: MAX_INPUT_WIDTH }} // for click target for closing dropdwon
  //           {...commonInputProps}
  //         />
  //       );
  //     }

  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         {inputComponent}
  //       </InputContainer>
  //     );
  //   case ItemType.Image:
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <Uploader
  //           id={linkId}
  //           image
  //           onUpload={async (upload) => onChangeValue(upload.blobId)}
  //         />
  //       </InputContainer>
  //     );
  //   case ItemType.File:
  //     return (
  //       <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
  //         <Uploader
  //           id={linkId}
  //           onUpload={async (upload) => onChangeValue(upload.blobId)}
  //         />
  //       </InputContainer>
  //     );
  //   default:
  //     console.warn('Unrecognized item type:', item.type);
  //     return <></>;
  // }
};

export default DynamicField;
