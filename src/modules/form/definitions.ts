import assesment from '@/modules/form/data/assessment.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

const FormDefinitions: { [identifier: string]: FormDefinitionJson } = {
  'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
  // 'intake-assessment': JSON.parse(JSON.stringify(assesment)),
};
export default FormDefinitions;
