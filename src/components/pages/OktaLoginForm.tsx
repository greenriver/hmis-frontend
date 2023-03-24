import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

import { getCsrfToken } from '@/utils/csrf';

interface Props {
  path: string;
}
const OktaLoginForm: React.FC<Props> = ({ path }) => {
  // fixme - csrf should probably be in a context or other shared state
  const [csrf, setCsrf] = useState<string>();
  useEffect(() => {
    const token = getCsrfToken();
    if (token) {
      setCsrf(token);
    }
  }, []);
  if (!csrf) {
    // FIXME- if no crsrf yet, maybe reloading the window
    return (
      <Button onClick={() => window.location.reload()}>
        Sign In with Okta
      </Button>
    );
  }
  return (
    <form method='post' action={path}>
      <input
        type='hidden'
        name='authenticity_token'
        value={csrf}
        autoComplete='off'
      />
      <input
        type='hidden'
        name='user_type'
        value='hmis_user'
        autoComplete='off'
      />
      <Button type='submit'>Sign In with Okta</Button>
    </form>
  );
};

export default OktaLoginForm;
