import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { LoadingButton } from '@mui/lab';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormIdentifierDetailsFragment,
  useCreateNextDraftFormDefinitionMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export enum FormEditorType {
  FormBuilder,
  JsonEditor,
}

interface EditFormButtonProps {
  formIdentifier: FormIdentifierDetailsFragment;
  text?: string;
  Icon?: React.ComponentType;
  editorType?: FormEditorType;
}

const EditFormButton: React.FC<EditFormButtonProps> = ({
  formIdentifier,
  text,
  Icon,
  editorType = FormEditorType.FormBuilder,
}) => {
  const navigate = useNavigate();

  const goToEditor = useCallback(
    (draftId: string) => {
      const route =
        editorType === FormEditorType.JsonEditor
          ? AdminDashboardRoutes.JSON_EDIT_FORM
          : AdminDashboardRoutes.EDIT_FORM;

      navigate(
        generateSafePath(route, {
          identifier: formIdentifier.identifier,
          formId: draftId,
        })
      );
    },
    [formIdentifier, editorType, navigate]
  );

  const [createDraftForm, { loading, error }] =
    useCreateNextDraftFormDefinitionMutation({
      variables: { identifier: formIdentifier.identifier },
      onCompleted: (data) => {
        if (
          data.createNextDraftFormDefinition?.formIdentifier?.draftVersion?.id
        ) {
          goToEditor(
            data.createNextDraftFormDefinition?.formIdentifier?.draftVersion.id
          );
        }
      },
    });

  const onClick = useCallback(() => {
    if (formIdentifier.draftVersion) {
      goToEditor(formIdentifier.draftVersion.id);
    } else {
      createDraftForm();
    }
  }, [formIdentifier.draftVersion, goToEditor, createDraftForm]);

  if (error) throw error;

  return (
    <LoadingButton
      onClick={() => onClick()}
      startIcon={Icon ? <Icon /> : <DashboardCustomizeIcon />}
      loading={loading}
      role='link'
    >
      {text || 'Edit Form'}
    </LoadingButton>
  );
};

export default EditFormButton;
