import { Paper } from '@mui/material';
import { useState } from 'react';
import ServiceCategoryTable from './ServiceCategoryTable';
import ServiceTypeTable from './ServiceTypeTable';
import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import PageTitle from '@/components/layout/PageTitle';

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

  return (
    <>
      <PageTitle
        title={viewMode === 'types' ? 'Service Types' : 'Service Categories'}
        actions={
          <CommonToggle
            size='small'
            value={viewMode}
            onChange={setViewMode}
            items={toggleItemDefinitions}
          />
        }
      />
      <Paper>
        {/* TODO add: ability to add new service type */}
        {viewMode === 'types' && <ServiceTypeTable />}
        {/* TODO add: ability to add new service category */}
        {viewMode === 'categories' && <ServiceCategoryTable />}
      </Paper>
    </>
  );
};

export default ConfigureServicesPage;
