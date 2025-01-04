import { styled } from '@mui/material/styles';

export const CommonUnorderedList = styled('ul')(() => ({
  paddingLeft: '1.2rem',
  margin: '0',
  '> li': {
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
  },
}));
