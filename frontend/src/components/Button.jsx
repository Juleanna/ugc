import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function Button({
  invert = false,
  to,
  href,
  className,
  children,
  ...props
}) {
  const baseClasses = clsx(
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800',
    className,
  )

  let inner = <span className="relative top-px">{children}</span>

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {inner}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {inner}
      </a>
    )
  }

  return (
    <button className={baseClasses} {...props}>
      {inner}
    </button>
  )
}
