import { ViewGroupItemComponentProps } from '../../types';
import DisabilityTable from '../group/DisabilityTable';
// import DisabilityTable from './group/DisabilityTable';
import InputGroup from '../group/InputGroup';

import FormCard from './group/ViewCard';
// import HorizontalGroup from './group/HorizontalGroup';

// import QuestionGroup from './group/QuestionGroup';

import { Component } from '@/types/gqlTypes';

const DynamicViewGroup = (props: ViewGroupItemComponentProps) => {
  // TODO: ADD MORE GROUPS!

  // Always render top-level groups as cards
  if (props.nestingLevel === 0 && !props.item.component) {
    return (
      <FormCard
        key={props.item.linkId}
        anchor={props.visible ? props.item.linkId : undefined}
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
          itemChanged={() => {}}
          severalItemsChanged={() => {}}
          viewOnly
          rowSx={{ pt: 1, pb: 1, pl: 1, pr: 1 }}
        />
      );
    case Component.DisabilityTable:
      return (
        <DisabilityTable
          key={props.item.linkId}
          {...props}
          itemChanged={() => {}}
          severalItemsChanged={() => {}}
        />
      );
    //   case Component.HorizontalGroup:
    //     return <HorizontalGroup key={props.item.linkId} {...props} />;
    //   case Component.InfoGroup:
    //     return (
    //       <Box
    //         sx={{
    //           backgroundColor: (theme) => theme.palette.grey[100],
    //           // borderLeft: (theme) => `1px solid ${theme.palette.grey[300]}`,
    //           // backgroundColor: 'rgb(255,255,224, 0.8)',
    //           borderRadius: 1,
    //           // TODO make flexible if we go with this
    //           width: '415px',
    //           pb: 1,
    //           px: 1,
    //           ml: -1,
    //         }}
    //       >
    //         <QuestionGroup key={props.item.linkId} {...props} />
    //       </Box>
    //     );
    default:
      return (
        <FormCard
          key={props.item.linkId}
          anchor={props.visible ? props.item.linkId : undefined}
          {...props}
        />
      );
  }
};

export default DynamicViewGroup;
