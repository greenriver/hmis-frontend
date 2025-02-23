import { RefObject } from 'react';

import DynamicFormContainer from './DynamicFormContainer';
import DynamicFormErrors, { DynamicFormErrorsProps } from './DynamicFormErrors';
import DynamicFormFields, {
  Props as DynamicFormFieldsProps,
} from './DynamicFormFields';
import DynamicFormLayout, { DynamicFormLayoutProps } from './DynamicFormLayout';
import DynamicFormSaveButtons, {
  DynamicFormSaveButtonsProps,
} from './DynamicFormSaveButtons';

export interface DynamicFormBaseProps
  extends DynamicFormSaveButtonsProps,
    DynamicFormErrorsProps,
    DynamicFormFieldsProps,
    Pick<DynamicFormLayoutProps, 'variant'> {
  errorRef?: RefObject<HTMLDivElement>;
}

const DynamicFormBase = ({
  errorRef,
  variant,
  ...props
}: DynamicFormBaseProps) => {
  return (
    <DynamicFormContainer>
      <DynamicFormLayout
        errors={<DynamicFormErrors {...props} ref={errorRef} />}
        saveButtons={<DynamicFormSaveButtons {...props} />}
        variant={variant}
      >
        <DynamicFormFields {...props} />
      </DynamicFormLayout>
    </DynamicFormContainer>
  );
};

export default DynamicFormBase;
