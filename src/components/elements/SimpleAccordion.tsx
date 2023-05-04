import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionDetailsProps,
  AccordionProps,
  AccordionSummary,
  AccordionSummaryProps,
  Typography,
} from '@mui/material';
import React from 'react';

export type SimpleAccordionProps = {
  items: {
    key: string;
    header?: React.ReactNode;
    content: React.ReactNode;
    defaultExpanded?: boolean;
  }[];
  renderHeader?: (content: React.ReactNode) => React.ReactNode;
  renderContent?: (content: React.ReactNode) => React.ReactNode;
  AccordionProps?: Omit<AccordionProps, 'children'>;
  AccordionSummaryProps?: AccordionSummaryProps;
  AccordionDetailsProps?: AccordionDetailsProps;
};

const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  items,
  renderHeader = (content) => <Typography>{content}</Typography>,
  renderContent = (content) => <Typography>{content}</Typography>,
  AccordionProps = {},
  AccordionSummaryProps = {},
  AccordionDetailsProps = {},
}) => {
  return (
    <>
      {items.map((item) => (
        <Accordion
          defaultExpanded={item.defaultExpanded}
          key={item.key}
          {...AccordionProps}
          sx={{
            '&::before': {
              height: '0px',
            },
            ...AccordionProps.sx,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: '48px',
              '.MuiAccordionSummary-content': {
                my: 1,
                '&.Mui-expanded': {
                  my: 1,
                },
              },
              '&.Mui-expanded': {
                minHeight: '48px',
                my: 0,
              },
            }}
            {...AccordionSummaryProps}
            aria-controls={`${item.key}-content`}
            id={`${item.key}-header`}
          >
            {renderHeader(item.header || item.key)}
          </AccordionSummary>
          <AccordionDetails
            {...AccordionDetailsProps}
            id={`${item.key}-content`}
          >
            {renderContent(item.content)}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default SimpleAccordion;
