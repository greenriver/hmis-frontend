import { Alert, Card, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { pick } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import FormRuleCondition, { FormRuleLabelTypography } from '@/modules/admin/components/formRules/FormRuleCondition';
import FormRuleSelectField from '@/modules/admin/components/formRules/FormRuleSelectField';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import CardGroup, { RemovableCard } from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
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

  // This would be better handled with real form validation
  const [validationError, setValidationError] = useState<string>();
  const handleSubmit = () => {
    let error: string | undefined = undefined;
    if (formRole === FormRole.Service) {
      if (rule.serviceCategoryId && rule.serviceTypeId) {
        error =
          'You cannot choose both Service Category and Service Type. Please only choose one';
      } else if (!(rule.serviceCategoryId || rule.serviceTypeId)) {
        error = 'One of either Service Category or Service Type are required';
      }
    }

    setValidationError(error);
    if (!error) {
      createFormRule();
    }
  };

  const { conditionTypePickList, conditions, conditionsAvailable } =
    useMemo(() => {
      const pickList: PickListOption[] = [
        { code: 'projectId', label: 'Project' },
        { code: 'projectType', label: 'Project Type' },
        { code: 'organizationId', label: 'Organization' },
        { code: 'funder', label: 'Funding Source' },
      ];

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
    }, [rule]);

  const servicePickList = useMemo(() => {
    return [
      { code: 'serviceTypeId', label: 'Service Type' },
      { code: 'serviceCategoryId', label: 'Service Category' }
    ]
  }, []);

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

  const onChangeRule = (
    conditionType: ConditionType,
    option: PickListOption | PickListOption[] | null
  ) => {
    if (isPickListOption(option)) {
      setRule({ ...rule, [conditionType]: option.code });
    } else {
      setRule({ ...rule, [conditionType]: '' });
    }
  };

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
        <Stack gap={2} sx={{ my: 2 }}>
          {validationError && <Alert severity='error'>{validationError}</Alert>}
          {formRole === FormRole.Service && (
            <>

              <FormRuleCondition
                conditionType={rule.serviceTypeId ? 'serviceTypeId' : 'serviceCategoryId'}
                conditionTypePickList={servicePickList}
                conditionAriaLabel={'Form Rule Applicability'}
                setRule={setRule}
                value={rule.serviceTypeId ? rule.serviceTypeId : rule.serviceCategoryId}
                valuePickList={rule.serviceTypeId ? pickListMap.serviceTypeId : pickListMap.serviceCategoryId}
                onChangeRule={onChangeRule}
                rule={rule}
              />

              {/*<FormRuleSelectField*/}
              {/*  rule={rule}*/}
              {/*  label='Applies to Service Category'*/}
              {/*  name='serviceCategoryId'*/}
              {/*  onChange={(option) => onChangeRule('serviceCategoryId', option)}*/}
              {/*  options={pickListMap.serviceCategoryId}*/}
              {/*/>*/}
              {/*<FormRuleSelectField*/}
              {/*  rule={rule}*/}
              {/*  label='Applies to Service Type'*/}
              {/*  name='serviceTypeId'*/}
              {/*  onChange={(option) => onChangeRule('serviceTypeId', option)}*/}
              {/*  options={pickListMap.serviceTypeId}*/}
              {/*/>*/}
            </>
          )}
          <FormSelect
            label='Applies to client type'
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
                  <FormRuleCondition
                    startLabel={index === 0 ? 'If' : 'And'}
                    conditionType={conditionType}
                    conditionTypePickList={conditionTypePickList}
                    setRule={setRule}
                    value={value}
                    valuePickList={pickListMap[conditionType]}
                    onChangeRule={onChangeRule}
                    rule={rule}
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
              {/* todo @martha - move this in as well */}
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
          onSubmit={handleSubmit}
          onDiscard={onCloseDialog}
          submitLoading={loading}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default NewFormRuleDialog;
