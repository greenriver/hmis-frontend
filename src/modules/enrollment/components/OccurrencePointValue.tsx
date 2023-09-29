import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import { assign, isEmpty, isNil, omit } from 'lodash-es';
import { useMemo } from 'react';
import IconButtonContainer from './IconButtonContainer';
import NotCollectedText from '@/components/elements/NotCollectedText';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { FormValues, isQuestionItem } from '@/modules/form/types';
import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromRecord,
  getItemMap,
  getInitialValues,
  modifyFormDefinition,
  getDisabledLinkIds,
} from '@/modules/form/util/formUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import {
  FormDefinitionFieldsFragment,
  FormDefinitionJson,
  FormItem,
  FormRole,
  InitialBehavior,
} from '@/types/gqlTypes';

function matchesTitle(item: FormItem, title: string) {
  return !![item.text, item.readonlyText].find(
    (s) => s && s.toLowerCase() === title.toLowerCase()
  );
}

export const parseOccurrencePointFormDefinition = (
  definition: FormDefinitionFieldsFragment
) => {
  let displayTitle = definition.title;
  let isEditable = false;
  const readOnlyDefinition = modifyFormDefinition(
    definition.definition,
    (item) => {
      if (definition.title && matchesTitle(item, definition.title)) {
        displayTitle = item.readonlyText || item.text || displayTitle;
        delete item.text;
        delete item.readonlyText;
      }
      if (isQuestionItem(item) && !item.readOnly) {
        isEditable = true;
      }
    }
  );

  return { displayTitle, isEditable, readOnlyDefinition };
};

function hasAnyValues(object: FormValues) {
  return !!Object.keys(object).find((k) => !isNil(object[k]));
}

interface OccurrencePointValueProps {
  enrollment: DashboardEnrollment;
  definition: FormDefinitionFieldsFragment;
  readOnlyDefinition: FormDefinitionJson;
  editable?: boolean;
  dialogTitle?: string;
}

const OccurrencePointValue: React.FC<OccurrencePointValueProps> = ({
  enrollment,
  definition,
  editable,
  readOnlyDefinition,
  dialogTitle,
}) => {
  const itemMap = useMemo(
    () => getItemMap(definition.definition, false),
    [definition]
  );

  const localConstants = useMemo(
    () => ({
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      projectType: enrollment.project.projectType,
      ...AlwaysPresentLocalConstants,
    }),
    [enrollment.entryDate, enrollment.exitDate, enrollment.project.projectType]
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
    const formValues = createInitialValuesFromRecord(itemMap, enrollment);

    return assign(initialsIfEmpty, formValues);
  }, [itemMap, definition.definition, enrollment, localConstants]);

  const hasAnyContent = useMemo(() => hasAnyValues(values), [values]);

  const hasAnyEditableContent = useMemo(() => {
    if (!editable) return false;
    const initiallyDisabledLinkIds = getDisabledLinkIds({
      itemMap,
      values,
      localConstants: localConstants || {},
    });
    return !isEmpty(omit(values, initiallyDisabledLinkIds));
  }, [itemMap, editable, localConstants, values]);

  // Pick list args for form and display
  const pickListArgs = useMemo(
    () => ({
      projectId: enrollment.project.id,
      householdId: enrollment.householdId,
    }),
    [enrollment]
  );

  // Form dialog for editing
  const { openFormDialog, renderFormDialog } = useFormDialog({
    formRole: FormRole.OccurrencePoint,
    localDefinition: definition,
    record: enrollment,
    inputVariables: {
      clientId: enrollment.client.id,
      enrollmentId: enrollment.id,
    },
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
      <IconButtonContainer onClick={openFormDialog} Icon={EditIcon}>
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

export default OccurrencePointValue;
