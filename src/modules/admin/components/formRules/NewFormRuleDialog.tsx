import {
  Alert,
  Box,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BaseFormRule } from '@/modules/admin/components/formRules/FormRule';
import FormRuleCondition from '@/modules/admin/components/formRules/FormRuleCondition';
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
  ProjectType,
  useCreateFormRuleMutation,
} from '@/types/gqlTypes';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];

const projectTypePickList = localResolvePickList('ProjectType');
const funderPickList = localResolvePickList('FundingSource');

export interface RuleCondition {
  conditionType: ConditionType;
  value: string;
}

// `otherFunder` is also a condition type, of a sort, but it's left off here because
// it's dependent on `funder` and it's a TextInput instead of a Select
export type ConditionType =
  | 'projectId'
  | 'projectType'
  | 'organizationId'
  | 'funder'
  | 'serviceTypeId'
  | 'serviceCategoryId';

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
  // Form state for the rule
  const [dataCollectedAbout, setDataCollectedAbout] =
    useState<DataCollectedAbout>(DataCollectedAbout.AllClients);
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([]);
  const [otherFundingSource, setOtherFundingSource] = useState<string>('');
  const [serviceConditionType, setServiceConditionType] = useState<
    'serviceCategoryId' | 'serviceTypeId'
  >('serviceCategoryId');
  const [serviceConditionValue, setServiceConditionValue] =
    useState<string>('');

  // The form rule input itself is derived from form state
  const rule: FormRuleInput = useMemo(() => {
    const conditions: Partial<Record<ConditionType, string>> = {};
    ruleConditions.forEach(
      ({ conditionType, value }) => (conditions[conditionType] = value)
    );

    return {
      activeStatus: ActiveStatus.Active,
      dataCollectedAbout: dataCollectedAbout,
      projectId: conditions.projectId,
      projectType: conditions.projectType as ProjectType,
      organizationId: conditions.organizationId,
      funder: conditions.funder as FundingSource,
      serviceTypeId: conditions.serviceTypeId,
      serviceCategoryId: conditions.serviceCategoryId,
      ...(formRole === FormRole.Service
        ? { [serviceConditionType]: serviceConditionValue }
        : {}),
      ...(conditions.funder === FundingSource.LocalOrOtherFundingSource &&
      otherFundingSource
        ? { otherFunder: otherFundingSource }
        : {}),
    };
  }, [
    dataCollectedAbout,
    ruleConditions,
    otherFundingSource,
    serviceConditionType,
    serviceConditionValue,
    formRole,
  ]);

  const [validationError, setValidationError] = useState<string>();

  const onCloseDialog = useCallback(() => {
    onClose();
    // Null out the form values
    setDataCollectedAbout(DataCollectedAbout.AllClients);
    setRuleConditions([]);
    setOtherFundingSource('');
    setValidationError(undefined);
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
                  { __ref: `FormRule:${data.createFormRule?.formRule?.id}` },
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
      } else if (data.createFormRule?.errors?.length) {
        setValidationError(data.createFormRule.errors[0].fullMessage);
      }
    },
  });

  const handleSubmit = () => {
    let error: string | undefined = undefined;
    if (formRole === FormRole.Service) {
      if (!(rule.serviceCategoryId || rule.serviceTypeId)) {
        error = 'One of either Service Category or Service Type is required';
      }
    }

    setValidationError(error);
    if (!error) {
      createFormRule();
    }
  };

  const serviceConditionTypePickList = [
    { code: 'serviceTypeId', label: 'Service Type' },
    { code: 'serviceCategoryId', label: 'Service Category' },
  ];

  const { conditionTypePickList, conditionsAvailable } = useMemo(() => {
    const pickList: PickListOption[] = [
      { code: 'projectId', label: 'Project' },
      { code: 'projectType', label: 'Project Type' },
      { code: 'organizationId', label: 'Organization' },
      { code: 'funder', label: 'Funding Source' },
    ];

    const conditionsAlreadyInUse = ruleConditions.map(
      (condition) => condition.conditionType
    );
    const conditionsAvailable: ConditionType[] = pickList
      .map((option) => option.code as ConditionType)
      .filter(
        (conditionType) => !conditionsAlreadyInUse.includes(conditionType)
      );

    return {
      conditionTypePickList: pickList,
      conditionsAvailable,
    };
  }, [ruleConditions]);

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

  // Store the strings corresponding to the current project/org/etc. so we can display in the FormRule chip
  const projectName = useMemo(() => {
    if (!projectList || !rule.projectId) return;
    return projectList.find((option) => option.code === rule.projectId)?.label;
  }, [projectList, rule.projectId]);
  const organizationName = useMemo(() => {
    if (!orgList || !rule.organizationId) return;
    return orgList.find((option) => option.code === rule.organizationId)?.label;
  }, [orgList, rule.organizationId]);
  const serviceTypeName = useMemo(() => {
    if (!serviceTypePickList || !rule.serviceTypeId) return;
    return serviceTypePickList.find(
      (option) => option.code === rule.serviceTypeId
    )?.label;
  }, [serviceTypePickList, rule.serviceTypeId]);
  const serviceCategoryName = useMemo(() => {
    if (!serviceCategoryPickList || !rule.serviceCategoryId) return;
    return serviceCategoryPickList.find(
      (option) => option.code === rule.serviceCategoryId
    )?.label;
  }, [serviceCategoryPickList, rule.serviceCategoryId]);

  const isTiny = useIsMobile('sm');

  if (error) throw error;

  return (
    <CommonDialog
      open={open}
      maxWidth='md'
      fullWidth
      fullScreen={isTiny}
      onClose={onCloseDialog}
    >
      <DialogTitle>
        New rule for: <b>{formTitle}</b>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ my: 2 }}>
          <Card
            sx={{ backgroundColor: theme.palette.background.default, p: 2 }}
          >
            <BaseFormRule
              dataCollectedAbout={rule.dataCollectedAbout || undefined}
              projectType={rule.projectType || undefined}
              funder={rule.funder || undefined}
              otherFunder={rule.otherFunder || undefined}
              projectName={projectName || undefined}
              organizationName={organizationName || undefined}
              serviceTypeName={serviceTypeName || undefined}
              serviceCategoryName={serviceCategoryName || undefined}
              formRole={formRole}
            />
          </Card>
          {validationError && <Alert severity='error'>{validationError}</Alert>}
          {formRole === FormRole.Service && (
            <Box
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderRadius: 1,
                py: 1,
                px: 2,
              }}
            >
              <FormRuleCondition
                prefixText='Collects'
                joiningText={'of'}
                index={ruleConditions.length > 0 ? 1 : undefined}
                conditionType={serviceConditionType}
                conditionTypePickList={serviceConditionTypePickList}
                setConditionType={(conditionType) => {
                  setServiceConditionType(
                    conditionType as 'serviceTypeId' | 'serviceCategoryId'
                  );
                  setServiceConditionValue('');
                }}
                value={serviceConditionValue || ''}
                setValue={(conditionValue) =>
                  setServiceConditionValue(conditionValue)
                }
                valuePickList={pickListMap[serviceConditionType]}
                valueError={
                  !!validationError &&
                  !rule.serviceCategoryId &&
                  !rule.serviceTypeId
                }
              />
            </Box>
          )}
          <FormSelect
            label={
              formRole === FormRole.Service
                ? 'For client type'
                : 'Applies to client type'
            }
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
            if (conditionsAvailable.length > 0) {
              setRuleConditions([
                ...ruleConditions,
                {
                  conditionType: conditionsAvailable[0],
                  value: '',
                },
              ]);
            }
          }}
          addItemText='Add Condition'
          disableAdd={conditionsAvailable.length === 0}
        >
          {ruleConditions.map((condition, index) => {
            const { conditionType, value } = condition;

            let conditionTypeIndex;
            if (formRole === FormRole.Service) {
              conditionTypeIndex = index + 2;
            } else if (ruleConditions.length > 1) {
              conditionTypeIndex = index + 1;
            }

            return (
              <RemovableCard
                key={conditionType}
                onRemove={() => {
                  setRuleConditions(
                    ruleConditions.filter(
                      (condition) => condition.conditionType !== conditionType
                    )
                  );
                }}
                removeTooltip={'Remove Condition'}
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  border: 0,
                  py: 1,
                }}
              >
                <FormRuleCondition
                  prefixText={index === 0 ? 'If' : 'And'}
                  index={conditionTypeIndex}
                  conditionType={conditionType}
                  conditionTypePickList={conditionTypePickList.filter(
                    (option) =>
                      conditionsAvailable.includes(
                        option.code as ConditionType
                      ) || option.code === conditionType
                  )}
                  setConditionType={(newConditionType: ConditionType) => {
                    setRuleConditions(
                      ruleConditions.map((condition) => {
                        if (condition.conditionType === conditionType) {
                          return {
                            conditionType: newConditionType,
                            value: '',
                          };
                        } else {
                          return condition;
                        }
                      })
                    );
                  }}
                  value={value || ''}
                  valuePickList={pickListMap[conditionType]}
                  setValue={(conditionValue) => {
                    setRuleConditions(
                      ruleConditions.map((condition) => {
                        if (condition.conditionType === conditionType) {
                          return {
                            ...condition,
                            value: conditionValue,
                          };
                        } else {
                          return condition;
                        }
                      })
                    );
                  }}
                />
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
                <Grid item xs={12}>
                  <TextInput
                    label='And funding source is'
                    value={rule.otherFunder || ''}
                    onChange={(e) => {
                      setOtherFundingSource(e.target.value);
                    }}
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
          onSubmit={handleSubmit}
          onDiscard={onCloseDialog}
          submitLoading={loading}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default NewFormRuleDialog;
