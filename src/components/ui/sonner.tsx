"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#dcfce7", // Light green background
          "--success-border": "#10B981", // Your green color
          "--success-text": "#166534", // Darker green text
          "--error-bg": "#fef2f2", // Light red background
          "--error-border": "#EF4444", // Your red color
          "--error-text": "#dc2626", // Darker red text
          "--info-bg": "#eff6ff", // Light blue background
          "--info-border": "#1B2E6E", // Your blue color
          "--info-text": "#1e40af", // Darker blue text
          "--warning-bg": "#fef3c7", // Light orange background
          "--warning-border": "#F47B20", // Your orange color
          "--warning-text": "#d97706", // Darker orange text
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
