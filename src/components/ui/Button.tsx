import { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-[14px] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft-sm",
        secondary: "bg-surface-100 text-surface-700 hover:bg-surface-200 border border-surface-200",
        dark: "bg-surface-900 text-white hover:bg-surface-800 shadow-soft-sm",
        outline: "border-2 border-surface-200 text-surface-700 hover:bg-surface-50 hover:border-surface-300",
        ghost: "text-surface-700 hover:bg-surface-100",
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-5 py-3",
        xl: "px-6 py-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
)

export interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button({ 
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent opacity-80 mr-2"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  )
} 