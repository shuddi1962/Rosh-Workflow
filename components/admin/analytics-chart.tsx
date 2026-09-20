"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface AnalyticsChartProps {
  data: Array<Record<string, unknown>>
  type?: "bar" | "line"
  xKey?: string
  yKeys?: string[]
  height?: number
  colors?: string[]
}

const defaultColors = ["#1A56DB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"]

export function AnalyticsChart({ data, type = "bar", xKey = "date", yKeys = ["value"], height = 300, colors = defaultColors }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "bar" ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey={xKey} tick={{ fill: "#8B9CC8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#8B9CC8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0E1220", border: "1px solid rgba(255,255,255,0.11)", borderRadius: "8px" }}
            labelStyle={{ color: "#F0F4FF" }}
          />
          {yKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey={xKey} tick={{ fill: "#8B9CC8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#8B9CC8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0E1220", border: "1px solid rgba(255,255,255,0.11)", borderRadius: "8px" }}
            labelStyle={{ color: "#F0F4FF" }}
          />
          {yKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  )
}
