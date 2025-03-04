import { IInputCommonProps } from "./shareds"

interface IDatePickerProps extends IInputCommonProps {
}
export function DatePicker(props: IDatePickerProps) {
  const { label, ...rest } = props
  return (
    <div className="flex flex-col">
      {label && <label>{label}</label>}
      <input {...rest} type="datetime-local" />
    </div>

  )
}


