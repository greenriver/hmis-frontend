import {
  Alert,
  AlertProps,
  AlertTitle,
  Button,
  ButtonProps,
  Stack,
} from '@mui/material';
import React from 'react';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';

export type WayfindingItem = {
  title: string;
  to?: string;
  onClick?: VoidFunction;
  ButtonProps?: ButtonProps;
  ButtonLinkProps?: ButtonLinkProps;
};

export interface WayfinderProps {
  alertTitle?: string;
  alertText: string;
  AlertProps?: AlertProps;
  items: WayfindingItem[];
}

const Wayfinder: React.FC<WayfinderProps> = ({
  alertTitle,
  alertText,
  AlertProps,
  items,
}) => {
  return (
    <Stack gap={2}>
      <Alert {...AlertProps}>
        <AlertTitle>{alertTitle}</AlertTitle>
        {alertText}
      </Alert>
      {items.map((item, index) => {
        if (item.to) {
          return (
            <ButtonLink
              key={item.title}
              to={item.to}
              variant={index === 0 ? 'contained' : 'outlined'}
              {...item.ButtonLinkProps}
            >
              {item.title}
            </ButtonLink>
          );
        }
        return (
          <Button
            key={item.title}
            onClick={item.onClick}
            variant={index === 0 ? 'contained' : 'outlined'}
            {...item.ButtonProps}
          >
            {item.title}
          </Button>
        );
      })}
    </Stack>
  );
};

export default Wayfinder;
