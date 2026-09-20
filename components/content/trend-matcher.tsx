"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, ArrowRight, Loader2 } from "lucide-react"

interface Trend {
  id: string
  keyword: string
  description: string
  momentum_score: number
  division_relevance: string
  matched_products: string[]
  source: string
}

interface Product {
  id: string
  name: string
  division: string
}

export function TrendMatcher() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [matches, setMatches] = useState<Array<{ trend: Trend; product: Product; score: number }>>([])
  const [loading, setLoading] = useState(false)

  const fetchTrends = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/trends", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setTrends(data.trends || [])
    } catch (error) {
      console.error("Error fetching trends:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const matchTrendToProduct = async (trendId: string, productId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/trends/match-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trend_id: trendId, product_id: productId }),
      })
      const data = await res.json()
      if (data.match) {
        const trend = trends.find((t) => t.id === trendId)!
        const product = products.find((p) => p.id === productId)!
        setMatches((prev) => [...prev, { trend, product, score: data.relevance_score }])
      }
    } catch (error) {
      console.error("Error matching:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-primary" />
          Trend-to-Product Matcher
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTrends} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh Trends"}
          </Button>
          <Button variant="outline" onClick={fetchProducts}>
            <Package className="w-4 h-4 mr-2" />
            Load Products
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Trending Topics</h4>
          <div className="space-y-2">
            {trends.map((trend) => (
              <div key={trend.id} className="bg-white border border-border-subtle rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{trend.keyword}</p>
                    <p className="text-text-muted text-xs mt-1">{trend.description}</p>
                  </div>
                  <Badge status={trend.momentum_score > 80 ? "hot" : trend.momentum_score > 50 ? "warm" : "cold"}>
                    {trend.momentum_score.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-text-muted">{trend.source}</span>
                  <span className="text-xs text-accent-primary">{trend.division_relevance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Products</h4>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-border-subtle rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-text-primary text-sm font-medium">{product.name}</p>
                  <Badge status={product.division === "marine" ? "scheduled" : "live"}>
                    {product.division}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Matches</h4>
          <div className="space-y-2">
            {matches.map((match, i) => (
              <div key={i} className="bg-white border border-border-subtle rounded-lg p-3 flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-primary">{match.trend.keyword}</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <Package className="w-4 h-4 text-accent-emerald" />
                <span className="text-sm text-text-primary">{match.product.name}</span>
                <Badge status="live">Score: {match.score}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
