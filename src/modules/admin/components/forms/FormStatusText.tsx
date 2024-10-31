import { Typography } from '@mui/material';
import { FormIdentifierDetailsFragment, FormStatus } from '@/types/gqlTypes';

interface Props {
  identifier: FormIdentifierDetailsFragment;
}
const FormStatusText: React.FC<Props> = ({ identifier }) => {
  const isPublished = identifier.displayVersion.status === FormStatus.Published;
  const hasDraft = !!identifier.draftVersion;
  const isRetired = identifier.displayVersion.status === FormStatus.Retired;

  if (isPublished && hasDraft) {
    // Form is currently published, but there is also a Draft
    return (
      <Typography color='warning.dark' variant='body2'>
        Published with Unpublished Changes
      </Typography>
    );
  } else if (hasDraft) {
    // Form is not currently published, and there is a Draft
    return (
      <Typography color='error.dark' variant='body2'>
        Not Published
      </Typography>
    );
  } else if (isPublished) {
    // Form is published
    return (
      <Typography color='success.dark' variant='body2'>
        Published
      </Typography>
    );
  } else if (isRetired) {
    // Form is retired
    return <Typography variant='body2'>Retired</Typography>;
  } else {
    return 'Unknown';
  }
};

export default FormStatusText;
