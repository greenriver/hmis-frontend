import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, ButtonProps, useTheme } from '@mui/material';
import { isNil } from 'lodash-es';
import { PropsWithChildren } from 'react';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import {
  ClientIdentificationFieldsFragment,
  ClientSsnFieldsFragment,
} from '@/types/gqlTypes';
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
  {
    on?: boolean | null | undefined;
    onToggle?: VoidFunction;
    name: string;
  } & ButtonProps
> = ({ on, onToggle = () => {}, name, ...props }) => {
  const theme = useTheme();
  return (
    <Button
      onClick={(...args) => {
        onToggle();
        if (props.onClick) props.onClick(...args);
      }}
      color={on ? 'primary' : 'grayscale'}
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
        backgroundColor: on ? 'primary.surface' : 'grayscale.surface',
      }}
      aria-label={
        on
          ? `${name} (Currently shown. Click to hide all in column)`
          : `${name} (Currently hidden. Click to show all in column)`
      }
      aria-live={'polite'}
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
          name='SSN'
        >
          <strong>SSN</strong>
        </VisibilityToggleButton>
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
          name='DOB'
        >
          <strong>DOB</strong>
        </VisibilityToggleButton>
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
  client: ClientSsnFieldsFragment;
}> = ({ client }) => (
  <SsnShowValueContext.Consumer>
    {(show) => <ClientSsn client={client} hide={show ? false : undefined} />}
  </SsnShowValueContext.Consumer>
);
