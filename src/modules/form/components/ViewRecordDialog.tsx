import {
  Box,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

import { PickListArgs, SubmitFormAllowedTypes } from '../types';

import ViewRecord from './ViewRecord';

import CommonDialog from '@/components/elements/CommonDialog';
import HudRecordMetadata from '@/modules/hmis/components/HudRecordMetadata';
import { FormRole } from '@/types/gqlTypes';

interface RecordDialogProps<RecordType> extends DialogProps {
  record: RecordType;
  formRole: FormRole;
  pickListArgs?: PickListArgs;
  actions?: ReactNode;
  children?: ReactNode;
}

const ViewRecordDialog = <RecordType extends SubmitFormAllowedTypes>({
  record,
  actions,
  formRole,
  onClose,
  title,
  children,
  pickListArgs,
  ...props
}: RecordDialogProps<RecordType>) => {
  return (
    <CommonDialog
      maxWidth='md'
      scroll='paper'
      fullWidth
      onClose={onClose}
      {...props}
    >
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          gap={2}
          alignItems='center'
        >
          <Typography variant='inherit'>
            {title ? title : 'Record Details'}
          </Typography>
        </Stack>
      </DialogTitle>
      <Stack
        justifyContent={'space-between'}
        direction='row'
        alignItems={'center'}
        sx={{ px: 4, py: 1.5 }}
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
          <ViewRecord
            record={record}
            formRole={formRole}
            pickListArgs={pickListArgs}
          />
          {children}
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default ViewRecordDialog;
