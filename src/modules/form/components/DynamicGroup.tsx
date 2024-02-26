import { Box, Grid, lighten } from '@mui/material';
import { ReactNode } from 'react';

import { GroupItemComponentProps } from '../types';

import DisabilityTable from './group/DisabilityTable';
import FormCard from './group/FormCard';
import HorizontalGroup from './group/HorizontalGroup';
import InputGroup from './group/InputGroup';
import QuestionGroup from './group/QuestionGroup';

import { Component } from '@/types/gqlTypes';

export const InfoGroup = ({
  children,
}: {
  children: ReactNode;
  nestingLevel?: number;
}) => (
  <Box
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.grey[100], 0.2),
      borderRadius: 1,
      width: 'fit-content',
      px: 0.5,
      // use box shadow to "extend" background color beyond div. doing this so we dont mess with the height
      boxShadow: (theme) =>
        `0 2px 0 6px ${lighten(theme.palette.grey[100], 0.2)}`,
    }}
  >
    {children}
  </Box>
);

interface Props extends GroupItemComponentProps {
  clientId?: string;
  debug?: (ids?: string[]) => void;
}

const DynamicGroup: React.FC<Props> = ({ debug, ...props }) => {
  // Always render top-level groups as cards
  if (props.nestingLevel === 0 && !props.item.component) {
    return (
      <FormCard
        key={props.item.linkId}
        anchor={props.visible ? props.item.linkId : undefined}
        debug={debug}
        {...props}
      />
    );
  }

  switch (props.item.component) {
    case Component.InputGroup:
      if (props.nestingLevel === 0) {
        return (
          <Grid item>
            <InputGroup key={props.item.linkId} {...props} />
          </Grid>
        );
      }
      return <InputGroup key={props.item.linkId} {...props} />;
    case Component.DisabilityTable:
      return <DisabilityTable key={props.item.linkId} {...props} />;
    case Component.HorizontalGroup:
      return <HorizontalGroup key={props.item.linkId} {...props} />;
    case Component.InfoGroup:
      return (
        <InfoGroup nestingLevel={props.nestingLevel}>
          <QuestionGroup key={props.item.linkId} {...props} />
        </InfoGroup>
      );
    default:
      return <QuestionGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
