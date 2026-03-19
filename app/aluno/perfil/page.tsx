"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react"
import { fakeApiCall, fakeApiPost } from "@/lib/api"
import { mockStudents, type SystemUser, type Student } from "@/lib/mock-data"

export default function AlunoPerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    cpf: "",
    address: "",
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await fakeApiCall(null)

      const stored = localStorage.getItem("currentUser")
      if (stored) {
        const user: SystemUser = JSON.parse(stored)
        if (user.student_id) {
          const st = mockStudents.find((s) => s.id === user.student_id)
          if (st) {
            setStudent(st)
            setForm({
              name: st.name,
              email: st.email,
              whatsapp: st.whatsapp,
              cpf: st.cpf,
              address: st.address,
            })
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSave() {
    setSaving(true)
    await fakeApiPost(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Visualize e atualize suas informacoes pessoais
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info Card */}
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
                <span className="font-medium text-green-600">Ativo</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium text-foreground">
                  {student?.internal ? "Aluno Interno" : "Aluno Externo"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Desde:</span>
                <span className="font-medium text-foreground">{student?.created_at}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp" className="mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cpf" className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  disabled
                  className="bg-muted/50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  CPF nao pode ser alterado
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Endereco Completo
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              {saved && (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Alteracoes salvas!
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alteracoes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
