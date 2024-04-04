import { FullPageError } from '@/modules/errors/components/ErrorFallback';

const NotFound = ({ text = 'Page not found.' }: { text?: string }) => {
  return <FullPageError text={text} />;
};

export default NotFound;
