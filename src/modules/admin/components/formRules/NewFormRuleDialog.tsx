import {
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { Stack, SxProps } from '@mui/system';
import { startCase } from 'lodash-es';
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
import CardGroup, {
  RemovableCard,
} from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import { cache } from '@/providers/apolloClient';
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

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];

const projectTypePickList = localResolvePickList('ProjectType');
const funderPickList = localResolvePickList('FundingSource');

const defaultRule: FormRuleInput = {
  activeStatus: ActiveStatus.Active,
  dataCollectedAbout: DataCollectedAbout.AllClients,
};

// `otherFunder` is also a condition type, of a sort, but it's left off here because
// it's dependent on `funder` and it's a TextInput instead of a Select
type ConditionType =
  | 'projectId'
  | 'projectType'
  | 'organizationId'
  | 'funder'
  | 'serviceTypeId'
  | 'serviceCategoryId';

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
  formCacheKey: string;
}

const NewFormRuleDialog: React.FC<Props> = ({
  open,
  onClose,
  formId,
  formTitle,
  formRole,
  formCacheKey,
}) => {
  const [rule, setRule] = useState<FormRuleInput>(defaultRule);

  const onCloseDialog = useCallback(() => {
    onClose();
    setRule(defaultRule); // clear out the form
  }, [onClose]);

  const [createFormRule, { loading, error }] = useCreateFormRuleMutation({
    variables: {
      input: { input: rule, definitionId: formId },
    },
    onCompleted: (data) => {
      if (data.createFormRule?.formRule) {
        onCloseDialog();

        // Apollo has now already added the new rule to the cache, but here we add it to the cached result of the
        // `formRules` query (by reference), so that it's reflected in the FormRuleTable
        cache.modify({
          fields: {
            formRules(existingRules = {}) {
              return {
                ...existingRules,
                nodesCount: existingRules.nodesCount + 1, // this isn't used, but update it anyway to avoid inconsistency
                nodes: [
                  ...existingRules.nodes,
                  { __ref: `FormRule:${data.createFormRule?.formRule.id}` },
                ],
              };
            },
          },
        });

        // Evict the existing `projectMatches` for this form, so that they are re-fetched and reflect the new rule
        cache.evict({
          id: `FormDefinition:{"cacheKey":"${formCacheKey}"}`,
          fieldName: 'projectMatches',
        });
      }
    },
  });

  const { conditionTypePickList, conditions, conditionsAvailable } =
    useMemo(() => {
      const pickList: PickListOption[] = [
        { code: 'projectId', label: 'Project' },
        { code: 'projectType', label: 'Project Type' },
        { code: 'organizationId', label: 'Organization' },
        { code: 'funder', label: 'Funding Source' },
      ];

      if (formRole === FormRole.Service) {
        pickList.push(
          { code: 'serviceTypeId', label: 'Service Type' },
          { code: 'serviceCategoryId', label: 'Service Category' }
        );
      }

      const conditions = pickList.map((conditionOption) => {
        const conditionType = conditionOption.code as ConditionType;
        return {
          conditionType,
          value: rule[conditionType],
        };
      });

      const conditionsAvailable: ConditionType[] = conditions
        .filter((condition) => condition.value === undefined)
        .map((condition) => condition.conditionType);

      return {
        conditionTypePickList: pickList,
        conditions,
        conditionsAvailable,
      };
    }, [formRole, rule]);

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
            value={{
              code: rule.dataCollectedAbout || DataCollectedAbout.AllClients,
            }}
            options={dataCollectedAboutPickList}
            onChange={(_event, option) => {
              if (isPickListOption(option)) {
                setRule({
                  ...rule,
                  dataCollectedAbout: option.code as DataCollectedAbout,
                });
              }
            }}
          />
        </Stack>
        <CardGroup
          onAddItem={() => {
            if (conditionsAvailable.length > 0) {
              const conditionType = conditionsAvailable[0];
              setRule({ ...rule, [conditionType]: '' });
            }
          }}
          addItemText='Add Condition'
          disableAdd={conditionsAvailable.length === 0}
        >
          {conditions
            .filter((condition) => condition.value !== undefined)
            .map(({ conditionType, value }, index) => {
              return (
                <RemovableCard
                  key={conditionType}
                  onRemove={() => {
                    // setting this condition's value to undefined will remove it from the modal
                    setRule({ ...rule, [conditionType]: undefined });
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
                        value={{ code: conditionType }}
                        options={conditionTypePickList}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            setRule({
                              ...rule,
                              [conditionType]: undefined,
                              [option.code]: '',
                            });
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
                        value={value ? { code: value } : null}
                        placeholder={`Select ${startCase(
                          conditionType.replace(/Id$/, '')
                        )}`}
                        options={pickListMap[conditionType]}
                        onChange={(_event, option) => {
                          if (isPickListOption(option)) {
                            setRule({ ...rule, [conditionType]: option.code });
                          } else {
                            setRule({ ...rule, [conditionType]: '' });
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </RemovableCard>
              );
            })}

          {rule.funder === FundingSource.LocalOrOtherFundingSource && (
            <Card
              sx={{
                backgroundColor: theme.palette.grey[100],
                border: 0,
                px: 2,
                py: 1,
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <FormRuleLabelTypography>
                    And funding source is
                  </FormRuleLabelTypography>
                </Grid>
                <Grid item xs={8}>
                  <TextInput
                    value={rule.otherFunder || ''}
                    onChange={(e) =>
                      setRule({ ...rule, otherFunder: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Card>
          )}
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
