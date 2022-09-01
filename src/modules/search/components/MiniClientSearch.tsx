import { useState } from 'react';

import TextInput from '@/components/elements/input/TextInput';

const MiniClientSearch = ({
  onSubmit,
}: {
  onSubmit: (text: string | undefined) => void;
}) => {
  const [value, setValue] = useState<string>();

  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <TextInput
      label='Search for Client'
      placeholder='Search by name, SSN, Personal ID...'
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onKeyUp={submitOnEnter}
    />
  );
};
export default MiniClientSearch;
