interface FandtLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  withText?: boolean
  className?: string
  textClassName?: string
}

export function FandtLogo({
  size = 'md',
  withText = false,
  className = '',
  textClassName = '',
}: FandtLogoProps) {
  const iconSizes = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-10 w-10 rounded-2xl',
    lg: 'h-14 w-14 rounded-[20px]',
    xl: 'h-16 w-16 rounded-[22px]',
  }

  const svgSizes = {
    sm: 28,
    md: 40,
    lg: 56,
    xl: 64,
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Cool, clean geometric Monogram F&T Logo Badge */}
      <div
        className={`${iconSizes[size]} shrink-0 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-stone-800/80 dark:border-white/30 flex items-center justify-center transition-transform hover:scale-105`}
      >
        <svg
          width={svgSizes[size] * 0.72}
          height={svgSizes[size] * 0.72}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="FandT Logo"
        >
          {/* Letter F: Geometric modern cut */}
          <path
            d="M10 10.5 H21 C21.8 10.5 22.5 11.2 22.5 12 V13.2 C22.5 14 21.8 14.7 21 14.7 H14 V18.5 H19.5 C20.3 18.5 21 19.2 21 20 V21.2 C21 22 20.3 22.7 19.5 22.7 H14 V28.5 C14 29.3 13.3 30 12.5 30 H11.5 C10.7 30 10 29.3 10 28.5 V10.5 Z"
            fill="currentColor"
          />

          {/* Letter T: Clean architectural balance with subtle amber accent cap */}
          <path
            d="M22.5 10.5 H33 C33.8 10.5 34.5 11.2 34.5 12 V13.2 C34.5 14 33.8 14.7 33 14.7 H29.5 V28.5 C29.5 29.3 28.8 30 28 30 H27 C26.2 30 25.5 29.3 25.5 28.5 V14.7 H22.5 C21.7 14.7 21 14 21 13.2 V12 C21 11.2 21.7 10.5 22.5 10.5 Z"
            className="fill-amber-500 dark:fill-amber-500"
          />

          {/* Minimalist dot accent */}
          <circle cx="34" cy="28.5" r="1.8" className="fill-amber-500 dark:fill-amber-500" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tighter text-stone-900 dark:text-stone-100 ${textSizes[size]} ${textClassName}`}
          >
            FandT
          </span>
          <span className="text-[9.5px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-0.5">
            Personal Workspace
          </span>
        </div>
      )}
    </div>
  )
}
