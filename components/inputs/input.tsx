import { IInputCommonProps } from "./shareds";

type HTMLInputTypeAttribute =
  | "number"
  | "text"


interface IInputProps extends IInputCommonProps {
  type?: HTMLInputTypeAttribute,
}
export function Input(props: IInputProps) {
  const { label, type, ...rest } = props
  return (
    <div className="flex flex-col w-full">
      {label && <label>{label}</label>}
      <input type={type ?? "text"} {...rest} />
    </div>

  )
}
