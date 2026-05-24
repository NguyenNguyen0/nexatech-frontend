import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProductBrandsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brands</CardTitle>
      </CardHeader>
      <CardContent className='text-sm text-muted-foreground'>
        Brand CRUD shell is ready. API-backed DataTable and forms will be implemented in Phase 4.
      </CardContent>
    </Card>
  )
}
