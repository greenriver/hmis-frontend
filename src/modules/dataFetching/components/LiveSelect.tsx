import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Typography } from '@mui/material';
import { useState } from 'react';

import GenericSelect, {
  GenericSelectProps,
} from '@/components/elements/input/GenericSelect';
import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import { PickListOption } from '@/types/gqlTypes';

export interface Props<Mutation, MutationVariables>
  extends Omit<GenericSelectProps<PickListOption, false, false>, 'onChange'> {
  queryDocument: TypedDocumentNode<MutationVariables, MutationVariables>;
  constructVariables: (option: PickListOption | null) => MutationVariables;
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
  // Indicator success status
  const [completed, setCompleted] = useState(false);

  // mutation to change the value on the server
  const [mutate, { loading, error }] = useMutation<Mutation, MutationVariables>(
    queryDocument,
    {
      onCompleted: (data) => {
        const newOption = getOptionFromResponse(data);
        setCurrent(newOption);
        setCompleted(true);
      },
    }
  );

  if (error) console.error(error);

  const handleChange = (
    _event: React.SyntheticEvent,
    option: PickListOption | null
  ) => {
    setCurrent(option);
    setCompleted(false);
    void mutate({
      variables: constructVariables(option),
    });
  };

  return (
    <InputIndicatorContainer
      loading={loading}
      error={!!error}
      success={completed}
      position='right'
    >
      <GenericSelect<PickListOption, false, false>
        renderOption={(props, option) => (
          <li {...props} key={option.code}>
            <Typography variant='body2'>
              {option.label || option.code}
            </Typography>
          </li>
        )}
        getOptionLabel={(option) => option.label || option.code || ''}
        onChange={handleChange}
        value={current}
        disabled={loading}
        fullWidth
        {...props}
      />
    </InputIndicatorContainer>
  );
};
export default LiveSelect;
