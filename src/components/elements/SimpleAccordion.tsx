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
      {items.map((item, i) => (
        <Accordion defaultExpanded={i === 0} {...AccordionProps} key={item.key}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
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
