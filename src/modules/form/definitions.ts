import assesment from '@/modules/form/data/assessment.json';
import { FormDefinition } from '@/modules/form/types';

const FormDefinitions: { [identifier: string]: FormDefinition } = {
  'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
};
export default FormDefinitions;
