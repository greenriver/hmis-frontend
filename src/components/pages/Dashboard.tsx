import { Typography } from '@mui/material';
import React, { useState } from 'react';

import clientSearchConfig, { transformValues } from '@/api/clientSearchConfig';
import SearchForm from '@/modules/search/components/SearchForm';
import SearchResults from '@/modules/search/components/SearchResults';

const Dashboard: React.FC = () => {
  const [variables, setVariables] = useState<Record<string, any>>();

  const submitHandler = (values: Record<string, any>) => {
    const variables = transformValues(values);
    console.log(JSON.stringify(variables, null, 2));

    setVariables({ input: variables, limit: 10, offset: 0 });
  };

  return (
    <>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Clients
      </Typography>
      <SearchForm config={clientSearchConfig} onSubmit={submitHandler} />
      {variables && <SearchResults variables={variables} />}
    </>
  );
};

export default Dashboard;
