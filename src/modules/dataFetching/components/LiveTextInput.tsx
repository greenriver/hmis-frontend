import { TypedDocumentNode, useMutation } from '@apollo/client';
import { isNil } from 'lodash-es';
import { useCallback, useState } from 'react';

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
  const [current, setCurrent] = useState<string | null>(null);
  const [mutate, { error }] = useMutation<Mutation, MutationVariables>(
    queryDocument,
    {
      onCompleted: (data) => {
        console.debug('Saved:', getValueFromResponse(data));
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
    <TextInput
      onChange={handleChange}
      value={isNil(current) ? initialValue : current}
      {...props}
    />
  );
};

export default LiveTextInput;
