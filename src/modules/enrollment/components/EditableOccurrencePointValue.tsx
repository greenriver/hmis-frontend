import EditIcon from '@mui/icons-material/Edit';
import { useMemo } from 'react';
import IconButtonContainer from './IconButtonContainer';
import { EnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { isQuestionItem } from '@/modules/form/types';
import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromRecord,
  getItemMap,
  modifyFormDefinition,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionFieldsFragment,
  FormDefinitionJson,
  FormItem,
  FormRole,
} from '@/types/gqlTypes';

function matchesTitle(item: FormItem, title: string) {
  return !![item.text, item.readonlyText].find(
    (s) => s && s.toLowerCase() === title.toLowerCase()
  );
}

export const parseOccurrencePointFormDefinition = (
  definition: FormDefinitionFieldsFragment,
  title?: string
) => {
  let displayTitle = title;
  let isEditable = false;
  const readOnlyDefinition = modifyFormDefinition(
    definition.definition,
    (item) => {
      if (title && matchesTitle(item, title)) {
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

interface DataCollectionPointValueProps {
  enrollment: NonNullable<EnrollmentDashboardContext['enrollment']>;
  definition: FormDefinitionFieldsFragment;
  readOnlyDefinition: FormDefinitionJson;
  editable?: boolean;
  dialogTitle?: string;
}

export const DataCollectionPointValue: React.FC<
  DataCollectionPointValueProps
> = ({ enrollment, definition, editable, readOnlyDefinition, dialogTitle }) => {
  // Build values for DynamicView
  const values = useMemo(() => {
    const itemMap = getItemMap(definition.definition, false);
    const formValues = createInitialValuesFromRecord(itemMap, enrollment);
    return formValues;
  }, [definition.definition, enrollment]);

  // Pick list args for form and display
  const pickListArgs = useMemo(
    () => ({
      projectId: enrollment.project.id,
      householdId: enrollment.householdId,
    }),
    [enrollment]
  );

  const { openFormDialog, renderFormDialog } = useFormDialog({
    formRole: FormRole.OccurrencePoint,
    localDefinition: definition,
    record: enrollment,
    inputVariables: {
      clientId: enrollment.client.id,
      enrollmentId: enrollment.id,
    },
    localConstants: {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      projectType: enrollment.project.projectType,
      ...AlwaysPresentLocalConstants,
    },
  });

  const dynamicView = (
    <DynamicView
      key={JSON.stringify(values)}
      values={values}
      definition={readOnlyDefinition}
      pickListArgs={pickListArgs}
    />
  );

  if (!editable) return dynamicView;

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
