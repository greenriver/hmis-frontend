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
import { cache } from '@/providers/apolloClient';
import {
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
    data: { pickList: typePickList } = {},
    loading: typePickListLoading,
    error: typePickListError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.StaffAssignmentTypes,
      projectId: projectId,
    },
  });

  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [assignmentTypeId, setAssignmentTypeId] = useState<string | null>(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

  const [assignStaff, { error: assignmentError, loading: assignmentLoading }] =
    useAssignStaffMutation({
      variables: {
        householdId: householdId,
        assignmentTypeId: assignmentTypeId || '',
        userId: assigneeId || '',
      },
      onCompleted: (data) => {
        if (data.assignStaff?.errors?.length) {
          setErrors(partitionValidations(data.assignStaff.errors));
        } else if (data.assignStaff?.staffAssignment) {
          setErrors(emptyErrorState);
          setAssigneeId(null);
          setAssignmentTypeId(null);

          // cache.evict is simpler than cache.modify, but causes is a visual delay
          // cache.evict({ id: `Household:${householdId}`, fieldName: 'staffAssignments' });
          cache.modify({
            id: `Household:${householdId}`,
            fields: {
              staffAssignments(existingStaffAssignments, { storeFieldName }) {
                // storeFieldName contains the arguments passed to the query
                if (!storeFieldName.includes('{"isCurrentlyAssigned":false}')) {
                  return {
                    ...existingStaffAssignments,
                    nodesCount: existingStaffAssignments.nodesCount + 1,
                    nodes: [
                      {
                        __ref: `StaffAssignment:${data.assignStaff?.staffAssignment?.id}`,
                      },
                      ...existingStaffAssignments.nodes,
                    ],
                  };
                } else {
                  return existingStaffAssignments;
                }
              },
            },
          });
        }
      },
    });

  const handleSubmit = useCallback(() => {
    if (assigneeId && assignmentTypeId) {
      assignStaff();
    }
  }, [assignStaff, assigneeId, assignmentTypeId]);

  const isTiny = useIsMobile('sm');

  if (staffPickListError) throw staffPickListError;
  if (typePickListError) throw typePickListError;
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
                value={assignmentTypeId ? { code: assignmentTypeId } : null}
                placeholder={'Select Role'}
                label='Role'
                loading={typePickListLoading}
                options={typePickList || []}
                onChange={(_event, option) => {
                  if (isPickListOption(option)) {
                    setAssignmentTypeId(option.code);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <LoadingButton
                loading={assignmentLoading}
                type='submit'
                disabled={!assignmentTypeId || !assigneeId}
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
