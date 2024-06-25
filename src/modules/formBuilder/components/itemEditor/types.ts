import { DeepPartial, Control } from 'react-hook-form';
import { FormItem } from '@/types/gqlTypes';

export type FormItemState = DeepPartial<FormItem>;
export type FormItemControl = Control<FormItemState>;
