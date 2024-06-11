import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { LoadingButton } from '@mui/lab';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cache } from '@/providers/apolloClient';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormIdentifierDetailsFragment,
  useCreateDraftFormMutation,
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
  editorRoute?: FormEditorType;
}

const EditFormButton: React.FC<EditFormButtonProps> = ({
  formIdentifier,
  text,
  Icon,
  editorRoute = FormEditorType.FormBuilder,
}) => {
  // todo @martha - question about what role this should have. remove the button role as in ButtonLink? other behaviors?

  const navigate = useNavigate();

  const goToEditor = useCallback(
    (draftId: string) => {
      const route =
        editorRoute === FormEditorType.JsonEditor
          ? AdminDashboardRoutes.JSON_EDIT_FORM
          : AdminDashboardRoutes.EDIT_FORM;

      navigate(
        generateSafePath(route, {
          identifier: formIdentifier.identifier,
          formId: draftId,
        })
      );
    },
    [formIdentifier, editorRoute, navigate]
  );

  const [createDraftForm, { loading, error }] = useCreateDraftFormMutation({
    variables: { identifier: formIdentifier.identifier },
    onCompleted: (data) => {
      if (data.createDraftForm?.formIdentifier?.draftVersion?.id) {
        cache.evict({ id: `FormIdentifier:${formIdentifier.identifier}` });
        goToEditor(data.createDraftForm?.formIdentifier?.draftVersion.id);
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
    >
      {text ? text : 'Edit Form'}
    </LoadingButton>
  );
};

export default EditFormButton;
