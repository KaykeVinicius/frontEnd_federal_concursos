"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Loader2, Trash2 } from "lucide-react"
import { api, type ApiCareer } from "@/lib/api"

export default function CarreirasPage() {
  const [careers, setCareers] = useState<ApiCareer[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.careers.list()
      .then(setCareers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!name.trim()) { setError("Nome obrigatório."); return }
    setSaving(true); setError("")
    try {
      const created = await api.careers.create({ name: name.trim(), description: description.trim() })
      setCareers((prev) => [created, ...prev])
      setName("")
      setDescription("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar carreira")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.careers.delete(id)
      setCareers((prev) => prev.filter((c) => c.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir")
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carreiras</h1>
          <p className="text-muted-foreground">Cadastre e gerencie as carreiras disponíveis.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total de Carreiras</p>
            <p className="text-2xl font-bold">{careers.length}</p>
          </Card>
          <Card className="p-4">
            <form className="space-y-3" onSubmit={handleAdd}>
              <Input placeholder="Nome da carreira" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando...</> : "Criar Carreira"}
              </Button>
            </form>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {careers.map((career) => (
                  <TableRow key={career.id}>
                    <TableCell className="font-medium">{career.name}</TableCell>
                    <TableCell className="text-muted-foreground">{career.description}</TableCell>
                    <TableCell className="text-muted-foreground">{career.created_at?.slice(0, 10)}</TableCell>
                    <TableCell>
                      <button onClick={() => handleDelete(career.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {careers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Nenhuma carreira cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
