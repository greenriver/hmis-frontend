import DateRangeIcon from '@mui/icons-material/DateRange';
import EditIcon from '@mui/icons-material/Edit';
import { Skeleton } from '@mui/material';
import { ReactNode, useMemo } from 'react';
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
import { FormDefinitionFieldsFragment, FormRole } from '@/types/gqlTypes';

interface Props {
  icon: 'calendar' | 'pencil';
  enrollment: NonNullable<EnrollmentDashboardContext['enrollment']>;
  formRole: FormRole;
  children?: ReactNode;
  title: string;
  onCompleted?: VoidFunction;
}

interface DataCollectionPointValueProps {
  enrollment: NonNullable<EnrollmentDashboardContext['enrollment']>;
  definition: FormDefinitionFieldsFragment;
  title: string;
}
export const DataCollectionPointValue: React.FC<
  DataCollectionPointValueProps
> = ({ enrollment, title, definition }) => {
  // Remove redundant labels from the form definition for read-only display
  const [modifiedReadOnlyDefinition, isEditable] = useMemo(() => {
    let isEditable = false;
    const modified = modifyFormDefinition(definition.definition, (item) => {
      if (item.text === title || item.readonlyText === title) {
        delete item.text;
        delete item.readonlyText;
      }
      if (isQuestionItem(item) && !item.readOnly) {
        isEditable = true;
      }
    });
    return [modified, isEditable];
  }, [definition.definition, title]);

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
      definition={modifiedReadOnlyDefinition}
      pickListArgs={pickListArgs}
      loadingElement={<Skeleton width='80px' height='100%' />}
    />
  );

  if (!isEditable) return dynamicView;
  return (
    <>
      <IconButtonContainer onClick={openFormDialog} Icon={EditIcon}>
        {dynamicView}
      </IconButtonContainer>
      {renderFormDialog({
        title,
        submitButtonText: 'Save',
        pickListArgs,
      })}
    </>
  );
};

const EditableOccurrencePointValue = ({
  children,
  icon,
  enrollment,
  formRole,
  title,
  onCompleted,
}: Props) => {
  const { openFormDialog, renderFormDialog } = useFormDialog({
    formRole,
    record: enrollment,
    localConstants: {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      projectType: enrollment.project.projectType,
      ...AlwaysPresentLocalConstants,
    },
    onCompleted,
    pickListArgs: {
      projectId: enrollment.project.id,
      householdId: enrollment.householdId,
    },
  });

  return (
    <>
      <IconButtonContainer
        onClick={openFormDialog}
        Icon={icon === 'calendar' ? DateRangeIcon : EditIcon}
      >
        {children}
      </IconButtonContainer>
      {renderFormDialog({
        title,
        submitButtonText: 'Save',
      })}
    </>
  );
};

const PermissionWrappedEditableOccurrencePointValue = (props: Props) => {
  if (!props.enrollment.access.canEditEnrollments) {
    return <>{props.children}</>;
  }
  return <EditableOccurrencePointValue {...props} />;
};

export default PermissionWrappedEditableOccurrencePointValue;
