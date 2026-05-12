import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { RoleItem } from '@/services/roleApi'

type PermissionsDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface PermissionsContextType {
  open: PermissionsDialogType | null
  setOpen: (str: PermissionsDialogType | null) => void
  currentRow: RoleItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RoleItem | null>>
}

const PermissionsContext = React.createContext<PermissionsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PermissionsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PermissionsDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<RoleItem | null>(null)

  return (
    <PermissionsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = React.useContext(PermissionsContext)

  if (!context) {
    throw new Error('usePermissions has to be used within <PermissionsContext>')
  }

  return context
}
