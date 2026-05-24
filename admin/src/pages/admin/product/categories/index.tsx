import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProductCategoriesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className='text-sm text-muted-foreground'>
        Category CRUD shell is ready. API-backed DataTable and forms will be implemented in Phase 4.
      </CardContent>
    </Card>
  )
}
