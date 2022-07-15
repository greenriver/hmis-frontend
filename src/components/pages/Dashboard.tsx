import { Typography } from '@mui/material';
import React, { useState } from 'react';

import clientSearchConfig, { transformValues } from '@/api/clientSearchConfig';
import SearchForm from '@/modules/search/components/SearchForm';
import SearchResults from '@/modules/search/components/SearchResults';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>();

  const submitHandler = (values: Record<string, any>) => {
    const variables = transformValues(values);
    console.log(JSON.stringify(variables, null, 2));
    setFilters(variables);
  };

  return (
    <>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Clients
      </Typography>
      <SearchForm config={clientSearchConfig} onSubmit={submitHandler} />
      {filters && <SearchResults filters={filters} />}
    </>
  );
};

export default Dashboard;
