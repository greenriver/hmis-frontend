import { DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import CommonDialog from '@/components/elements/CommonDialog';
import CardGroup, { RemovableCard } from '@/modules/formBuilder/components/itemEditor/conditionals/CardGroup';
import {
  ActiveStatus,
  DataCollectedAbout,
  FormRuleInput,
  ItemType, PickListOption,
  PickListType,
  useCreateFormRuleMutation,
} from '@/types/gqlTypes';
import React, { useMemo, useState } from 'react';
import FormSelect from '@/modules/form/components/FormSelect';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { isPickListOption } from '@/modules/form/types';
import { Stack } from '@mui/system';
import { usePickList } from '@/modules/form/hooks/usePickList';

const dataCollectedAboutPickList =
  localResolvePickList('DataCollectedAbout') || [];

const projectTypePickList = localResolvePickList('ProjectType');
const funderPickList = localResolvePickList('FundingSource');

const conditionPickList: PickListOption[] = [
  {code: 'projectId', label: 'Project'},
  {code: 'projectType', label: 'Project Type'},
  {code: 'organizationId', label: 'Organization'},
  {code: 'funder', label: 'Funding Source'},
];

type ConditionType = 'projectId' | 'projectType' | 'organizationId' | 'funder';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  formId: string;
}

const NewFormRuleDialog: React.FC<Props> = ({ open, onClose, formId }) => {
  const [rule, setRule] = useState<FormRuleInput>({
    activeStatus: ActiveStatus.Active,
    dataCollectedAbout: DataCollectedAbout.AllClients
  });

  const [createFormRule, {loading, error}] = useCreateFormRuleMutation({
    variables: {
      input: { input: rule, definitionId: formId }
    },
    onCompleted: (data) => {
      onClose();
      // TODO @MARTHA
      // check for errors
      // clear the cache in order to update the rules
      // evictQuery('formDefinition', { id: formId });
      // evictQuery('formRules');
    }
  })

  const conditionsMap: Record<ConditionType, any> = useMemo(() => {
    return {
      'projectType': rule.projectType,
      'projectId': rule.projectId,
      'organizationId': rule.organizationId,
      'funder': rule.funder,
      // 'otherFunder': rule.otherFunder,  // todo @Martha - need to add otherFunder back and make it depend on fundingSource
    }
  }, [rule]);

  const conditionsAvailable: ConditionType[] = useMemo(() =>
    Object.entries(conditionsMap)
      .filter(([_key, value]) => !value)
      .map(([key, _value]) => key as ConditionType),
    [conditionsMap]);

  const { pickList: projectList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Project,
    }
  });

  const { pickList: orgList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.Organization,
    }
  });

  const pickListMap: Record<ConditionType, PickListOption[]> = {
    'projectType': projectTypePickList || [],
    'funder': funderPickList || [],
    'organizationId': orgList || [],
    'projectId': projectList || [],
  }

  return <CommonDialog
    open={open}
    fullWidth
    onClose={onClose}
  >
    <DialogTitle>New Rule</DialogTitle>
    <DialogContent>
      <Stack direction='row' sx={{my: 2}} gap={2}>
        <Typography>Applies to</Typography>
        <FormSelect
          sx={{width: 300}}
          value={{code: rule.dataCollectedAbout || DataCollectedAbout.AllClients}}
          options={dataCollectedAboutPickList}
          onChange={(_, option) => {
            if (isPickListOption(option)) {
              setRule({...rule, dataCollectedAbout: option.code as DataCollectedAbout});
            }
          }}
        />
      </Stack>

      <CardGroup
        onAddItem={() => {
          if (conditionsAvailable.length > 0) {
            const conditionType = conditionsAvailable[0];
            const defaultValue = pickListMap[conditionType][0].code;
            // setting this condition's value to some default value for its type
            // (e.g. the first Project in the list) causes it to appear in the list
            setRule({...rule, [conditionType]: defaultValue})
          }
        }}
        addItemText='Add Condition'
        disableAdd={conditionsAvailable.length === 0}
      >
        {Object.entries(conditionsMap)
          .filter(([_key, value]) => !!value)
          .map(([key, value], index) => {
            const condition = key as ConditionType

            return <RemovableCard
              key={condition}
              onRemove={() => {
                // setting this condition's value to undefined will remove it from the modal
                setRule({...rule, [condition]: undefined});
              }}
              removeTooltip={'Remove Condition'}
            >
              <Stack direction='row' sx={{my: 2}} gap={2}>
                {index === 0 ? 'If' : 'and'}
                <FormSelect
                  value={{code: condition}}
                  options={conditionPickList}
                  onChange={(_event, option) => {
                    if (isPickListOption(option)) {
                      const newCondition = option.code as ConditionType
                      setRule({
                        ...rule,
                        [condition]: undefined,
                        [option.code]: pickListMap[newCondition][0].code
                      });
                    }
                  }}
                  sx={{width: 300}}
                />
                is
                <FormSelect
                  // disable clearing the input because we expect users to remove the whole condition
                  disableClearable={true}
                  value={value ? {code: value} : undefined}
                  options={pickListMap[condition]}
                  onChange={(_event, option) => {
                    if (isPickListOption(option)) {
                      setRule({ ...rule, [key]: option.code });
                    }
                  }}
                  sx={{width: 300}}
                />
              </Stack>
            </RemovableCard>
          })
        }
      </CardGroup>

    </DialogContent>
    <DialogActions>
      <FormDialogActionContent
        onSubmit={() => createFormRule()}
        onDiscard={onClose}
        submitLoading={loading}
      />
    </DialogActions>
  </CommonDialog>
}

export default NewFormRuleDialog;
