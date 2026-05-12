import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { Button } from '@/components/custom/button'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchKeyword, setSearchKeyword] = useState('')

  const handleSearch = () => {
    table.getColumn('name')?.setFilterValue(undefined)

    const keyword = searchKeyword.trim()
    if (!keyword) return
    table.getColumn('name')?.setFilterValue(keyword)
  }

  const handleReset = () => {
    setSearchKeyword('')
    table.resetColumnFilters()
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Search name...'
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSearch()
              }
            }}
            className='h-8 w-[150px] lg:w-[250px]'
          />
          <Button
            variant='outline'
            onClick={handleSearch}
            className='h-8 px-2 lg:px-3'
          >
            <IconSearch className='mr-1 h-4 w-4' />
            Search
          </Button>
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleReset}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} maxVisibleColumns={3} />
    </div>
  )
}
