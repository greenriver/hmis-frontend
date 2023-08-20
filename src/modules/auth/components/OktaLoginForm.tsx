import { Alert, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getCsrfToken } from '@/utils/csrf';
import { reloadWindow } from '@/utils/location';

const MESSAGES: Record<string, string> = {
  // causes:
  // * a CSRF cookie issue
  // * user hasn't been granted access to the HMIS "Chicklet"
  generic: `There was an error signing in to your account. Please contact your administrator for assistance if this problem persists.`,
  inactive: `You can't sign in because your account has not been activated yet. Please contact your administrator for assistance.`,
};
const ErrorMessage: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Alert severity='error' sx={{ mb: 1 }}>
      <Typography>{MESSAGES[id] || MESSAGES.generic}</Typography>
    </Alert>
  );
};

interface Props {
  path: string;
}
const OktaLoginForm: React.FC<Props> = ({ path }) => {
  const [params, setParams] = useSearchParams();
  const [messageId] = useState(params.get('authError'));
  useEffect(() => {
    // clear params after page render
    if (messageId) setParams({});
  }, [setParams, messageId]);

  const csrf = getCsrfToken();
  if (!csrf) {
    // FIXME- if no crsrf yet, maybe reloading the window
    return <Button onClick={reloadWindow}>Sign In with Okta</Button>;
  }

  return (
    <form method='post' action={path}>
      {messageId && <ErrorMessage id={messageId} />}
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
      <Button type='submit' fullWidth>
        Sign In with Okta
      </Button>
    </form>
  );
};

export default OktaLoginForm;
