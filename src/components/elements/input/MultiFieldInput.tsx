import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

type InputOptions<P> = {
  name: string;
  chars: number;
  inputProps?: P;
};
type ValueType = string | null | undefined;
type ValuesType = Record<string, ValueType>;

type Handlers = {
  handleChange: (value: ValueType) => any;
};

export type MultiFieldInputProps<P> = {
  inputs: InputOptions<P>[];
  values?: ValuesType;
  onChange?: (values: ValuesType) => any;
  separator?: React.ReactNode;
  renderInput?: (options: {
    input: InputOptions<P>;
    handlers: Handlers;
    value: ValueType;
    ref: React.Ref<HTMLInputElement>;
    key: string | number;
  }) => JSX.Element;
  renderInputs?: (
    nodes: Record<string, { node: JSX.Element; options: InputOptions<P> }>
  ) => JSX.Element;
};

export type MultiFieldInputItemProps<P> = {
  name: string;
  input: InputOptions<P>;
  value: ValueType;
  handlers: Handlers;
  renderInput: NonNullable<MultiFieldInputProps<P>['renderInput']>;
  setRef: (ref: RefObject<HTMLInputElement | null>) => any;
};

const MultiFieldInputItem = <P,>({
  name,
  input,
  value,
  handlers,
  renderInput,
  setRef,
}: MultiFieldInputItemProps<P>): JSX.Element => {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    setRef(ref);
  }, [setRef]);
  return renderInput({ input, handlers, value, ref, key: name });
};

const MultiFieldInput = <P extends object = JSX.IntrinsicElements['input']>({
  inputs,
  values = {},
  onChange = () => {},
  renderInput = ({ input, handlers, value, ref, key }) => (
    <input
      ref={ref}
      key={key}
      size={input.chars}
      name={input.name}
      value={value || ''}
      onChange={(e) => handlers.handleChange(e.target.value)}
      {...input.inputProps}
    />
  ),
  renderInputs = (nodes) => <>{Object.values(nodes).map(({ node }) => node)}</>,
}: MultiFieldInputProps<P>): JSX.Element => {
  const refs = useRef<Record<string, RefObject<HTMLInputElement | null>>>({});

  const goToPrevFrom = useCallback(
    (name: string) => {
      const index = inputs.findIndex((input) => input.name === name);
      const targetInput = inputs.find((_input, i) => i === index - 1);
      const targetElement =
        (targetInput?.name && refs.current[targetInput?.name].current) ||
        undefined;

      if (!targetElement) return;
      if (targetElement.disabled) return;

      targetElement.focus();
    },
    [inputs]
  );

  const goToNextFrom = useCallback(
    (name: string, value?: string) => {
      const index = inputs.findIndex((input) => input.name === name);
      const targetInput = inputs.find((_input, i) => i === index + 1);
      const targetElement =
        (targetInput?.name && refs.current[targetInput?.name].current) ||
        undefined;

      if (!targetElement || !targetInput) return;
      if (targetElement.disabled) return;

      if (value && !values[targetInput.name])
        onChange({ ...values, [targetInput.name]: value });

      targetElement.select();
    },
    [inputs, onChange, values]
  );

  const inputNodes = useMemo(() => {
    return inputs.reduce((acc, options) => {
      const { name, chars } = options;
      const handleChange: Handlers['handleChange'] = (val) => {
        const value = val || '';
        if (value.length <= chars) onChange({ ...values, [name]: value });
        if (value.length >= chars) {
          goToNextFrom(name, value.slice(chars));
        }
        if (!value || value.length < 1) goToPrevFrom(name);
      };
      const handlers = {
        handleChange,
      };
      return {
        ...acc,
        [name]: {
          node: (
            <MultiFieldInputItem
              key={name}
              name={name}
              handlers={handlers}
              value={values[name] || ''}
              input={options}
              renderInput={renderInput}
              setRef={(ref) => (refs.current[name] = ref)}
            />
          ),
          options,
        },
      };
    }, {});
  }, [inputs, renderInput, values, onChange, goToPrevFrom, goToNextFrom]);

  return renderInputs(inputNodes);
};

export default MultiFieldInput;
