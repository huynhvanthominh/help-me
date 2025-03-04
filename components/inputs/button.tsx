import { MouseEventHandler } from "react"

interface IButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>,
  label: string
}


export function Button(props: IButtonProps) {
  const { label, ...rest } = props;
  return (
    <div>
      <button {...rest}>{label}</button>
    </div>
  )
}


