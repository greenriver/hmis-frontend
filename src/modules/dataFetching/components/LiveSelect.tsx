import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Typography } from '@mui/material';
import { useState } from 'react';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import { PickListOption } from '@/types/gqlTypes';

export interface Props<Mutation, MutationVariables>
  extends Omit<GenericSelectProps<PickListOption, false, false>, 'onChange'> {
  queryDocument: TypedDocumentNode<MutationVariables, MutationVariables>;
  constructVariables: (option: PickListOption) => MutationVariables;
  getOptionFromResponse: (data: Mutation) => PickListOption | null;
}

const LiveSelect = <Mutation, MutationVariables>({
  queryDocument,
  constructVariables,
  getOptionFromResponse,
  value,
  ...props
}: Props<Mutation, MutationVariables>) => {
  // Store selected value in state so that it can be reflected immediately
  const [current, setCurrent] = useState<PickListOption | null>(value || null);
  const [mutate, { loading, error }] = useMutation<Mutation, MutationVariables>(
    queryDocument,
    {
      onCompleted: (data) => {
        const newOption = getOptionFromResponse(data);
        setCurrent(newOption);
      },
    }
  );
  if (error) console.error(error);

  const handleChange = (
    _event: React.SyntheticEvent,
    option: PickListOption | null
  ) => {
    setCurrent(option);
    if (!option) return;
    void mutate({
      variables: constructVariables(option),
    });
  };

  return (
    <GenericSelect<PickListOption, false, false>
      renderOption={(props, option) => (
        <li {...props} key={option.code}>
          <Typography variant='body2'>{option.label}</Typography>
        </li>
      )}
      onChange={handleChange}
      value={current}
      disabled={loading}
      {...props}
    />
  );
};
export default LiveSelect;
