import { Box } from '@mui/system';

import { ViewGroupItemComponentProps } from '../../types';
import DisabilityTable from '../group/DisabilityTable';
import FormCard from '../group/FormCard';
import HorizontalGroup from '../group/HorizontalGroup';
import InputGroup from '../group/InputGroup';
import QuestionGroup from '../group/QuestionGroup';

import Signature from '../group/Signature';
import SignatureGroupCard from '../group/SignatureGroupCard';
import TableGroup from '../group/TableGroup';

import { Component } from '@/types/gqlTypes';

const DynamicViewGroup = (props: ViewGroupItemComponentProps) => {
  // Always render top-level groups as cards
  if (props.nestingLevel === 0 && !props.item.component) {
    return (
      <FormCard
        key={props.item.linkId}
        anchor={props.visible ? props.item.linkId : undefined}
        viewOnly
        {...props}
      />
    );
  }

  switch (props.item.component) {
    case Component.InputGroup:
      return (
        <InputGroup
          key={props.item.linkId}
          {...props}
          viewOnly
          rowSx={{ pt: 1, pb: 1, pl: 1, pr: 1 }}
        />
      );
    case Component.DisabilityTable:
      return <DisabilityTable key={props.item.linkId} {...props} />;
    case Component.HorizontalGroup:
      return <HorizontalGroup key={props.item.linkId} viewOnly {...props} />;
    case Component.Signature:
      return <Signature key={props.item.linkId} viewOnly {...props} />;
    case Component.InfoGroup:
      return (
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRadius: 1,
            p: 1,
            ml: -1,
          }}
        >
          <QuestionGroup key={props.item.linkId} {...props} />
        </Box>
      );
    case Component.Table:
      return <TableGroup key={props.item.linkId} {...props} viewOnly />;
    case Component.SignatureGroup:
      return <SignatureGroupCard key={props.item.linkId} viewOnly {...props} />;
    default:
      return (
        <QuestionGroup
          key={props.item.linkId}
          {...props}
          nestingLevel={0}
          viewOnly
        />
      );
  }
};

export default DynamicViewGroup;
