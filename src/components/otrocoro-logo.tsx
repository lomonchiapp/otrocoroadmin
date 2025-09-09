import React from 'react'

interface OtrocoroLogoProps {
  className?: string
  white?: boolean
  showText?: boolean
}

export const OtrocoroLogo: React.FC<OtrocoroLogoProps> = ({ 
  className = "h-8 w-auto", 
  white = false,
  showText = false 
}) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={white ? "/logo-white.png" : "/logo.png"}
        alt="Otrocoro"
        className={className}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Otrocoro
          </span>
          <span className="text-xs text-muted-foreground">
            Admin Panel
          </span>
        </div>
      )}
    </div>
  )
}

export default OtrocoroLogo
