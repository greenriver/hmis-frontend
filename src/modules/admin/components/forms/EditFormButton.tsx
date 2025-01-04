import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormIdentifierDetailsFragment,
  useCreateNextDraftFormDefinitionMutation,
} from '@/types/gqlTypes';

interface EditFormButtonProps {
  formIdentifier: FormIdentifierDetailsFragment;
  text?: string;
  Icon?: React.ComponentType;
  variant?: ButtonProps['variant'];
}

const EditFormButton: React.FC<EditFormButtonProps> = ({
  formIdentifier,
  text,
  variant,
}) => {
  const navigate = useNavigate();

  const editorRoute = AdminDashboardRoutes.EDIT_FORM;

  const [createDraftForm, { loading, error }] =
    useCreateNextDraftFormDefinitionMutation({
      variables: { identifier: formIdentifier.identifier },
      onCompleted: (data) => {
        const draftFormId =
          data.createNextDraftFormDefinition?.formIdentifier?.draftVersion?.id;
        if (draftFormId) {
          navigate(
            generatePath(editorRoute, {
              identifier: formIdentifier.identifier,
              formId: draftFormId,
            })
          );
        }
      },
    });

  if (error) throw error;

  // If form already has a draft, just link to it
  if (formIdentifier.draftVersion) {
    return (
      <ButtonLink
        to={generatePath(editorRoute, {
          identifier: formIdentifier.identifier,
          formId: formIdentifier.draftVersion.id,
        })}
        variant={variant}
        fullWidth
      >
        {text || 'Edit Form'}
      </ButtonLink>
    );
  }

  // If form does not have a draft yet, create one and then navigate
  return (
    <LoadingButton
      onClick={() => createDraftForm()}
      loading={loading}
      role='link'
      variant={variant}
    >
      {text || 'Edit Form'}
    </LoadingButton>
  );
};

export default EditFormButton;
