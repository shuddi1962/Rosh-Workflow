import { DBClient } from '@/lib/insforge/server'
import ProductsClient from './ProductsClient'
import type { Product } from '@/lib/insforge/schema'

const db = new DBClient()

export default async function AdminProductsPage() {
  const { data: products } = await db
    .from('products')
    .select('*')
  
  return <ProductsClient initialProducts={(products as unknown as Product[]) || []} />
}
