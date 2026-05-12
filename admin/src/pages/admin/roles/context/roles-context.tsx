import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { RoleItem } from '@/services/roleApi'

type RolesDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface RolesContextType {
  open: RolesDialogType | null
  setOpen: (str: RolesDialogType | null) => void
  currentRow: RoleItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RoleItem | null>>
}

const RolesContext = React.createContext<RolesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function RolesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RolesDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<RoleItem | null>(null)

  return (
    <RolesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext.Provider>
  )
}

export const useRoles = () => {
  const rolesContext = React.useContext(RolesContext)

  if (!rolesContext) {
    throw new Error('useRoles has to be used within <RolesContext>')
  }

  return rolesContext
}
