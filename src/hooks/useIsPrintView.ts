import { useLocation } from 'react-router-dom';

const useIsPrintView = () =>
  new URLSearchParams(useLocation().search).has('print');

export default useIsPrintView;
