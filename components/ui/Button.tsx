import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          // variants
          variant === 'gold' && 'bg-[#c9a84c] text-black hover:bg-[#e8c97a] hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] hover:-translate-y-0.5',
          variant === 'outline' && 'border border-white/20 text-white hover:border-white/50 hover:bg-white/5',
          variant === 'ghost' && 'text-white/70 hover:text-white hover:bg-white/5',
          // sizes
          size === 'sm' && 'text-xs px-4 py-2',
          size === 'md' && 'text-sm px-5 py-2.5',
          size === 'lg' && 'text-base px-8 py-4',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
