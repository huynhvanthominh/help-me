import { MouseEventHandler } from "react"

interface IButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>,
  label: string,
  className?: string,
}


export function Button(props: IButtonProps) {
  const { label, className, ...rest } = props;
  return (
    <button className={`${className ? className : ''}`} {...rest}>{label}</button>
  )
}


