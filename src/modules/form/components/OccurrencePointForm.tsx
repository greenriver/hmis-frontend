import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import { assign, isEmpty, isNil, omit } from 'lodash-es';
import React, { useMemo } from 'react';

import NotCollectedText from '@/components/elements/NotCollectedText';
import IconButtonContainer from '@/modules/enrollment/components/IconButtonContainer';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { SubmitFormInputVariables } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import {
  LocalConstants,
  PickListArgs,
  SubmitFormAllowedTypes,
} from '@/modules/form/types';
import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromRecord,
  getDisabledLinkIds,
  getInitialValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionFieldsFragment,
  FormDefinitionJson,
  FormRole,
  InitialBehavior,
} from '@/types/gqlTypes';

export interface OccurrencePointFormProps {
  record: SubmitFormAllowedTypes;
  definition: FormDefinitionFieldsFragment;
  submitFormInputVariables?: SubmitFormInputVariables;
  readOnlyDefinition: FormDefinitionJson;
  editable?: boolean;
  dialogTitle?: string;
  localConstants?: LocalConstants;
  pickListArgs?: PickListArgs;
}

/**
 * This component renders the values from the `record` into the `definition` and displays
 * it as a read-only view. If any of the `definition` items are not read-only, it shows
 * a pencil icon button. When clicked, it brings up a modal that renders a form according to
 * the `definition`, and submits changes using SubmitForm.
 *
 * This is currently primarily used for viewing/editing Custom Data Elements that are associated with
 * a Client or an Enrollment, on the Client Dashboard and Enrollment Dashboard respectively.
 */
const OccurrencePointForm: React.FC<OccurrencePointFormProps> = ({
  record,
  localConstants: localConstantsProp,
  definition,
  editable,
  readOnlyDefinition,
  dialogTitle,
  pickListArgs,
  submitFormInputVariables,
}) => {
  const itemMap = useMemo(
    () => getItemMap(definition.definition, false),
    [definition]
  );

  const localConstants = useMemo(
    () => ({
      ...localConstantsProp,
      ...AlwaysPresentLocalConstants,
    }),
    [localConstantsProp]
  );

  // Build values for DynamicView
  const values = useMemo(() => {
    // Set initial values (for "If Empty") behavior, so that forms can set
    // defaults for custom data elements (for example).
    const initialsIfEmpty = getInitialValues(
      definition.definition,
      localConstants,
      InitialBehavior.IfEmpty
    );
    // Apply values from the Enrollment
    const formValues = createInitialValuesFromRecord(itemMap, record);

    return assign(initialsIfEmpty, formValues);
  }, [itemMap, definition.definition, record, localConstants]);

  const hasAnyContent = useMemo(
    () => !!Object.keys(values).find((k) => !isNil(values[k])),
    [values]
  );

  const hasAnyEditableContent = useMemo(() => {
    if (!editable) return false;
    const initiallyDisabledLinkIds = getDisabledLinkIds({
      itemMap,
      values,
      localConstants: localConstants || {},
    });
    return !isEmpty(omit(values, initiallyDisabledLinkIds));
  }, [itemMap, editable, localConstants, values]);

  // Form dialog for editing
  const { openFormDialog, renderFormDialog } = useFormDialog({
    formRole: FormRole.OccurrencePoint,
    localDefinition: definition,
    record,
    inputVariables: submitFormInputVariables,
    localConstants,
  });

  // If there is NO data present, show DNC directly, rather than showing DNC for each field in the form.
  const dynamicView = hasAnyContent ? (
    <DynamicView
      key={JSON.stringify(values)}
      values={values}
      definition={readOnlyDefinition}
      pickListArgs={pickListArgs}
    />
  ) : (
    <Box width='100%'>
      <NotCollectedText />
    </Box>
  );

  if (!hasAnyEditableContent) return dynamicView;

  return (
    <>
      <IconButtonContainer
        onClick={openFormDialog}
        Icon={EditIcon}
        ButtonProps={{ 'aria-label': `Edit ${dialogTitle}` }}
      >
        {dynamicView}
      </IconButtonContainer>
      {renderFormDialog({
        title: dialogTitle,
        submitButtonText: 'Save',
        pickListArgs,
      })}
    </>
  );
};

export default OccurrencePointForm;
