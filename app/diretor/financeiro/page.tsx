"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DollarSign, TrendingUp, TrendingDown, Search, Loader2, CreditCard, Banknote, QrCode } from "lucide-react"
import { fakeApiCall } from "@/lib/api"
import {
  mockEnrollments,
  mockStudents,
  mockCourses,
  getStudentById,
  getCourseById,
  type Enrollment,
} from "@/lib/mock-data"

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  credito_vista: "Credito a Vista",
  credito_parcelado: "Credito Parcelado",
  boleto: "Boleto",
  dinheiro: "Dinheiro",
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
  pix: <QrCode className="h-4 w-4 text-green-600" />,
  credito_vista: <CreditCard className="h-4 w-4 text-blue-600" />,
  credito_parcelado: <CreditCard className="h-4 w-4 text-purple-600" />,
  boleto: <Banknote className="h-4 w-4 text-orange-600" />,
  dinheiro: <DollarSign className="h-4 w-4 text-green-700" />,
}

const statusLabels: Record<string, string> = {
  active: "Ativa",
  completed: "Concluida",
  cancelled: "Cancelada",
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function FinanceiroPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      await fakeApiCall(mockEnrollments)
      setEnrollments(mockEnrollments)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = enrollments.filter((e) => {
    const student = getStudentById(e.student_id)
    const course = getCourseById(e.course_id)
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      student?.name.toLowerCase().includes(q) ||
      course?.title.toLowerCase().includes(q)
    const matchesStatus = filterStatus === "all" || e.status === filterStatus
    const matchesPayment = filterPayment === "all" || e.payment_method === filterPayment
    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalReceita = enrollments.reduce((acc, e) => acc + e.total_paid, 0)
  const receitaAtivas = enrollments
    .filter((e) => e.status === "active")
    .reduce((acc, e) => acc + e.total_paid, 0)
  const totalPix = enrollments
    .filter((e) => e.payment_method === "pix")
    .reduce((acc, e) => acc + e.total_paid, 0)
  const totalCredito = enrollments
    .filter((e) => e.payment_method === "credito_vista" || e.payment_method === "credito_parcelado")
    .reduce((acc, e) => acc + e.total_paid, 0)

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Financeiro</h1>
          <p className="text-muted-foreground">Visao geral de receitas e pagamentos</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matriculas Ativas</p>
                  <p className="text-xl font-bold text-blue-600">
                    R$ {receitaAtivas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recebido via PIX</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {totalPix.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recebido Cartao</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Transacoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno ou curso..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="completed">Concluidas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credito_vista">Credito Vista</SelectItem>
                  <SelectItem value="credito_parcelado">Credito Parcelado</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((enrollment) => {
                      const student = getStudentById(enrollment.student_id)
                      const course = getCourseById(enrollment.course_id)
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {enrollment.created_at.split("-").reverse().join("/")}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-foreground">{student?.name}</p>
                            <p className="text-xs text-muted-foreground">{student?.email}</p>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {course?.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {paymentMethodIcons[enrollment.payment_method]}
                              <span className="text-sm">{paymentMethodLabels[enrollment.payment_method]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[enrollment.status]} variant="secondary">
                              {statusLabels[enrollment.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            R$ {enrollment.total_paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Nenhuma transacao encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Total */}
            {!loading && filtered.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} transacao(oes) encontrada(s)
                </p>
                <p className="text-lg font-bold text-foreground">
                  Total: R$ {filtered.reduce((acc, e) => acc + e.total_paid, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
