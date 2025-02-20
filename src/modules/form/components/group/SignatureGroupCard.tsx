import { GroupItemComponentProps } from '../../types';
import FormCard from './FormCard';
import { SignatureIcon } from '@/components/elements/SemanticIcons';

/**
 * Render a top-level form card with Signature Icon and special styling.
 * Usually has Signature group item(s) as children.
 */
const SignatureGroupCard = (props: GroupItemComponentProps) => (
  <FormCard
    key={props.item.linkId}
    anchor={props.visible ? props.item.linkId : undefined}
    TitleIcon={SignatureIcon}
    titleProps={{ color: 'primary', variant: 'h3', fontWeight: 600 }}
    helperTextProps={{ variant: 'body1' }}
    {...props}
  />
);

export default SignatureGroupCard;
