import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { userTypes } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { Button } from '@/components/custom/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchCategory, setSearchCategory] = useState<
    'username' | 'email' | 'phoneNumber'
  >('username')
  const [searchKeyword, setSearchKeyword] = useState('')

  const handleSearch = () => {
    table.getColumn('username')?.setFilterValue(undefined)
    table.getColumn('email')?.setFilterValue(undefined)
    table.getColumn('phoneNumber')?.setFilterValue(undefined)

    const keyword = searchKeyword.trim()
    if (!keyword) return
    table.getColumn(searchCategory)?.setFilterValue(keyword)
  }

  const handleReset = () => {
    setSearchKeyword('')
    table.resetColumnFilters()
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <div className='flex items-center gap-2'>
          <Select
            value={searchCategory}
            onValueChange={(value) =>
              setSearchCategory(value as 'username' | 'email' | 'phoneNumber')
            }
          >
            <SelectTrigger className='h-8 w-[140px]'>
              <SelectValue placeholder='Search by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='username'>Username</SelectItem>
              <SelectItem value='email'>Email</SelectItem>
              <SelectItem value='phoneNumber'>Phone</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={`Search ${searchCategory}...`}
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
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Invited', value: 'invited' },
                { label: 'Suspended', value: 'suspended' },
              ]}
            />
          )}
          {table.getColumn('role') && (
            <DataTableFacetedFilter
              column={table.getColumn('role')}
              title='Role'
              options={userTypes.map((t) => ({ ...t }))}
            />
          )}
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
      <DataTableViewOptions table={table} maxVisibleColumns={5} />
    </div>
  )
}
