import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import { CopyIcon } from '@/components/elements/SemanticIcons';
import { PickListOption } from '@/types/gqlTypes';

interface Props {
  jsonString: string;
}

type CopyMode = 'with_custom_field_keys' | 'without_custom_field_keys';

const COPY_OPTIONS: PickListOption[] = [
  {
    code: 'with_custom_field_keys',
    label: 'Copy with field mappings (default)',
  },
  {
    code: 'without_custom_field_keys',
    label: 'Copy without field mappings',
  },
];

const COPY_HELPER_TEXT: Record<CopyMode, React.ReactNode> = {
  with_custom_field_keys: (
    <>
      Copies the form JSON in its entirety, including{' '}
      <code>custom_field_key</code> mappings. <br />
      Publishing in another environment will try to find or create custom data
      elements with the same keys.
    </>
  ),

  without_custom_field_keys: (
    <>
      Strips custom field mappings before copying. <br />
      Publishing in another environment will generate <strong>
        new keys
      </strong>{' '}
      for those questions. Avoid this if copying to an environment where the
      form already exists (and has been published).
    </>
  ),
};

const isMappingWithCustomFieldKey = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const mapping = value as Record<string, unknown>;
  return 'custom_field_key' in mapping || 'customFieldKey' in mapping;
};

const stripCustomFieldKeyMappings = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripCustomFieldKeyMappings);
  }
  if (!value || typeof value !== 'object') return value;

  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'mapping' && isMappingWithCustomFieldKey(child)) continue;
    next[key] = stripCustomFieldKeyMappings(child);
  }
  return next;
};

const hasEditorUserIds = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(hasEditorUserIds);
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  const ids = obj.editor_user_ids ?? obj.editorUserIds;
  if (Array.isArray(ids) && ids.length > 0) return true;

  return Object.values(obj).some(hasEditorUserIds);
};

const jsonForCopy = (source: string, mode: CopyMode): string => {
  if (mode === 'with_custom_field_keys') return source;

  const parsed = JSON.parse(source);
  return JSON.stringify(stripCustomFieldKeyMappings(parsed), null, 2);
};

const FormJsonCopyButton: React.FC<Props> = ({ jsonString }) => {
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyMode, setCopyMode] = useState<CopyMode>('with_custom_field_keys');
  const [editorUserIdsWarning, setEditorUserIdsWarning] = useState(false);

  const closeCopyDialog = useCallback(() => {
    setCopyDialogOpen(false);
    setCopyMode('with_custom_field_keys');
    setEditorUserIdsWarning(false);
  }, []);

  const openCopyDialog = useCallback(() => {
    try {
      setEditorUserIdsWarning(hasEditorUserIds(JSON.parse(jsonString)));
    } catch {
      setEditorUserIdsWarning(false);
    }
    setCopyDialogOpen(true);
  }, [jsonString]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonForCopy(jsonString, copyMode));
    } catch (error) {
      console.error('Failed to copy form JSON', error);
    }
  }, [copyMode, jsonString]);

  return (
    <>
      <Button
        variant='outlined'
        onClick={openCopyDialog}
        startIcon={<CopyIcon />}
      >
        Copy to Clipboard
      </Button>
      <CommonDialog
        open={copyDialogOpen}
        onClose={closeCopyDialog}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle>Copy Form JSON</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editorUserIdsWarning && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              This form limits some questions to specific users (
              <code>editor_user_ids</code>). User IDs are not the same across
              environments, so those restrictions will not apply to the intended
              people if you paste this elsewhere. Update them after publishing.
            </Alert>
          )}
          <RadioGroupInput
            label='Copy Options'
            ariaLabel='Copy options'
            options={COPY_OPTIONS}
            value={COPY_OPTIONS.find((option) => option.code === copyMode)}
            onChange={(option) =>
              setCopyMode(
                (option?.code as CopyMode) || 'with_custom_field_keys'
              )
            }
          />
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            {COPY_HELPER_TEXT[copyMode]}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Stack gap={3} direction='row'>
            <Button onClick={closeCopyDialog} color='grayscale'>
              Close
            </Button>
            <Button startIcon={<CopyIcon />} onClick={handleCopy}>
              Copy to Clipboard
            </Button>
          </Stack>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default FormJsonCopyButton;
