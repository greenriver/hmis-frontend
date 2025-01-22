import { SvgIconComponent } from '@mui/icons-material';
import {
  Button,
  ButtonProps,
  Grid,
  Paper,
  Stack,
  Typography,
  TypographyProps,
} from '@mui/material';
import { isNil, zipObject } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import { useFormContext } from 'react-hook-form';
import {
  AssessmentForPopulation,
  ChangeType,
  GroupItemComponentProps,
} from '../../types';
import {
  getAllChildLinkIds,
  getFieldOnAssessment,
  getPopulatableChildren,
  gqlValueToFormValue,
} from '../../util/formUtil';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import RecordPickerDialog from '@/modules/assessments/components/RecordPickerDialog';
import { useDebugDynamicFormValues } from '@/modules/form/hooks/rhf/useDebugDynamicFormValues';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';

export interface FormCardProps extends GroupItemComponentProps {
  anchor?: string;
  clientId?: string;
  TitleIcon?: SvgIconComponent;
  titleProps?: TypographyProps;
  helperTextProps?: TypographyProps;
}

const FormCard: React.FC<FormCardProps> = ({
  item,
  clientId,
  severalItemsChanged = () => {},
  renderChildItem,
  anchor,
  TitleIcon,
  helperTextProps,
  titleProps,
  viewOnly,
}) => {
  const { getValues } = useFormContext();
  const [fillDialogOpen, setFillDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [sourceRecord, setSourceRecord] = useState<
    AssessmentForPopulation | undefined
  >();

  const childLinkIds = useMemo(() => getAllChildLinkIds(item), [item]);

  // Enable the "Clear Section" button if any child item has a value initially.
  // We don't watch for changes in child values, because it's not worth the re-renders. (top-level groups may be very large)
  const enableClearSectionButton = useMemo(() => {
    const childValues = getValues(childLinkIds);
    return childValues.some((value) => !isNil(value));
  }, [getValues, childLinkIds]);

  const onClear = useCallback(() => {
    const updatedValues = zipObject(
      childLinkIds,
      new Array(childLinkIds.length).fill(null)
    );
    severalItemsChanged({ values: updatedValues, type: ChangeType.User });
    setSourceRecord(undefined);
    setClearDialogOpen(false);
  }, [severalItemsChanged, childLinkIds]);

  const onSelectAutofillRecord = useCallback(
    (record: AssessmentForPopulation) => {
      setSourceRecord(record);
      setFillDialogOpen(false);

      const newFormValues: Record<string, any> = {};
      getPopulatableChildren(item).forEach((i) => {
        if (!i.mapping) return;
        const { value } = getFieldOnAssessment(record, i.mapping);
        newFormValues[i.linkId] = gqlValueToFormValue(value, i);
      });

      severalItemsChanged({ values: newFormValues, type: ChangeType.User });
    },
    [setFillDialogOpen, severalItemsChanged, item]
  );

  const consoleDebugValues = useDebugDynamicFormValues(childLinkIds);

  const buttonProps: ButtonProps = {
    variant: 'outlined',
    size: 'small',
    sx: { height: 'fit-content' },
  };

  return (
    <Grid id={anchor} item sx={{ width: '100%' }}>
      <section>
        <Paper
          sx={{
            py: 3,
            px: 2.5,
            pageBreakInside: 'avoid',
          }}
          className='HmisForm-card'
        >
          {/* Card title */}
          {item.text && (
            <Stack
              justifyContent='space-between'
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              <Typography variant='cardTitle' sx={{ mb: 2 }} {...titleProps}>
                {TitleIcon && <TitleIcon sx={{ mr: 1 }} />}
                {item.text}
              </Typography>

              <Stack direction='row' spacing={2}>
                {import.meta.env.MODE === 'development' && !viewOnly && (
                  <Button
                    {...buttonProps}
                    onClick={consoleDebugValues}
                    variant='text'
                  >
                    Debug
                  </Button>
                )}
                {item.prefill && !viewOnly && (
                  <>
                    <Button
                      data-testid='fillSectionButton'
                      onClick={() => setFillDialogOpen(true)}
                      {...buttonProps}
                    >
                      Fill Section
                    </Button>
                    <Button
                      data-testid='clearButton'
                      color='error'
                      onClick={() => setClearDialogOpen(true)}
                      disabled={!enableClearSectionButton}
                      {...buttonProps}
                    >
                      Clear Section
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          )}

          {item.helperText && (
            <Typography sx={{ mb: 2 }} {...helperTextProps}>
              {item.helperText}
            </Typography>
          )}

          {/* Source record description */}
          {sourceRecord && (
            <Typography variant='body2' sx={{ mb: 3 }}>
              Filled with record from{' '}
              {parseAndFormatDate(sourceRecord.assessmentDate)}
            </Typography>
          )}

          {/* Dynamically render child items */}
          <Grid
            container
            direction='column'
            // Spacing between input elements inside the card
            gap={viewOnly ? 2 : 3}
            sx={{
              '& .MuiGrid-item:first-of-type': !item.text
                ? { pt: 0 }
                : undefined,
              mt: 0,
              // hide last pseudo element (assuming its a divider)
              '& .MuiGrid-item:last-of-type::after': { display: 'none' },
            }}
          >
            {renderChildItem &&
              item.item?.map((childItem) => renderChildItem(childItem))}
          </Grid>

          {/* Dialog for selecting autofill record */}
          {item.prefill && clientId && !viewOnly && (
            <>
              <RecordPickerDialog
                id={`recordPickerDialog-${item.linkId}`}
                item={item}
                clientId={clientId}
                open={fillDialogOpen}
                onSelected={onSelectAutofillRecord}
                onCancel={() => setFillDialogOpen(false)}
              />
              <ConfirmationDialog
                id='clearSection'
                open={clearDialogOpen}
                title='Clear Section'
                onConfirm={onClear}
                onCancel={() => setClearDialogOpen(false)}
                loading={false}
              >
                <Typography>
                  This will clear all the content in the <b>{item.text}</b>{' '}
                  section.
                </Typography>
              </ConfirmationDialog>
            </>
          )}
        </Paper>
      </section>
    </Grid>
  );
};
export default FormCard;
