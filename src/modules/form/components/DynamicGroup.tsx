import { Box, Grid, lighten } from '@mui/material';
import { ReactNode } from 'react';

import { GroupItemComponentProps } from '../types';
import { maxWidthAtNestingLevel } from '../util/formUtil';

import { MAX_INPUT_WIDTH } from './DynamicField';
import DisabilityTable from './group/DisabilityTable';
import FormCard from './group/FormCard';
import HorizontalGroup from './group/HorizontalGroup';
import InputGroup from './group/InputGroup';
import QuestionGroup from './group/QuestionGroup';

import { Component } from '@/types/gqlTypes';

export const InfoGroup = ({
  children,
  nestingLevel = 1,
}: {
  children: ReactNode;
  nestingLevel?: number;
}) => (
  <Box
    sx={{
      backgroundColor: (theme) => lighten(theme.palette.grey[100], 0.2),
      borderRadius: 1,
      maxWidth:
        nestingLevel == 1
          ? MAX_INPUT_WIDTH + 16
          : maxWidthAtNestingLevel(nestingLevel + 1),
      p: 1,
    }}
  >
    {children}
  </Box>
);

const DynamicGroup = ({
  debug,
  ...props
}: GroupItemComponentProps & { debug?: (ids?: string[]) => void }) => {
  // Always render top-level groups as cards
  if (props.nestingLevel === 0 && !props.item.component) {
    return (
      <FormCard
        key={props.item.linkId}
        anchor={props.visible ? props.item.linkId : undefined}
        // debug={debug}
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
