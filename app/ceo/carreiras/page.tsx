"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { mockCareers, Career } from "@/lib/mock-data"

export default function CeoCarreirasPage() {
  const [careers, setCareers] = useState<Career[]>(mockCareers)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const stats = useMemo(() => ({
    total: careers.length,
  }), [careers])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setCareers((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        name,
        description,
        created_at: new Date().toISOString().slice(0, 10),
      },
    ])
    setName("")
    setDescription("")
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carreiras</h1>
          <p className="text-muted-foreground">CEO cadastra carreiras e mantém a lista atualizada.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total de Carreiras</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <form className="space-y-3" onSubmit={handleAdd}>
              <Input placeholder="Nome da carreira" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
              <Button type="submit">Criar Carreira</Button>
            </form>
          </Card>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Criado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {careers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell>{career.name}</TableCell>
                  <TableCell>{career.description}</TableCell>
                  <TableCell>{career.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}