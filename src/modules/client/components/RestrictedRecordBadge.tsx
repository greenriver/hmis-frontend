import LockIcon from '@mui/icons-material/Lock';
import { Chip } from '@mui/material';

interface Props {
  'data-testid'?: string;
}

const RestrictedRecordBadge: React.FC<Props> = ({
  'data-testid': testId = 'restrictedRecordBadge',
}) => (
  <Chip
    icon={<LockIcon />}
    label='Restricted Record'
    color='warning'
    size='small'
    data-testid={testId}
  />
);

export default RestrictedRecordBadge;
