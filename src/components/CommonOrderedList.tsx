import { styled } from '@mui/material/styles';

export const CommonOrderedList = styled('ol')(() => ({
  paddingLeft: '1.2rem',
  margin: '0',
  marginBottom: '1rem',
  '> li': {
    paddingLeft: 0,
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
  },
}));
