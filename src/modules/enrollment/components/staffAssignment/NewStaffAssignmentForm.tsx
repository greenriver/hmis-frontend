import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, AlertTitle, Card, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import ValidationErrorList from '@/modules/errors/components/ValidationErrorList';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import FormSelect from '@/modules/form/components/FormSelect';
import { isPickListOption } from '@/modules/form/types';
import {
  GetHouseholdStaffAssignmentsDocument,
  PickListType,
  useAssignStaffMutation,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface NewStaffAssignmentFormProps {
  householdId: string;
  projectId: string;
}

const NewStaffAssignmentForm: React.FC<NewStaffAssignmentFormProps> = ({
  householdId,
  projectId,
}) => {
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

  const {
    data: { pickList: staffPickList } = {},
    loading: staffPickListLoading,
    error: staffPickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.EligibleStaffAssignmentUsers,
      projectId: projectId,
    },
  });

  const {
    data: { pickList: relationshipPickList } = {},
    loading: relationshipPickListLoading,
    error: relationshipPickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.StaffAssignmentRelationships,
      projectId: projectId,
    },
    onCompleted: (data) => {
      if (data.pickList?.length === 1) {
        setRelationshipId(data.pickList[0].code);
      }
    },
  });

  const [assignStaff, { error: assignmentError, loading: assignmentLoading }] =
    useAssignStaffMutation({
      variables: {
        input: {
          householdId: householdId,
          assignmentRelationshipId: relationshipId || '',
          userId: assigneeId || '',
        },
      },
      refetchQueries: [GetHouseholdStaffAssignmentsDocument],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        if (data.assignStaff?.errors?.length) {
          setErrors(partitionValidations(data.assignStaff.errors));
        } else if (data.assignStaff?.staffAssignment) {
          setErrors(emptyErrorState);
          setAssigneeId(null);
          if (relationshipPickList.length > 1) setRelationshipId(null);
        }
      },
    });

  const handleSubmit = useCallback(() => {
    if (assigneeId && relationshipId) {
      assignStaff();
    }
  }, [assignStaff, assigneeId, relationshipId]);

  const isTiny = useIsMobile('sm');

  if (staffPickListError) throw staffPickListError;
  if (relationshipPickListError) throw relationshipPickListError;
  if (assignmentError) throw assignmentError;

  return (
    <Card sx={{ backgroundColor: theme.palette.background.default, p: 2 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <legend style={{ padding: 0 }}>
                <Typography variant='body1' component='h3'>
                  Assign Staff
                </Typography>
              </legend>
            </Grid>
            {errorState.errors.length > 0 && (
              <Grid item xs={12}>
                <Alert severity='error'>
                  <AlertTitle>Unable to assign</AlertTitle>
                  <ValidationErrorList errors={errorState.errors} />
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={5}>
              <FormSelect
                value={assigneeId ? { code: assigneeId } : null}
                placeholder={'Select Staff'}
                label='Staff Name'
                loading={staffPickListLoading}
                options={staffPickList || []}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setAssigneeId(option.code);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <FormSelect
                value={relationshipId ? { code: relationshipId } : null}
                placeholder={'Select Role'}
                label='Role'
                loading={relationshipPickListLoading}
                options={relationshipPickList || []}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setRelationshipId(option.code);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <LoadingButton
                loading={assignmentLoading}
                type='submit'
                disabled={!relationshipId || !assigneeId}
                sx={isTiny ? {} : { mt: '26px' }}
              >
                Assign
              </LoadingButton>
            </Grid>
          </Grid>
        </fieldset>
      </form>
    </Card>
  );
};

export default NewStaffAssignmentForm;
