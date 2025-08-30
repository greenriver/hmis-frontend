import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useState } from 'react';
import NumberInput from '@/components/elements/input/NumberInput';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import { isPickListOption } from '@/modules/form/types';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  UnitGroupCapacityFieldsFragment,
  useCreateUnitsMutation,
} from '@/types/gqlTypes';

interface CreateUnitsDialogProps {
  projectId: string;
  allowSelectUnitGroup: boolean; // Whether to include Unit Group selector on form. If true, must pass `unitGroups`
  unitGroupId?: string; // If provided, units will be created in this group
  unitGroups?: UnitGroupCapacityFieldsFragment[];
  open: boolean;
  onClose: () => void;
  includeCeFields?: boolean;
}

const CreateUnitsDialog: React.FC<CreateUnitsDialogProps> = ({
  projectId,
  unitGroupId,
  open,
  onClose,
  allowSelectUnitGroup,
  unitGroups = [],
  includeCeFields = false,
}) => {
  const [unitType, setUnitType] = useState<string | null>(null);
  const [unitGroupIdState, setUnitGroupIdState] = useState<string | null>(null);
  const [numberOfUnits, setNumberOfUnits] = useState<number | null>(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

  const handleClose = useCallback(() => {
    setUnitType(null);
    setNumberOfUnits(null);
    setUnitGroupIdState(null);
    setErrors(emptyErrorState);
    onClose();
  }, [onClose]);

  const [createUnits, { loading }] = useCreateUnitsMutation({
    onCompleted: (data) => {
      if (data.createUnits?.errors?.length) {
        setErrors(partitionValidations(data.createUnits.errors));
      } else {
        evictUnitsQuery(projectId, unitGroupId);
        handleClose();
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const handleSubmit = useCallback(() => {
    createUnits({
      variables: {
        input: {
          input: {
            unitGroupId: unitGroupId || unitGroupIdState || '',
            count: numberOfUnits,
          },
        },
        includeCeFields,
      },
    });
  }, [
    numberOfUnits,
    createUnits,
    unitGroupId,
    unitGroupIdState,
    includeCeFields,
  ]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Add Units</DialogTitle>
      <DialogContent sx={{ my: 2 }}>
        {errorState.errors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <ErrorAlert key='errors' errors={errorState.errors} fixable />
          </Box>
        )}
        <ApolloErrorAlert error={errorState.apolloError} />
        <Grid container spacing={2}>
          {allowSelectUnitGroup && unitGroups.length > 0 && (
            <Grid item xs={12}>
              <FormSelect
                value={unitGroupIdState ? { code: unitGroupIdState } : null}
                label={getRequiredLabel('Unit Group', true)}
                placeholder='Select Unit Group'
                options={unitGroups.map((group) => ({
                  label: group.name,
                  code: group.id,
                }))}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setUnitGroupIdState(option.code);
                  } else if (!option) {
                    setUnitGroupIdState(null);
                  }
                }}
                maxWidth={400}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <NumberInput
              label={getRequiredLabel(
                `Number of Units to Add ${unitGroups.length > 0 ? 'to Group' : ''}`,
                true
              )}
              value={numberOfUnits ?? ''}
              onChange={(e) => setNumberOfUnits(Number(e.target.value))}
              max={200}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Stack gap={3} direction='row'>
          <Button onClick={handleClose} disabled={loading} color='grayscale'>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            disabled={
              (!unitType && !unitGroupIdState && !unitGroupId) ||
              !numberOfUnits ||
              numberOfUnits <= 0
            }
          >
            Add Units
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUnitsDialog;
