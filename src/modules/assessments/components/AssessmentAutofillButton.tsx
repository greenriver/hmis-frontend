import { Button } from '@mui/material';
import { SxProps } from '@mui/system';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

export default function AssessmentAutofillButton(props: {
  onClick: VoidFunction;
  sx?: SxProps;
}) {
  return (
    <ButtonTooltipContainer title='Choose a previous assessment to copy into this assessment'>
      <Button
        variant='outlined'
        onClick={props.onClick}
        sx={{ height: 'fit-content', ...props.sx }}
        fullWidth
      >
        Autofill Assessment
      </Button>
    </ButtonTooltipContainer>
  );
}
