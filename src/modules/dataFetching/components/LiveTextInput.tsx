import { TypedDocumentNode, useMutation } from '@apollo/client';
import { isNil } from 'lodash-es';
import { useCallback, useState } from 'react';

import InputIndicatorContainer from '@/components/elements/input/InputIndicatorContainer';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';
import useDebouncedHandler from '@/hooks/useDebouncedHandler';

export interface Props<Mutation, MutationVariables>
  extends Omit<TextInputProps, 'onChange' | 'value' | 'initialValue'> {
  queryDocument: TypedDocumentNode<MutationVariables, MutationVariables>;
  constructVariables: (option: string) => MutationVariables;
  getValueFromResponse: (data: Mutation) => string;
  initialValue?: string;
}

const LiveTextInput = <Mutation, MutationVariables>({
  queryDocument,
  constructVariables,
  getValueFromResponse,
  initialValue,
  ...props
}: Props<Mutation, MutationVariables>) => {
  // Current value
  const [current, setCurrent] = useState<string | null>(null);
  // Indicator success status
  const [completed, setCompleted] = useState(false);

  const [mutate, { error, loading }] = useMutation<Mutation, MutationVariables>(
    queryDocument,
    {
      onCompleted: (data) => {
        console.debug('Saved:', getValueFromResponse(data));
        setCompleted(true);
      },
    }
  );

  if (error) console.error(error);

  // update state
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setCurrent(event.target.value),
    []
  );

  // debounce performing the actual mutation
  const sendMutation = useCallback(
    (value: string | null) => {
      if (isNil(value)) return;
      if (value === initialValue) return;
      setCompleted(false);
      console.debug('Mutating:', value);
      void mutate({
        variables: constructVariables(value),
      });
    },
    [mutate, constructVariables, initialValue]
  );
  useDebouncedHandler<string | null>(sendMutation, current, 500);

  // TODO: reflect loading state, reflect server value
  return (
    <InputIndicatorContainer
      loading={loading}
      error={!!error}
      success={completed}
      position='right'
    >
      <TextInput
        onChange={handleChange}
        value={isNil(current) ? initialValue : current}
        fullWidth
        {...props}
      />
    </InputIndicatorContainer>
  );
};

export default LiveTextInput;
