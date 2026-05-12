import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/custom/button'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  maxVisibleColumns?: number
}

export function DataTableViewOptions<TData>({
  table,
  maxVisibleColumns = 5,
}: DataTableViewOptionsProps<TData>) {
  const managedColumns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide()
    )
  const visibleManagedCount = managedColumns.filter((column) =>
    column.getIsVisible()
  ).length

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='mr-2 h-4 w-4' />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {managedColumns.map((column) => {
            const checked = column.getIsVisible()
            const disabled = !checked && visibleManagedCount >= maxVisibleColumns
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
