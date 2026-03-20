"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { mockSystemUsers } from "@/lib/mock-data"

interface NewUserForm {
  name: string
  email: string
  cpf: string
  password: string
  role: "ceo" | "assistente_comercial" | "equipe_pedagogica" | "professor" | "aluno"
  commission_percent?: number
}

export default function CeoUsuariosPage() {
  const [users, setUsers] = useState(mockSystemUsers)
  const [form, setForm] = useState<NewUserForm>({
    name: "",
    email: "",
    cpf: "",
    password: "",
    role: "aluno",
    commission_percent: 10,
  })

  const [search, setSearch] = useState("")

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
  }, [search, users])

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.email || !form.cpf || !form.password) return

    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1
    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        password: form.password,
        role: form.role,
        commission_percent: form.role === "assistente_comercial" ? form.commission_percent : undefined,
        active: true,
      },
    ])

    setForm({ name: "", email: "", cpf: "", password: "", role: "aluno", commission_percent: 10 })
  }

  function toggleActive(userId: number) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)))
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Usuários</h1>
          <p className="text-muted-foreground">CEO cria e gerencia perfis de usuário e permissões.</p>
        </div>

        <Card className="p-4">
          <form onSubmit={handleCreateUser} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            <Input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as NewUserForm["role"] })}>
              <SelectTrigger>
                <SelectValue>{form.role}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceo">CEO</SelectItem>
                <SelectItem value="assistente_comercial">Assistente Comercial</SelectItem>
                <SelectItem value="equipe_pedagogica">Equipe Pedagógica</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
            {form.role === "assistente_comercial" && (
              <Input
                placeholder="% Comissão Assistente"
                type="number"
                min={0}
                max={100}
                value={form.commission_percent ?? 0}
                onChange={(e) => setForm({ ...form, commission_percent: Number(e.target.value) })}
              />
            )}
            <Button type="submit" className="w-full">Criar Usuário</Button>
          </form>
        </Card>

        <div className="flex items-center justify-between">
          <Input placeholder="Buscar usuário" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <span className="text-sm text-muted-foreground">{filteredUsers.length} usuários encontrados</span>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Comissão</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.cpf}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.role === "assistente_comercial" ? `${user.commission_percent ?? 0}%` : "—"}</TableCell>
                  <TableCell>{user.active ? "Ativo" : "Inativo"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(user.id)}>
                      {user.active ? "Desativar" : "Ativar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
