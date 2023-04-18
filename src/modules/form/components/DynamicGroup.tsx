import { Box, Grid } from '@mui/material';

import { GroupItemComponentProps } from '../types';
import { maxWidthAtNestingLevel } from '../util/formUtil';

import DisabilityTable from './group/DisabilityTable';
import FormCard from './group/FormCard';
import HorizontalGroup from './group/HorizontalGroup';
import InputGroup from './group/InputGroup';
import QuestionGroup from './group/QuestionGroup';

import { Component } from '@/types/gqlTypes';

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
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 1,
            maxWidth: maxWidthAtNestingLevel(props.nestingLevel + 1),
            p: 1,
          }}
        >
          <QuestionGroup key={props.item.linkId} {...props} />
        </Box>
      );
    default:
      return <QuestionGroup key={props.item.linkId} {...props} />;
  }
};

export default DynamicGroup;
