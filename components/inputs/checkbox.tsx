import { IInputCommonProps } from "./shareds";



interface IInputProps extends IInputCommonProps {
  checked?: boolean
}
export function Checkbox(props: IInputProps) {
  const { label, classcontainer: classNameContainer, ...rest } = props
  return (
    <div className={`flex flex-col ${classNameContainer ? classNameContainer : ''}`}>
      {label && <label>{label}</label>}
      <input type='checkbox' {...rest} />
    </div>

  )
}
