import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

import ViewRecord from './ViewRecord';

import HudRecordMetadata from '@/modules/hmis/components/HudRecordMetadata';
import { FormRole, SubmitFormMutation } from '@/types/gqlTypes';

interface RecordDialogProps<RecordType> extends DialogProps {
  record: RecordType;
  formRole: FormRole;
  actions?: ReactNode;
  children?: ReactNode;
}

type AllowedTypes = NonNullable<
  NonNullable<SubmitFormMutation['submitForm']>['record']
>;

const ViewRecordDialog = <RecordType extends AllowedTypes>({
  record,
  actions,
  formRole,
  onClose,
  title,
  children,
  ...props
}: RecordDialogProps<RecordType>) => {
  return (
    <Dialog maxWidth='md' scroll='paper' fullWidth onClose={onClose} {...props}>
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          gap={2}
          alignItems='center'
        >
          <Typography
            sx={{
              fontSize: '1.5rem',
              color: (theme) => theme.palette.text.primary,
              textTransform: 'none',
            }}
          >
            {title ? title : 'Record Details'}
          </Typography>
          {onClose && (
            <IconButton onClick={(evt) => onClose(evt, 'escapeKeyDown')}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      <Stack
        justifyContent={'space-between'}
        direction='row'
        alignItems={'center'}
        sx={{ px: 2, py: 1.5 }}
      >
        <Stack gap={0.5}>
          <HudRecordMetadata
            record={record}
            RelativeDateDisplayProps={{
              TooltipProps: { placement: 'right' },
              TypographyProps: { variant: 'body2' },
            }}
          />
        </Stack>
        {actions && (
          <Box>
            <Stack direction='row' gap={2} justifyContent='center' flexGrow={1}>
              {actions}
            </Stack>
          </Box>
        )}
      </Stack>
      <Divider />
      <DialogContent>
        <Box
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[300],
            boxShadow: `${theme.shadows[1]} inset`,
            padding: 2,
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexDirection: 'column',
            gap: 2,
          })}
        >
          <ViewRecord record={record} formRole={formRole} />
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRecordDialog;
