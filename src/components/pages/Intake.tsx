import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/intake.json';
import { FormDefinition } from '@/modules/form/types';
import ConfiguredApolloProvider from '@/providers/ConfiguredApolloProvider';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const Intake: React.FC = () => {
  return (
    <ConfiguredApolloProvider>
      <DynamicForm
        definition={intakeFormDefinition}
        onSubmit={(data) => {
          console.log(JSON.stringify(data, null, 2));
        }}
      />
    </ConfiguredApolloProvider>
  );
};

export default Intake;
