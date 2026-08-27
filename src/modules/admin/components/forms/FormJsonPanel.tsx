import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';

export interface FormJsonPanelProps {
  value: string;
  readOnly?: boolean;
  width?: string;
  height?: string;
  name?: string;
}

const FormJsonPanel: React.FC<FormJsonPanelProps> = ({
  value,
  readOnly = true,
  width = '100%',
  height = '100%',
  name = 'form-json-panel',
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
    />
  );
};

export default FormJsonPanel;
