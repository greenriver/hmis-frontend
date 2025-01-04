import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, ButtonProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { PropsWithChildren } from 'react';
import CollapsibleList, {
  CollapsibleListProps,
} from '@/components/elements/CollapsibleList';
import { BuildStateContext } from '@/utils/context';

/**
 * Context and components to use for interfaces that contain
 * several CollapsibleLists, with the ability to "Expand All" and "Collapse All" from a button
 */

type ValueType = boolean | undefined;

export const [
  [ExpansionContext],
  ExpansionProvider,
  [useExpandLists, useExpandListsValue, useExpandListsSetter],
] = BuildStateContext<ValueType>(undefined);

// Wrap the table in this provider
export const ContextualCollapsibleListsProvider: React.FC<
  PropsWithChildren<{ initialExpand?: boolean }>
> = ({ initialExpand, children }) => (
  <ExpansionProvider initialValue={initialExpand}>{children}</ExpansionProvider>
);

// Put this element in the table cell
export const ContextualCollapsibleList: React.FC<CollapsibleListProps> = (
  props
) => (
  <ExpansionContext.Consumer>
    {([expanded]) => <CollapsibleList {...props} open={!!expanded} />}
  </ExpansionContext.Consumer>
);

const ExpansionToggleButton: React.FC<
  { on?: boolean | null | undefined; onToggle?: VoidFunction } & ButtonProps
> = ({ on, onToggle = () => {}, ...props }) => {
  return (
    <Button
      onClick={(...args) => {
        onToggle();
        if (props.onClick) props.onClick(...args);
      }}
      startIcon={on ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      variant='text'
      color='grayscale'
      size='small'
      {...props}
    />
  );
};

// Put this button in the column header
export const ContextualListExpansionButton: React.FC<ButtonProps> = (props) => (
  <ExpansionContext.Consumer>
    {([expanded, setExpanded]) => (
      <ExpansionToggleButton
        {...props}
        on={expanded}
        onToggle={() => setExpanded((prev) => (isNil(prev) ? true : !prev))}
      >
        <strong>{expanded ? 'Collapse All' : 'Expand All'}</strong>
      </ExpansionToggleButton>
    )}
  </ExpansionContext.Consumer>
);
