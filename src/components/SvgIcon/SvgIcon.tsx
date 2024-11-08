import { useMemo } from 'react'

type SvgIconProps = {
  size?: string | number
  color?: string
  prefix?: string
  icon: string
}
export const SvgIcon: React.FC<SvgIconProps> = ({ color, icon, size = 16, prefix = 'icon' }: SvgIconProps) => {
  const symbolId = useMemo(() => `#${prefix}-${icon}`, [prefix, icon])
  return (
    <svg aria-hidden='true' width={size} height={size} fill={color}>
      <use href={symbolId} fill={color} />
    </svg>
  )
}
