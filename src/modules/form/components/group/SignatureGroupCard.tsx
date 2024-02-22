import { GroupItemComponentProps } from '../../types';
import FormCard, { FormCardProps } from './FormCard';
import { SignatureIcon } from '@/components/elements/SemanticIcons';

/**
 * Render a top-level form card with Signature Icon
 * and special styling.
 *
 */
const SignatureGroupCard = ({
  debug,
  ...props
}: GroupItemComponentProps & { debug?: FormCardProps['debug'] }) => (
  <FormCard
    key={props.item.linkId}
    anchor={props.visible ? props.item.linkId : undefined}
    debug={debug}
    TitleIcon={SignatureIcon}
    titleProps={{ color: 'primary', variant: 'h3', fontWeight: 600 }}
    helperTextProps={{ variant: 'body1' }}
    {...props}
  />
);

export default SignatureGroupCard;
