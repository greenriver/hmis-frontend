import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import DeleteMutationConfirmationDialog from '@/modules/dataFetching/components/DeleteMutationConfirmationDialog';
import {
  DeleteCeMatchRuleDocument,
  DeleteCeMatchRuleMutation,
  DeleteCeMatchRuleMutationVariables,
} from '@/types/gqlTypes';

interface Props {
  ruleId: string;
  open: boolean;
  onClose: VoidFunction;
  onDeleted?: (ruleId: string) => void;
}

const CeMatchRuleDeleteDialog: React.FC<Props> = ({
  ruleId,
  open,
  onClose,
  onDeleted,
}) => {
  const apolloClient = useApolloClient();

  const handleDeleted = useCallback(() => {
    apolloClient.cache.evict({
      id: apolloClient.cache.identify({
        __typename: 'CeMatchRule',
        id: ruleId,
      }),
    });
    onDeleted?.(ruleId);
  }, [apolloClient.cache, onDeleted, ruleId]);

  return (
    <DeleteMutationConfirmationDialog<
      DeleteCeMatchRuleMutation,
      DeleteCeMatchRuleMutationVariables
    >
      open={open}
      onClose={onClose}
      onSuccess={handleDeleted}
      variables={{ id: ruleId }}
      queryDocument={DeleteCeMatchRuleDocument}
      idPath='deleteCeMatchRule.rule.id'
      recordName='rule'
    />
  );
};

export default CeMatchRuleDeleteDialog;
