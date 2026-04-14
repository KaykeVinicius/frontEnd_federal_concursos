"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"

// ─── Requisitos de senha forte ────────────────────────────
const REQUIREMENTS = [
  { id: "len",     label: "Mínimo 8 caracteres",       test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "Ao menos uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "Ao menos uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { id: "number",  label: "Ao menos um número",         test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "Ao menos um caractere especial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function CriarSenhaInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [nomeAluno, setNomeAluno] = useState("")
  const [validating, setValidating] = useState(true)
  const [tokenInvalido, setTokenInvalido] = useState(false)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [sucesso, setSucesso] = useState(false)

  // Valida token ao montar
  useEffect(() => {
    if (!token) { setTokenInvalido(true); setValidating(false); return }

    fetch(`${BASE_URL}/auth/setup_password/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        setNomeAluno(data.name)
      })
      .catch(() => setTokenInvalido(true))
      .finally(() => setValidating(false))
  }, [token])

  const allMet = REQUIREMENTS.every((r) => r.test(password))
  const passwordsMatch = password === confirm && confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allMet || !passwordsMatch) return
    setSaving(true); setError("")

    try {
      const res = await fetch(`${BASE_URL}/auth/setup_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, password_confirmation: confirm }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao salvar senha."); return }
      setSucesso(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  // ─── Loading ───────────────────────────────────────────
  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ─── Token inválido ────────────────────────────────────
  if (tokenInvalido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-lg font-bold text-zinc-100">Link inválido ou expirado</h1>
          <p className="text-sm text-zinc-400">
            Este link de criação de senha não é mais válido.<br />
            Entre em contato com a Federal Cursos para receber um novo link.
          </p>
        </div>
      </div>
    )
  }

  // ─── Sucesso ───────────────────────────────────────────
  if (sucesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="text-lg font-bold text-zinc-100">Senha criada com sucesso!</h1>
          <p className="text-sm text-zinc-400">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  // ─── Formulário ────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Criar senha de acesso</h1>
          {nomeAluno && (
            <p className="text-sm text-zinc-400">
              Olá, <span className="font-semibold text-zinc-200">{nomeAluno}</span>! Defina sua senha para acessar o portal.
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Senha */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="Digite sua senha"
                  className="pl-9 pr-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  disabled={saving}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos de senha */}
            {password.length > 0 && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-3 space-y-1.5">
                {REQUIREMENTS.map((req) => {
                  const ok = req.test(password)
                  return (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                      {ok
                        ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        : <XCircle className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      }
                      <span className={ok ? "text-green-400" : "text-zinc-500"}>{req.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError("") }}
                  placeholder="Repita a senha"
                  className="pl-9 pr-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  disabled={saving}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm.length > 0 && (
                <p className={`text-xs ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                  {passwordsMatch ? "✓ Senhas coincidem" : "As senhas não coincidem"}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !allMet || !passwordsMatch}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar senha e acessar o portal
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Este link é válido por 7 dias a partir do recebimento do e-mail.
        </p>
      </div>
    </div>
  )
}

export default function CriarSenhaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CriarSenhaInner />
    </Suspense>
  )
}
