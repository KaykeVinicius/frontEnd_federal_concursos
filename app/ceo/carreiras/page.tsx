"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { mockCareers, Career } from "@/lib/mock-data"
import {
  Briefcase,
  Plus,
  Search,
  Settings,
  Filter,
  Calendar,
  Edit3,
  Trash2,
} from "lucide-react"

export default function CeoCarreirasPage() {
  const [careers, setCareers] = useState<Career[]>(mockCareers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states for create modal
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")

  const stats = useMemo(() => ({
    total: careers.length,
  }), [careers])

  const handleAdd = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!createName || !createDescription) return

    setCareers((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        name: createName,
        description: createDescription,
        created_at: new Date().toISOString().slice(0, 10),
      },
    ])
    resetCreateForm()
    setIsCreateModalOpen(false)
  }

  const resetCreateForm = () => {
    setCreateName("")
    setCreateDescription("")
  }

  const deleteCareer = (careerId: number) => {
    setCareers((prev) => prev.filter((c) => c.id !== careerId))
  }

  // Filter and search careers (with alphabetical sorting)
  const filteredCareers = useMemo(() => {
    return careers
      .filter((career) => {
        const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             career.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical sorting
  }, [careers, searchTerm])

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e8491d] to-[#f97316] p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-white/20 p-3">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Carreiras</h1>
                <p className="text-orange-100">Cadastre e gerencie as carreiras disponíveis no sistema</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Statistics and Create */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats Card */}
          <Card className="border-blue-500/40 bg-gradient-to-b from-blue-700/30 to-slate-900/50 p-6 text-white">
            <p className="text-sm uppercase tracking-wide text-white/70 mb-2">Total de Carreiras</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </Card>

          {/* Create Button Area */}
          <div className="lg:col-span-2">
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="w-full h-full bg-gradient-to-r from-[#e8491d] to-[#f97316] hover:shadow-lg transition-all duration-300 py-8"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="text-lg font-semibold">Criar Nova Carreira</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar Carreiras</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </Card>

        {/* Careers List */}
        <Card className="overflow-hidden">
          <div className="border-b bg-gray-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Lista de Carreiras ({filteredCareers.length})
              </h3>
              <div className="text-sm text-muted-foreground">
                Ordenado alfabeticamente
              </div>
            </div>
          </div>

          {filteredCareers.length > 0 ? (
            <div className="divide-y">
              {filteredCareers.map((career) => (
                <div key={career.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-lg bg-blue-100 p-2 flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-1">{career.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{career.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground ml-11">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Criado em {career.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-100/50 hover:text-blue-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCareer(career.id)}
                      className="hover:bg-red-100/50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma carreira encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar os termos de busca"
                  : "Comece criando sua primeira carreira"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#e8491d] hover:bg-[#d13a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Carreira
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Create Career Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-xl">
            <div className="bg-gradient-to-r from-[#e8491d] to-[#f97316] p-6 rounded-t-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  Criar Nova Carreira
                </DialogTitle>
                <DialogDescription className="text-orange-100">
                  Adicione uma nova carreira ao sistema
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-name" className="text-sm font-medium mb-2 block">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Nome da Carreira *
                  </Label>
                  <Input
                    id="create-name"
                    placeholder="Ex: Engenharia de Software"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="create-description" className="text-sm font-medium mb-2 block">
                    <Edit3 className="h-4 w-4 inline mr-2" />
                    Descrição *
                  </Label>
                  <Input
                    id="create-description"
                    placeholder="Descreva a carreira e suas responsabilidades"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    required
                    className="border-gray-200 focus:border-[#e8491d] focus:ring-[#e8491d] transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#e8491d] hover:bg-[#d13a0f] text-white"
                >
                  Criar Carreira
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}