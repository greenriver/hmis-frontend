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
  if (error) throw error;
  if (loading) return <Loading />;
  return (
    <>
      <PageTitle title={data?.serviceCategory?.name} />
      <Stack spacing={4}>
        <TitleCard title='Applicability Rules' headerVariant='border'>
          <ServiceCategoryRuleTable serviceCategoryId={serviceCategoryId} />
        </TitleCard>
        <TitleCard title='Service Types' headerVariant='border'>
          <ServiceTypeTable serviceCategoryId={serviceCategoryId} />
        </TitleCard>
      </Stack>
    </>
  );
};
export default ServiceCategoryDetail;
