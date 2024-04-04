import { Button } from '@mui/material';
import { SxProps } from '@mui/system';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

export interface Props {
  onClick: VoidFunction;
  sx?: SxProps;
}

const AssessmentAutofillButton: React.FC<Props> = (props) => {
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
};

export default AssessmentAutofillButton;
