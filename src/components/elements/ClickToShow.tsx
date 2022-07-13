import { Link } from '@mui/material';
import React, { useState } from 'react';
interface Props {
  children: React.ReactNode;
  text?: string;
}

const ClickToShow: React.FC<Props> = ({ children, text }) => {
  const [hidden, setHidden] = useState(true);

  if (!hidden) return <>{children}</>;

  return (
    <Link onClick={() => setHidden(false)}>{text || 'click to show'}</Link>
  );
};

export default ClickToShow;
