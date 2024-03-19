import { Paper } from '@mui/material';
import { useState } from 'react';
import ServiceCategoryTable from './ServiceCategoryTable';
import ServiceTypeTable from './ServiceTypeTable';
import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import PageTitle from '@/components/layout/PageTitle';
import { useIsMobile } from '@/hooks/useIsMobile';
import NewServiceTypeButton from '@/modules/admin/components/services/NewServiceTypeButton';

type ViewMode = 'types' | 'categories';

const toggleItemDefinitions: ToggleItem<ViewMode>[] = [
  {
    value: 'types',
    label: 'Types',
  },
  {
    value: 'categories',
    label: 'Categories',
  },
];

const ConfigureServicesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('types');
  const isTiny = useIsMobile('sm');

  return (
    <>
      <PageTitle
        title={viewMode === 'types' ? 'Service Types' : 'Service Categories'}
        actions={
          <Stack direction={isTiny ? 'column' : 'row'} gap={1}>
            {viewMode === 'types' && <NewServiceTypeButton />}
            <CommonToggle
              size='small'
              value={viewMode}
              onChange={setViewMode}
              items={toggleItemDefinitions}
            />
          </Stack>
        }
      />
      <Paper>
        {viewMode === 'types' && <ServiceTypeTable />}
        {/* TODO add: ability to add new service category */}
        {viewMode === 'categories' && <ServiceCategoryTable />}
      </Paper>
    </>
  );
};

export default ConfigureServicesPage;
