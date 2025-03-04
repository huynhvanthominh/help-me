import { ChangeEventHandler, FocusEventHandler, HTMLInputTypeAttribute } from "react";

export interface IInputCommonProps {
  label?: string;
  value?: string | number | string[],
  onChange?: ChangeEventHandler<HTMLInputElement>,
  onBlur?: FocusEventHandler<HTMLInputElement>
}

