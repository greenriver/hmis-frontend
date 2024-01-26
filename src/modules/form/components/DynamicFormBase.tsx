import { Grid } from '@mui/material';
import { RefObject } from 'react';

import DynamicFormContainer from './DynamicFormContainer';
import DynamicFormErrors, { DynamicFormErrorsProps } from './DynamicFormErrors';
import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from './DynamicFormFields';
import DynamicFormLayout from './DynamicFormLayout';
import DynamicFormSaveButtons, {
  DynamicFormSaveButtonsProps,
} from './DynamicFormSaveButtons';
import { hasErrors } from '@/modules/errors/util';

export interface DynamicFormBaseProps
  extends DynamicFormSaveButtonsProps,
    DynamicFormErrorsProps,
    DynamicFormFieldsProps {
  errorRef?: RefObject<HTMLDivElement>;
}

const DynamicFormBase = ({ errorRef, ...props }: DynamicFormBaseProps) => {
  return (
    <DynamicFormContainer>
      <DynamicFormLayout
        errors={
          <>
            {hasErrors(props.errors) && (
              <Grid item>
                <DynamicFormErrors {...props} ref={errorRef} />
              </Grid>
            )}
          </>
        }
        saveButtons={<DynamicFormSaveButtons {...props} />}
      >
        <DynamicFormFields {...props} />
      </DynamicFormLayout>
    </DynamicFormContainer>
  );
};

export default DynamicFormBase;
