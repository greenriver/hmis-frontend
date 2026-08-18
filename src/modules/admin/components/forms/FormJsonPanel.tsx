import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';

export interface FormJsonPanelProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  width?: string;
  height?: string;
  name?: string;
  debounceChangePeriod?: number;
}

const FormJsonPanel: React.FC<FormJsonPanelProps> = ({
  value,
  onChange,
  readOnly = true,
  width = '100%',
  height = '100%',
  name = 'form-json-panel',
  debounceChangePeriod,
}) => {
  return (
    <AceEditor
      mode='json'
      theme='tomorrow'
      width={width}
      height={height}
      name={name}
      wrapEnabled
      tabSize={2}
      value={value}
      readOnly={readOnly}
      highlightActiveLine={!readOnly}
      onChange={readOnly ? undefined : onChange}
      debounceChangePeriod={readOnly ? undefined : debounceChangePeriod}
    />
  );
};

export default FormJsonPanel;
