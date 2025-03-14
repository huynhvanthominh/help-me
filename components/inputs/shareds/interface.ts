import { ChangeEventHandler, FocusEventHandler } from "react";

export interface IInputCommonProps {
  label?: string;
  value?: string | number | string[],
  onChange?: ChangeEventHandler<HTMLInputElement>,
  onBlur?: FocusEventHandler<HTMLInputElement>,
  className?: string,
  classcontainer?: string
}

