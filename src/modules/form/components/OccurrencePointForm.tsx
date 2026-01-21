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
  InitialBehavior,
  RecordFormRole,
} from '@/types/gqlTypes';

export interface OccurrencePointFormProps {
  record: SubmitFormAllowedTypes;
  submitFormInputVariables?: SubmitFormInputVariables;
  /** Definition to use for displaying the occurrence point as a DynamicView */
  definitionForDisplay: FormDefinitionJson;
  /** Definition to use for editing the Occurrence Point form values (if allowed) */
  definition: FormDefinitionFieldsFragment;
  /** Whether the Occurence Point form is editable. Some Occurrence Point forms are always read-only (like 'number of units assigned'), and some are only editable by certain users (via editor_user_ids). */
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
  definitionForDisplay,
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
    const formValues = createInitialValuesFromRecord({
      itemMap,
      record,
    });

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
    formRole: RecordFormRole.OccurrencePoint,
    localDefinition: definition,
    record,
    inputVariables: submitFormInputVariables,
    localConstants,
  });

  // If there is NO data present, show DNC directly, rather than showing DNC for each field in the form.
  const dynamicView = hasAnyContent ? (
    <DynamicView
      values={values}
      definition={definitionForDisplay}
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
        IconButtonProps={{ 'aria-label': `Edit ${dialogTitle}` }}
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

/**
 * Wrapper to force OccurrencePointForm to re-render when the underlying record changes.
 * The DynamicView component does not re-render when the values change, so we need to force a re-render of the entire component.
 * This is a less-than-ideal solution, a more performant solution would be for DynamicView to internally handle changes to values/defaultValues.
 * Note: We stringify the entire record, because the occurrence point form may display data from multiple fields on the record
 * (e.g. custom data elements, move-in date field)
 */
const OccurrencePointFormWrapper: React.FC<OccurrencePointFormProps> = ({
  record,
  ...props
}) => {
  return (
    <OccurrencePointForm
      // key={JSON.stringify(record)}
      record={record}
      {...props}
    />
  );
};

export default OccurrencePointFormWrapper;
