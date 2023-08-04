import { LoadingButton } from '@mui/lab';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import ServiceTypeSelect from '../components/ServiceTypeSelect';

import CommonDialog from '@/components/elements/CommonDialog';
import LabelWithContent from '@/components/elements/LabelWithContent';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { emptyErrorState } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import { useDynamicFormHandlersForRecord } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import useServiceFormDefinition from '@/modules/form/hooks/useServiceFormDefinition';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteServiceDocument,
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  EnrollmentFieldsFragment,
  PickListOption,
  ServiceFieldsFragment,
  useGetServiceTypeQuery,
} from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderServiceDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  dialogContent?: ReactNode;
};

const ServiceCategoryAndType = ({
  service,
}: {
  service: ServiceFieldsFragment;
}) => (
  <>
    {service.serviceType.category !== service.serviceType.name && (
      <LabelWithContent
        label='Service Category'
        LabelProps={{ sx: { fontWeight: 600 } }}
        sx={{ mb: 2 }}
      >
        <Typography variant='body2'>{service.serviceType.category}</Typography>
      </LabelWithContent>
    )}

    <LabelWithContent
      label='Service Type'
      LabelProps={{ sx: { fontWeight: 600 } }}
      sx={{ mb: 2 }}
    >
      <Typography variant='body2'>{service.serviceType.name}</Typography>
    </LabelWithContent>
  </>
);

export function useServiceDialog({
  enrollment,
  service,
  onClose = () => null,
}: {
  enrollment?: EnrollmentFieldsFragment;
  service?: ServiceFieldsFragment;
  onClose?: VoidFunction;
}) {
  const projectId = enrollment?.project?.id || '';
  const enrollmentId = enrollment?.id || '';

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<PickListOption | null>(
    null
  );

  useEffect(() => {
    if (service) setSelectedService({ code: service.serviceType.id });
  }, [service]);

  const { data: { serviceType } = {}, loading: serviceTypeLoading } =
    useGetServiceTypeQuery({
      variables: { id: selectedService?.code || '' },
      skip: !selectedService,
    });

  const { formDefinition, loading: definitionLoading } =
    useServiceFormDefinition({
      projectId,
      serviceTypeId: selectedService?.code || service?.serviceType?.id,
    });

  const hookArgs = useMemo(() => {
    const localConstants = {
      hudRecordType: serviceType?.hudRecordType,
      hudTypeProvided: serviceType?.hudTypeProvided,
      entryDate: enrollment?.entryDate,
      exitDate: enrollment?.exitDate,
      ...AlwaysPresentLocalConstants,
    };
    return {
      formDefinition,
      record: service,
      localConstants,
      inputVariables: { serviceTypeId: selectedService?.code, enrollmentId },
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'services',
        });
        setSelectedService(null);
        setDialogOpen(false);
        onClose();
      },
    };
  }, [
    serviceType,
    selectedService,
    formDefinition,
    service,
    enrollmentId,
    enrollment,
    onClose,
  ]);

  const { initialValues, errors, onSubmit, submitLoading, setErrors } =
    useDynamicFormHandlersForRecord(hookArgs);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedService(null);
    setErrors(emptyErrorState);
    onClose();
  }, [setErrors, onClose]);

  const openServiceDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

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
      <CommonDialog open={!!dialogOpen} fullWidth onClose={closeDialog}>
        <DialogTitle>{service ? 'Update Service' : 'Add Service'}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogContent}
          <Box sx={{ mb: 2 }}>
            {service ? (
              // We have a service, so show read-only category and type
              <ServiceCategoryAndType service={service} />
            ) : (
              // Select service type
              <ServiceTypeSelect
                projectId={projectId}
                value={selectedService}
                onChange={setSelectedService}
              />
            )}
          </Box>
          {serviceTypeInfoLoading && (
            <Skeleton variant='rectangular' sx={{ height: 60 }} />
          )}
          {selectedService && formDefinition && serviceType && (
            <DynamicForm
              key={service?.id || selectedService.code}
              definition={formDefinition.definition}
              onSubmit={onSubmit}
              initialValues={initialValues}
              loading={submitLoading}
              errors={errors}
              ref={formRef}
              {...props}
              localConstants={hookArgs?.localConstants}
              hideSubmit
              loadingElement={
                <Skeleton variant='rectangular' sx={{ height: 60, pt: 2 }} />
              }
              picklistQueryOptions={{ fetchPolicy: 'cache-first' }}
            />
          )}
        </DialogContent>
        <DialogActions>
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
                onClick={() => formRef.current && formRef.current.SubmitForm()}
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
      </CommonDialog>
    );
  };

  return {
    openServiceDialog,
    renderServiceDialog,
    serviceDialogOpen: dialogOpen,
  };
}
