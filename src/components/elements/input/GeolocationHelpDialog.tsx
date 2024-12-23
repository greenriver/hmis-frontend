import {
  Box,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

import { CommonOrderedList } from '@/components/CommonOrderedList';
import CommonDialog from '@/components/elements/CommonDialog';
import SimpleAccordion from '@/components/elements/SimpleAccordion';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AccordionLabel = ({
  main,
  secondary,
}: {
  main: React.ReactNode;
  secondary: React.ReactNode;
}) => (
  <Stack direction='row' gap={2} component='span'>
    <Typography sx={{ width: 120 }} component='span'>
      {main}
    </Typography>
    <Typography color='text.secondary' component='span'>
      {secondary}
    </Typography>
  </Stack>
);

const items = [
  {
    key: 'iphone',
    header: <AccordionLabel main='Mobile' secondary='iPhone' />,
    content: (
      <>
        <CommonOrderedList>
          <li>Open the Settings app.</li>
          <li>Scroll down to Privacy.</li>
          <li>Tap Location Services.</li>
          <li>
            Find your browser app (like Safari) and select "While Using the
            App," or "Ask Next Time" based on your preference.
          </li>
          <li>Visit the website and try again.</li>
        </CommonOrderedList>
      </>
    ),
  },
  {
    key: 'android',
    // header: 'Android',
    header: <AccordionLabel main='Mobile' secondary='Android' />,
    content: (
      <CommonOrderedList>
        <li>Open the device settings menu.</li>
        <li>Tap Location. Ensure location is toggled on.</li>
        <li>Go back to Settings and then select App permissions.</li>
        <li>
          Find your browser app (like Chrome) and select Allow for location
          access.
        </li>
        <li>Visit the website and try again.</li>
      </CommonOrderedList>
    ),
  },
  {
    key: 'desktop_chrome',
    // header: 'Google Chrome',
    header: <AccordionLabel main='Desktop' secondary='Chrome' />,
    content: (
      <CommonOrderedList>
        <li>
          Click the three-dot menu (top-right corner) and select Settings.
        </li>
        <li>Go to Privacy and Security &#x3e; Site Settings.</li>
        <li>Under Permissions, click Location.</li>
        <li>
          Find the site in the list of "Blocked" sites, click it, and select
          Allow.
        </li>
      </CommonOrderedList>
    ),
  },
  {
    key: 'edge',
    // header: 'Microsoft Edge',
    header: <AccordionLabel main='Desktop' secondary='Microsoft Edge' />,
    content: (
      <CommonOrderedList>
        <li>
          Click the three-dot menu (top-right corner) and select Settings.
        </li>
        <li>Go to Cookies and site permissions &#x3e; Location.</li>
        <li>
          Find the site under "Blocked" and click the trash icon to reset it.
          Reload the site and choose Allow when prompted.
        </li>
      </CommonOrderedList>
    ),
  },
  {
    key: 'firefox ',
    // header: 'Mozilla Firefox',
    header: <AccordionLabel main='Desktop' secondary='Firefox' />,
    content: (
      <CommonOrderedList>
        <li>
          Click the three-dot menu (top-right corner) and select Settings.
        </li>
        <li>Go to Privacy & Security and scroll to the Permissions section.</li>
        <li>Click Settings next to Location.</li>
        <li>
          Find the site in the list, select it, and click Remove Website. Reload
          the site and choose Allow when prompted.
        </li>
      </CommonOrderedList>
    ),
  },
];

const GeolocationHelpDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <CommonDialog open={open} onClose={onClose} enableBackdropClick>
      <DialogTitle>How to Turn Browser Location Back On</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          If you accidentally blocked a website from accessing your location,
          you can easily change that.{' '}
          <b>
            Here’s how to turn location permissions back on in most browsers:
          </b>
        </Box>
        <SimpleAccordion
          items={items}
          // To avoid rendering lists inside Typography
          renderContent={(content) => content}
        />
      </DialogContent>
    </CommonDialog>
  );
};

export default GeolocationHelpDialog;
