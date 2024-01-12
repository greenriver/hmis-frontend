import { Grid } from '@mui/material';
import React, { RefObject } from 'react';

import RefactorFormContainer from './RefactorFormContainer';
import RefactorFormErrors, {
  RefactorFormErrorsProps,
} from './RefactorFormErrors';
import RefactorFormFields, {
  Props as RefactorFormFieldProps,
} from './RefactorFormFields';
import RefactorFormLayout from './RefactorFormLayout';
import DynamicFormSaveButtons, {
  DynamicFormSaveButtonsProps,
} from './RefactorFormSaveButtons';
import { hasErrors } from '@/modules/errors/util';

export interface RefactorFormBaseProps
  extends DynamicFormSaveButtonsProps,
    RefactorFormErrorsProps,
    RefactorFormFieldProps {
  errorRef?: RefObject<HTMLDivElement>;
}

const RefactorFormBase = ({ errorRef, ...props }: RefactorFormBaseProps) => {
  return (
    <RefactorFormContainer>
      <RefactorFormLayout
        errors={
          <>
            {hasErrors(props.errors) && (
              <Grid item>
                <RefactorFormErrors {...props} ref={errorRef} />
              </Grid>
            )}
          </>
        }
        saveButtons={<DynamicFormSaveButtons {...props} />}
      >
        <RefactorFormFields {...props} />
      </RefactorFormLayout>
    </RefactorFormContainer>
  );
};

export default RefactorFormBase;
