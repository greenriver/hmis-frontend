import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormIdentifierDetailsFragment,
  useCreateDuplicateFormDefinitionMutation,
} from '@/types/gqlTypes';

interface Props {
  formIdentifier: FormIdentifierDetailsFragment;
}

const DuplicateFormButton: React.FC<Props> = ({ formIdentifier }) => {
  const navigate = useNavigate();

  const [duplicateForm, { loading, error }] =
    useCreateDuplicateFormDefinitionMutation({
      variables: { identifier: formIdentifier.identifier },
      onCompleted: (data) => {
        const newFormIdentifier =
          data.createDuplicateFormDefinition?.formIdentifier?.identifier;
        if (newFormIdentifier) {
          navigate(
            generatePath(AdminDashboardRoutes.VIEW_FORM, {
              identifier: newFormIdentifier,
            })
          );
        }
      },
    });

  if (error) throw error;

  return (
    <>
      <LoadingButton
        onClick={() => duplicateForm()}
        loading={loading}
        role='link'
        variant='outlined'
      >
        {'Duplicate Form'}
      </LoadingButton>
      {formIdentifier.managedInVersionControl && (
        <Typography variant='caption'>
          This is a system-managed form that cannot be edited directly. This
          form is automatically updated. To make changes, you can either contact
          support or duplicate the form.
        </Typography>
      )}
    </>
  );
};

export default DuplicateFormButton;
