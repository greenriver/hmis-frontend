import React, { useState } from 'react';

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
    setFilters(values);
  };

  return (
    <>
      <SearchForm definition={searchFormDefinition} onSubmit={submitHandler} />
      {filters && <SearchResults filters={filters} />}
    </>
  );
};

export default Dashboard;
