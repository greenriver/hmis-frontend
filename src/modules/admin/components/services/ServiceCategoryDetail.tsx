import AddIcon from '@mui/icons-material/Add';
import { Button, Stack } from '@mui/material';
import ServiceCategoryRuleTable from './ServiceCategoryRuleTable';
import ServiceTypeTable from './ServiceTypeTable';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
  useGetServiceCategoryQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const ServiceCategoryDetail = () => {
  const { serviceCategoryId } = useSafeParams() as {
    serviceCategoryId: string;
  };

  const { data, loading, error } = useGetServiceCategoryQuery({
    variables: { id: serviceCategoryId },
  });

  // Form dialog for adding a new rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    CreateFormRuleMutation,
    MutationCreateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    // initialValues: selectedRule,
    mutationDocument: CreateFormRuleDocument,
    getErrors: (data) => data.createFormRule?.errors || [],
    getVariables: (values) => ({
      // FIXME: need to select definition on form, and, specify service category
      input: { input: values as FormRuleInput, definitionId: '' },
    }),
    onCompleted: () => evictQuery('formRules'),
  });

  if (error) throw error;
  if (loading) return <Loading />;
  return (
    <>
      <PageTitle title={data?.serviceCategory?.name} />
      <Stack spacing={4}>
        <TitleCard
          title='Applicability Rules'
          headerVariant='border'
          actions={
            <Button
              onClick={() => openFormDialog()}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              New Rule
            </Button>
          }
        >
          <ServiceCategoryRuleTable serviceCategoryId={serviceCategoryId} />
        </TitleCard>
        <TitleCard
          title='Service Types'
          headerVariant='border'
          // actions={
          //   <ButtonLink to='' Icon={AddIcon}>
          //     New Service Type
          //   </ButtonLink>
          // }
        >
          <ServiceTypeTable serviceCategoryId={serviceCategoryId} />
        </TitleCard>
        {renderFormDialog({
          title: <span>New Rule for {data?.serviceCategory?.name}</span>,
          DialogProps: { maxWidth: 'sm' },
        })}
      </Stack>
    </>
  );
};
export default ServiceCategoryDetail;
