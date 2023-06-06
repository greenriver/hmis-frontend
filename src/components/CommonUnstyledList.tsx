import { styled } from '@mui/material/styles';

export const CommonUntyledList = styled('ul')(() => ({
  listStyleType: 'none',
  paddingLeft: 0,
  margin: 0,
  '> li': {
    paddingLeft: 0,
    marginBottom: 0,
  },
}));
