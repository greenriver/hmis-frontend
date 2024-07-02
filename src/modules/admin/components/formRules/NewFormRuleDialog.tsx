import { Card, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import CardGroup, { RemovableCard } from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import {
  ActiveStatus,
  DataCollectedAbout,
  FormRole,
  FormRuleInput,
  FundingSource,
  ItemType,
  PickListOption,
  PickListType,
  useCreateFormRuleMutation,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];

const projectTypePickList = localResolvePickList('ProjectType');
const funderPickList = localResolvePickList('FundingSource');

// `otherFunder` is also a condition type, of a sort, but it's left off here because
// it's dependent on `funder` and it's (for now) a TextInput instead of a Select
type ConditionType =
  | 'projectId'
  | 'projectType'
  | 'organizationId'
  | 'funder'
  | 'serviceTypeId'
  | 'serviceCategoryId';

type Condition = {
  conditionType: ConditionType | null;  // null when first created and the type hasn't yet been selected in the dropdown
  value: string;
}

const FormRuleLabelTypography = ({
  sx,
  children,
}: {
  sx?: SxProps;
  children: ReactNode;
}) => (
  <Typography
    variant='body2'
    sx={{ pt: 1, fontWeight: theme.typography.fontWeightBold, ...sx }}
  >
    {children}
  </Typography>
);

interface Props {
  open: boolean;
  onClose: VoidFunction;
  formId: string;
  formTitle: string;
  formRole: FormRole;
}

const NewFormRuleDialog: React.FC<Props> = ({
  open,
  onClose,
  formId,
  formTitle,
  formRole, // todo @Martha ??
}) => {
  const [dataCollectedAbout, setDataCollectedAbout] = useState(DataCollectedAbout.AllClients);
  const [conditions, setConditions] = useState<Condition[]>([]);

  const onCloseDialog = useCallback(() => {
    onClose();
    setConditions([]);
  }, [onClose]);

  const [createFormRule, { loading, error }] = useCreateFormRuleMutation({
    variables: {
      input: {
        input: {
          dataCollectedAbout
          // todo @martha
        },
        definitionId: formId
      },
    },
    onCompleted: (data) => {
      if (data.createFormRule?.formRule) {
        onCloseDialog();
        // clear the cache so that applicability gets updated
        evictQuery('formDefinition', { id: formId }); // todo @martha - evict specifically projectMatches?
        evictQuery('formRules');
      }
    },
  });

  const {conditionTypePickList} = useMemo(() => {
    const conditionTypePickList: PickListOption[] = [
      { code: 'projectId', label: 'Project' },
      { code: 'projectType', label: 'Project Type' },
      { code: 'organizationId', label: 'Organization' },
      { code: 'funder', label: 'Funding Source' },
    ];

    if (formRole === FormRole.Service) {
      conditionTypePickList.push(
        { code: 'serviceTypeId', label: 'Service Type' },
        { code: 'serviceCategoryId', label: 'Service Category' }
      );
    }
    return {conditionTypePickList}
  }, [formRole]);

  const { pickList: projectList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Project,
    },
  });

  const { pickList: orgList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Organization,
    },
  });

  const { pickList: serviceTypePickList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.AllServiceTypes,
    },
  });

  const { pickList: serviceCategoryPickList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.AllServiceCategories,
    },
  });

  const pickListMap: Record<ConditionType, PickListOption[]> = {
    projectType: projectTypePickList || [],
    funder: funderPickList || [],
    organizationId: orgList || [],
    projectId: projectList || [],
    serviceTypeId: serviceTypePickList || [],
    serviceCategoryId: serviceCategoryPickList || [],
  };

  const isTiny = useIsMobile('sm');

  if (error) throw error;

  return (
    <CommonDialog
      open={open}
      fullWidth
      fullScreen={isTiny}
      onClose={onCloseDialog}
    >
      <DialogTitle>
        New rule for: <b>{formTitle}</b>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} direction='row' sx={{ mt: 2, mb: 1, display: 'flex' }}>
          <FormRuleLabelTypography>Applies to</FormRuleLabelTypography>
          <FormSelect
            sx={{ flexGrow: 1 }}
            value={{ code: dataCollectedAbout }}
            options={dataCollectedAboutPickList}
            onChange={(_event, option) => {
              if (isPickListOption(option)) {
                setDataCollectedAbout(option.code as DataCollectedAbout);
              }
            }}
          />
        </Stack>
        <CardGroup
          onAddItem={() => {
            setConditions([...conditions, {
              conditionType: null,
              value: '',
            }]);
          }}
          addItemText='Add Condition'
          // disableAdd={conditionsAvailable.length === 0}  // todo @martha
        >
          {conditions.map(({ conditionType, value }, index) => {
              return (
                <RemovableCard
                  key={conditionType}
                  onRemove={() => {
                    setConditions(conditions.splice(index, 1))
                  }}
                  removeTooltip={'Remove Condition'}
                  sx={{
                    backgroundColor: theme.palette.grey[100],
                    border: 0,
                    py: 1,
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={2} sm={1}>
                      <FormRuleLabelTypography>
                        {index === 0 ? 'If' : 'And'}
                      </FormRuleLabelTypography>
                    </Grid>
                    <Grid item xs={9} sm={4}>
                      <FormSelect
                        disableClearable
                        value={conditionType ? { code: conditionType } : null}
                        options={conditionTypePickList}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            const nextConditions = conditions.map((c, i) => {
                              if (i === index) {
                                return {conditionType: option.code as ConditionType, value}
                              } else {
                                return c;
                              }
                            });
                            setConditions(nextConditions);
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <FormRuleLabelTypography
                        sx={isTiny ? {} : { textAlign: 'center' }}
                      >
                        is
                      </FormRuleLabelTypography>
                    </Grid>
                    <Grid item xs={10} sm={5}>
                      <FormSelect
                        // disable clearing the input because we expect users to remove the whole condition
                        disableClearable
                        value={value ? { code: value } : null}
                        options={conditionType ? pickListMap[conditionType] : []}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            const nextConditions = conditions.map((c, i) => {
                              if (i === index) {
                                return {conditionType, value: option.code}
                              } else {
                                return c;
                              }
                            });
                            setConditions(nextConditions);
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </RemovableCard>
              );
            })}

          {/*{rule.funder === FundingSource.LocalOrOtherFundingSource && (*/}
          {/*  <Card*/}
          {/*    sx={{*/}
          {/*      backgroundColor: theme.palette.grey[100],*/}
          {/*      border: 0,*/}
          {/*      px: 2,*/}
          {/*      py: 1,*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Grid container spacing={1}>*/}
          {/*      <Grid item xs={4}>*/}
          {/*        <FormRuleLabelTypography>*/}
          {/*          And funding source is*/}
          {/*        </FormRuleLabelTypography>*/}
          {/*      </Grid>*/}
          {/*      <Grid item xs={8}>*/}
          {/*        <TextInput*/}
          {/*          value={rule.otherFunder || ''}*/}
          {/*          onChange={(e) =>*/}
          {/*            setRule({ ...rule, otherFunder: e.target.value })*/}
          {/*          }*/}
          {/*        />*/}
          {/*      </Grid>*/}
          {/*    </Grid>*/}
          {/*  </Card>*/}
          {/*)}*/}
        </CardGroup>
      </DialogContent>
      <DialogActions>
        <FormDialogActionContent
          submitButtonText='Create Rule'
          onSubmit={() => createFormRule()}
          onDiscard={onCloseDialog}
          submitLoading={loading}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default NewFormRuleDialog;
