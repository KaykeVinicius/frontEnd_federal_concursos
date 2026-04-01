"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, FileText, Loader2, Save, CheckCircle } from "lucide-react"
import { api, type ApiStudent } from "@/lib/api"

export default function AlunoPerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [student, setStudent] = useState<ApiStudent | null>(null)
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", cpf: "" })

  useEffect(() => {
    api.aluno.dashboard()
      .then((data) => {
        const s = data.student
        setStudent(s)
        setForm({ name: s.name, email: s.email, whatsapp: s.whatsapp ?? "", cpf: s.cpf })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!student) return
    setSaving(true)
    try {
      const updated = await api.students.update(student.id, {
        name: form.name,
        whatsapp: form.whatsapp || undefined,
      })
      setStudent(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Erro ao salvar:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Visualize e atualize suas informações pessoais</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{student?.name}</h2>
            <p className="text-sm text-muted-foreground">{student?.email}</p>
            <div className="mt-4 w-full space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${student?.active ? "text-green-600" : "text-red-500"}`}>
                  {student?.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">CPF:</span>
                <span className="font-medium text-foreground">{student?.cpf}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Nome Completo
                </Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email
                </Label>
                <Input id="email" type="email" value={form.email} disabled className="bg-muted/50" />
                <p className="mt-1 text-xs text-muted-foreground">Email não pode ser alterado</p>
              </div>
              <div>
                <Label htmlFor="whatsapp" className="mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> WhatsApp
                </Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cpf" className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> CPF
                </Label>
                <Input id="cpf" value={form.cpf} disabled className="bg-muted/50" />
                <p className="mt-1 text-xs text-muted-foreground">CPF não pode ser alterado</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Save className="mr-2 h-4 w-4" />Salvar Alterações</>}
              </Button>
              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Salvo com sucesso!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
