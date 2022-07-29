import { Typography } from '@mui/material';
import { Container } from '@mui/system';
import React, { useState } from 'react';

import PageHeader from '../layout/PageHeader';

import formData from '@/modules/form/data/search.json';
import { FormDefinition } from '@/modules/form/types';
import SearchForm from '@/modules/search/components/SearchForm';
import SearchResults from '@/modules/search/components/SearchResults';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const searchFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>();

  const submitHandler = (values: Record<string, any>) => {
    console.log(JSON.stringify(values, null, 2));
    // TODO re-enable when query is fixed
    // setFilters(values);
    setFilters({});
  };

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Clients</Typography>
      </PageHeader>
      <Container maxWidth='xl' sx={{ pt: 3, pb: 6 }}>
        <SearchForm
          definition={searchFormDefinition}
          onSubmit={submitHandler}
        />
        {filters && <SearchResults filters={filters} />}
      </Container>
    </>
  );
};

export default Dashboard;
