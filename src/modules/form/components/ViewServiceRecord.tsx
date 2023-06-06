import { useMemo } from 'react';

import useServiceFormDefinition from '../hooks/useServiceFormDefinition';
import { createInitialValuesFromRecord } from '../util/formUtil';

import DynamicView from './viewable/DynamicView';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import { ServiceFieldsFragment } from '@/types/gqlTypes';

export interface ViewServiceRecordProps {
  service: ServiceFieldsFragment;
  projectId: string;
}

const ViewServiceRecord = ({
  service,
  projectId,
}: ViewServiceRecordProps): JSX.Element => {
  const { formDefinition, itemMap, loading } = useServiceFormDefinition({
    projectId,
    serviceTypeId: service.serviceType.id,
  });

  // Transform record into "form state" for DynamicView
  const values = useMemo(() => {
    if (!itemMap) return {};
    const formValues = createInitialValuesFromRecord(itemMap, service);
    console.debug('Display values:', formValues, 'from', service);
    return formValues;
  }, [itemMap, service]);

  if (loading) return <Loading />;
  if (!formDefinition || !itemMap) return <NotFound />;

  return (
    <DynamicView
      values={values}
      definition={formDefinition.definition}
      pickListRelationId={projectId}
      picklistQueryOptions={{ fetchPolicy: 'cache-first' }}
    />
  );
};

export default ViewServiceRecord;
