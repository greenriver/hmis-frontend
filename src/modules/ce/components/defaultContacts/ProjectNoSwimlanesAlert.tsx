import { Alert } from '@mui/material';

const ProjectNoSwimlanesAlert: React.FC = () => {
  return (
    <Alert severity='info'>
      This project does not have any unit groups that are using Coordinated
      Entry referral workflows.
    </Alert>
  );
};

export default ProjectNoSwimlanesAlert;
