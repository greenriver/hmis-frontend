import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Button, ButtonProps, useTheme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { isNil } from 'lodash-es';
import { PropsWithChildren } from 'react';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';
import { BuildStateContext } from '@/utils/context';

type ValueType = boolean | undefined | null;

export const [
  [DobShowContext, DobShowValueContext, DobShowSetterContext],
  DobShowContextProvider,
  [useDobShowState, useDobShowStateValue, useDobShowStateSetter],
] = BuildStateContext<ValueType>(undefined);

export const [
  [SsnShowContext, SsnShowValueContext, SsnShowSetterContext],
  SsnShowContextProvider,
  [useSsnShowState, useSsnShowStateValue, useSsnShowStateSetter],
] = BuildStateContext<ValueType>(undefined);

export const SsnDobShowContextProvider: React.FC<
  PropsWithChildren<{ initialShowDob?: boolean; initialShowSsn?: boolean }>
> = ({ initialShowDob, initialShowSsn, children }) => (
  <DobShowContextProvider initialValue={initialShowDob || undefined}>
    <SsnShowContextProvider initialValue={initialShowSsn || undefined}>
      {children}
    </SsnShowContextProvider>
  </DobShowContextProvider>
);

const VisibilityToggleButton: React.FC<
  { on?: boolean | null | undefined; onToggle?: VoidFunction } & ButtonProps
> = ({ on, onToggle = () => {}, ...props }) => {
  const theme = useTheme();
  return (
    <Button
      onClick={(...args) => {
        onToggle();
        if (props.onClick) props.onClick(...args);
      }}
      startIcon={
        on ? (
          <VisibilityIcon color='inherit' />
        ) : (
          <VisibilityOffIcon sx={{ color: theme.palette.text.secondary }} />
        )
      }
      {...props}
      sx={{
        ...props.sx,
        backgroundColor: theme.palette.grey[100],
        color: on ? theme.palette.links : 'inherit',
      }}
    />
  );
};

export const ContextualSsnToggleButton: React.FC<ButtonProps> = (props) => (
  <SsnShowContext.Consumer>
    {([show, setShow]) => (
      <>
        <VisibilityToggleButton
          {...props}
          on={show}
          onToggle={() => setShow((prev) => (isNil(prev) ? true : !prev))}
          aria-hidden
        >
          <strong>SSN</strong>
        </VisibilityToggleButton>
        {/* Hide the toggle button since it doesn't make sense in a screen reader context. Add a visually hidden plaintext column header so the screen reader behaves correctly when navigating within the table. */}
        <Box sx={visuallyHidden}>SSN</Box>
      </>
    )}
  </SsnShowContext.Consumer>
);

export const ContextualDobToggleButton: React.FC<ButtonProps> = (props) => (
  <DobShowContext.Consumer>
    {([show, setShow]) => (
      <>
        <VisibilityToggleButton
          {...props}
          on={show}
          onToggle={() => setShow((prev) => (isNil(prev) ? true : !prev))}
          aria-hidden
        >
          <strong>DOB</strong>
        </VisibilityToggleButton>
        {/* Hide the toggle button since it doesn't make sense in a screen reader context. Add a visually hidden plaintext column header so the screen reader behaves correctly when navigating within the table. */}
        <Box sx={visuallyHidden}>DOB</Box>
      </>
    )}
  </DobShowContext.Consumer>
);

export const ContextualClientDobAge: React.FC<{
  client: ClientIdentificationFieldsFragment;
}> = ({ client }) => (
  <DobShowValueContext.Consumer>
    {(show) => <ClientDobAge client={client} hide={show ? false : undefined} />}
  </DobShowValueContext.Consumer>
);

export const ContextualClientSsn: React.FC<{
  client: ClientIdentificationFieldsFragment;
}> = ({ client }) => (
  <SsnShowValueContext.Consumer>
    {(show) => <ClientSsn client={client} hide={show ? false : undefined} />}
  </SsnShowValueContext.Consumer>
);
