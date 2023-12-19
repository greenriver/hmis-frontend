import { Stack } from '@mui/material';
import ServiceCategoryRuleTable from './ServiceCategoryRuleTable';
import ServiceTypeTable from './ServiceTypeTable';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { useGetServiceCategoryQuery } from '@/types/gqlTypes';

const ServiceCategoryDetail = () => {
  const { serviceCategoryId } = useSafeParams() as {
    serviceCategoryId: string;
  };

  const { data, loading, error } = useGetServiceCategoryQuery({
    variables: { id: serviceCategoryId },
  });

  // Form dialog for adding a new rules
  // FIXME: add back. needs some adjustment to the mutation for specifying service category
  // const { openFormDialog, renderFormDialog } = useStaticFormDialog<
  //   CreateFormRuleMutation,
  //   MutationCreateFormRuleArgs
  // >({
  //   formRole: StaticFormRole.FormRule,
  //   // initialValues: selectedRule,
  //   mutationDocument: CreateFormRuleDocument,
  //   getErrors: (data) => data.createFormRule?.errors || [],
  //   getVariables: (values) => ({
  //     input: { input: values as FormRuleInput, definitionId: '' },
  //   }),
  //   onCompleted: () => evictQuery('formRules'),
  // });

  if (error) throw error;
  if (loading) return <Loading />;
  return (
    <>
      <PageTitle title={data?.serviceCategory?.name} />
      <Stack spacing={4}>
        <TitleCard
          title='Applicability Rules'
          headerVariant='border'
          // actions={
          //   <Button
          //     onClick={() => openFormDialog()}
          //     startIcon={<AddIcon />}
          //     variant='outlined'
          //   >
          //     New Rule
          //   </Button>
          // }
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
        {/* {renderFormDialog({
          title: <span>New Rule for {data?.serviceCategory?.name}</span>,
          DialogProps: { maxWidth: 'sm' },
        })} */}
      </Stack>
    </>
  );
};
export default ServiceCategoryDetail;
