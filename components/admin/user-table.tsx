"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Power, PowerOff } from "lucide-react"

interface UserTableProps {
  onToggleUser?: (userId: string) => void
}

export function UserTable({ onToggleUser }: UserTableProps) {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data.users || [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const handleToggle = async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/admin/users/${userId}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      )
      onToggleUser?.(userId)
    } catch (error) {
      console.error("Error toggling user:", error)
    }
  }

  if (loading) return <div className="text-text-muted text-sm">Loading users...</div>

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex items-center gap-2">
        <Users className="w-5 h-5 text-accent-primary-glow" />
        <h3 className="font-clash text-lg font-semibold text-text-primary">Team Members</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id as string}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(user.full_name as string)?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-text-primary text-sm font-medium">{user.full_name as string}</span>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary text-sm">{user.email as string}</TableCell>
              <TableCell>
                <Badge status={user.role === "admin" ? "failed" : "scheduled"}>
                  {user.role as string}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge status={user.is_active ? "live" : "draft"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-text-muted text-sm">
                {user.last_login ? new Date(user.last_login as string).toLocaleDateString() : "Never"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(user.id as string)}
                  className={user.is_active ? "text-accent-red" : "text-accent-emerald"}
                >
                  {user.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-8 text-text-muted text-sm">No users found</div>
      )}
    </div>
  )
}
