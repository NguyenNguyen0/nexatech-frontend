"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { cn } from "@/lib/utils"

const BRAND_PRIMARY = "#004d75"
const BRAND_LOGO = "/brand/n-logo-transparent-bg.png"
const TOAST_OFFSET_TOP = 18

type ToasterProps = React.ComponentProps<typeof Sonner>

function BrandLogoIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO}
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 object-contain"
      aria-hidden
    />
  )
}

const brandIcon = <BrandLogoIcon />

const Toaster = ({
  position = "top-center",
  offset = { top: TOAST_OFFSET_TOP },
  mobileOffset = { top: TOAST_OFFSET_TOP },
  closeButton = false,
  className,
  toastOptions,
  style,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    const onToastClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const toastEl = target.closest("[data-sonner-toast]")
      if (!toastEl) return
      if (target.closest("[data-button]")) return
      if (toastEl.getAttribute("data-dismissible") === "false") return
      if (toastEl.getAttribute("data-type") === "loading") return

      const container = toastEl.closest("[data-sonner-toaster]")
      if (!container) return

      const visibleToasts = Array.from(
        container.querySelectorAll('[data-sonner-toast]:not([data-removed="true"])'),
      )
      const index = visibleToasts.indexOf(toastEl)
      if (index < 0) return

      const activeToasts = toast.getToasts()
      const id = activeToasts[index]?.id
      if (id != null) toast.dismiss(id)
    }

    document.addEventListener("click", onToastClick)
    return () => document.removeEventListener("click", onToastClick)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      offset={offset}
      mobileOffset={mobileOffset}
      closeButton={closeButton}
      className={cn("nexatech-toaster group", className)}
      icons={{
        success: brandIcon,
        info: brandIcon,
        warning: brandIcon,
        error: brandIcon,
        loading: brandIcon,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1b1c1c",
          "--normal-border": "rgba(0, 77, 117, 0.22)",
          "--border-radius": "8px",
          "--toast-icon-margin-start": "0px",
          "--toast-icon-margin-end": "14px",
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        closeButton: false,
        ...toastOptions,
        classNames: {
          toast: cn(
            "nexatech-toast group toast flex w-full cursor-pointer items-center gap-3.5 rounded-lg border bg-white py-3.5 pl-3.5 pr-3.5 text-[#1b1c1c] shadow-md",
            "border-[#004d75]/20 border-l-[3px] border-l-[#004d75]",
            "dark:border-[#004d75]/35 dark:bg-[#0f1419] dark:text-white",
            "hover:bg-[#f7fbfd] dark:hover:bg-[#141c22]",
            toastOptions?.classNames?.toast,
          ),
          title: cn(
            "text-sm font-semibold leading-snug text-[#1b1c1c] dark:text-white",
            toastOptions?.classNames?.title,
          ),
          description: cn(
            "text-sm text-[#5c5c5c] dark:text-[#b8c5cc]",
            toastOptions?.classNames?.description,
          ),
          actionButton: cn(
            "rounded-md bg-[#004d75] text-white hover:bg-[#003d5c]",
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            "rounded-md bg-[#e7f3f8] text-[#004d75] hover:bg-[#d4eaf3]",
            toastOptions?.classNames?.cancelButton,
          ),
          success: cn("border-l-emerald-600", toastOptions?.classNames?.success),
          error: cn("border-l-red-600", toastOptions?.classNames?.error),
          warning: cn("border-l-amber-500", toastOptions?.classNames?.warning),
          info: cn("border-l-[#004d75]", toastOptions?.classNames?.info),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, BRAND_PRIMARY, BRAND_LOGO }
