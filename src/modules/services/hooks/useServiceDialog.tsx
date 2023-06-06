import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import { find } from 'lodash-es';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormSelect from '@/modules/form/components/FormSelect';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { usePickList } from '@/modules/form/hooks/usePickList';
import useServiceFormDefinition from '@/modules/form/hooks/useServiceFormDefinition';
import { isPickListOption } from '@/modules/form/types';
import {
  createHudValuesForSubmit,
  createValuesForSubmit,
} from '@/modules/form/util/formUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteServiceDocument,
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  ItemType,
  PickListOption,
  PickListType,
  ServiceFieldsFragment,
  useGetServiceTypeQuery,
  useSubmitFormMutation,
} from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderServiceDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  dialogContent?: ReactNode;
};

export function useServiceDialog({
  projectId,
  enrollmentId,
  service,
}: {
  projectId: string;
  enrollmentId: string;
  service?: ServiceFieldsFragment;
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<PickListOption | null>(
    null
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const { data: { serviceType } = {}, loading: serviceTypeLoading } =
    useGetServiceTypeQuery({
      variables: { id: selectedService?.code || '' },
      skip: !selectedService,
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });

  const {
    formDefinition,
    itemMap,
    loading: definitionLoading,
  } = useServiceFormDefinition({
    projectId,
    serviceTypeId: selectedService?.code,
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedService(null);
    setErrors(emptyErrorState);
    setSubmitLoading(false);
  }, []);

  const [submitForm, { loading: saveLoading }] = useSubmitFormMutation({
    onCompleted: (data) => {
      const errors = data.submitForm?.errors || [];
      setSubmitLoading(false);
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'services',
        });
        closeDialog();
      }
    },
    // loading should stop here too
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const openServiceDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

  const [serviceList, serviceListLoading] = usePickList(
    {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.AvailableServiceTypes,
    },
    projectId,
    { fetchPolicy: 'network-only' }
  );
  useEffect(() => {
    if (!service) return;
    if (!serviceList) return;

    const serviceTypeOption = find(serviceList, {
      code: service.serviceType.id,
    });
    if (serviceTypeOption) setSelectedService(serviceTypeOption);
  }, [serviceList, service]);

  // const displayCategory = useMemo(() => {
  //   if (!selectedService) return null;
  //   if (!selectedService.groupLabel) return null;
  //   if (selectedService.groupLabel == selectedService.groupCode) return null;

  //   return selectedService.groupLabel;
  // }, [selectedService]);

  const localConstants = useMemo(
    () => ({
      hudRecordType: serviceType?.hudRecordType,
      hudTypeProvided: serviceType?.hudTypeProvided,
      serviceTypeId: selectedService?.code,
    }),
    [serviceType, selectedService]
  );
  const initialValues = useInitialFormValues({
    itemMap,
    formDefinition: formDefinition || undefined,
    localConstants,
    record: service,
  });

  const submitHandler: DynamicFormOnSubmit = useCallback(
    ({ values, confirmed = false }) => {
      if (!formDefinition) return;
      const input = {
        formDefinitionId: formDefinition.id,
        values: createValuesForSubmit(values, formDefinition.definition),
        hudValues: createHudValuesForSubmit(values, formDefinition.definition),
        confirmed,
        enrollmentId,
        serviceTypeId: selectedService?.code,
        recordId: service?.id,
      };
      setErrors(emptyErrorState);
      void submitForm({ variables: { input: { input } } });
    },
    [formDefinition, submitForm, enrollmentId, selectedService, service]
  );

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({ id: `Enrollment:${enrollmentId}`, fieldName: 'services' });
    closeDialog();
  }, [enrollmentId, closeDialog]);

  const serviceTypeInfoLoading =
    selectedService &&
    ((!formDefinition && definitionLoading) ||
      (!serviceType && serviceTypeLoading));

  const renderServiceDialog = (args?: RenderServiceDialogProps) => {
    const { dialogContent, ...props } = args || {};
    return (
      <Dialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle
          typography='h5'
          sx={{
            textTransform: 'none',
            pb: 2,
            mb: 2,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: 'borders.light',
          }}
          color='text.primary'
        >
          {service ? 'Update Service' : 'Add Service'}
        </DialogTitle>
        <DialogContent>
          {dialogContent}
          <Box sx={{ mb: 2 }}>
            {!service && (
              <FormSelect
                options={serviceList || []}
                value={selectedService}
                onChange={(e, val) =>
                  setSelectedService(isPickListOption(val) ? val : null)
                }
                loading={serviceListLoading}
                label={getRequiredLabel('Service Type', true)}
                placeholder='Select a service..'
              />
            )}
          </Box>
          {serviceTypeInfoLoading && (
            <Skeleton variant='rectangular' sx={{ height: 60 }} />
          )}
          {selectedService && formDefinition && serviceType && (
            <DynamicForm
              key={selectedService.code}
              definition={formDefinition.definition}
              onSubmit={submitHandler}
              initialValues={initialValues}
              loading={saveLoading}
              errors={errors}
              ref={formRef}
              {...props}
              hideSubmit
              loadingElement={
                <Skeleton variant='rectangular' sx={{ height: 60, pt: 2 }} />
              }
              picklistQueryOptions={{ fetchPolicy: 'cache-first' }}
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            py: 2,
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'borders.light',
          }}
        >
          <Stack
            direction='row'
            justifyContent={'space-between'}
            sx={{ width: '100%' }}
          >
            {service && (
              <DeleteMutationButton<
                DeleteServiceMutation,
                DeleteServiceMutationVariables
              >
                queryDocument={DeleteServiceDocument}
                variables={{ input: { id: service.id } }}
                idPath={'deleteService.service.id'}
                recordName='Service'
                onSuccess={onSuccessfulDelete}
              >
                Delete
              </DeleteMutationButton>
            )}
            <Stack gap={3} direction='row'>
              <Button
                onClick={closeDialog}
                variant='gray'
                data-testid='cancelDialogAction'
              >
                Cancel
              </Button>
              <LoadingButton
                disabled={!selectedService}
                onClick={() => {
                  if (!formRef.current) return;
                  setSubmitLoading(true);
                  const values = formRef.current.GetValuesForSubmit();
                  submitHandler({ values, confirmed: false });
                }}
                type='submit'
                loading={submitLoading}
                data-testid='confirmDialogAction'
                sx={{ minWidth: '120px' }}
              >
                {service ? 'Save Changes' : 'Add Service'}
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
        <IconButton
          aria-label='close'
          onClick={closeDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Dialog>
    );
  };

  return {
    openServiceDialog,
    renderServiceDialog,
    serviceDialogOpen: dialogOpen,
  };
}
