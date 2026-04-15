"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get("token") ?? ""

  const [userName, setUserName]   = useState("")
  const [password, setPassword]   = useState("")
  const [confirm,  setConfirm ]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [loading,  setLoading ]   = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [success,  setSuccess ]   = useState(false)
  const [error,    setError   ]   = useState("")

  useEffect(() => {
    if (!token) { setValidating(false); return }
    api.auth.validateResetToken(token)
      .then((data) => { setUserName(data.name); setTokenValid(true) })
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false))
  }, [token])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError("")

    if (password.length < 8)                { setError("A senha deve ter pelo menos 8 caracteres."); return }
    if (!/[A-Z]/.test(password))            { setError("A senha deve conter ao menos uma letra maiúscula."); return }
    if (!/[a-z]/.test(password))            { setError("A senha deve conter ao menos uma letra minúscula."); return }
    if (!/[0-9]/.test(password))            { setError("A senha deve conter ao menos um número."); return }
    if (!/[^A-Za-z0-9]/.test(password))    { setError("A senha deve conter ao menos um caractere especial."); return }
    if (password !== confirm)               { setError("As senhas não coincidem."); return }

    setLoading(true)
    try {
      await api.auth.resetPassword(token, password, confirm)
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="pointer-events-none absolute inset-0 bg-black/60" />

      <div className="pointer-events-none absolute left-0 top-0 z-20 h-1 w-full bg-primary" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/federal_cursos_sem_fundo.png"
            alt="Federal Cursos"
            width={160}
            height={64}
            style={{ width: "auto", height: "auto", maxWidth: "160px" }}
            priority
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-md">
          {validating ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-400">Validando link...</p>
            </div>
          ) : !tokenValid ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Link inválido ou expirado</h2>
              <p className="text-sm text-gray-400">Solicite um novo link de redefinição na tela de login.</p>
              <button onClick={() => router.push("/login")}
                className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-90">
                Voltar ao login
              </button>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Senha redefinida!</h2>
              <p className="text-sm text-gray-400">Sua nova senha foi salva. Redirecionando para o login...</p>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">Nova senha</h2>
                {userName && (
                  <p className="mt-1 text-sm text-gray-400">Olá, <span className="text-white font-semibold">{userName}</span></p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="password" className="mb-1 block text-xs font-semibold text-gray-300">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-white/20 bg-white/10 pl-10 pr-10 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:ring-offset-0"
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200" tabIndex={-1}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm" className="mb-1 block text-xs font-semibold text-gray-300">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirm"
                      type={showConf ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-11 border-white/20 bg-white/10 pl-10 pr-10 text-white placeholder:text-gray-500 focus-visible:ring-primary focus-visible:ring-offset-0"
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200" tabIndex={-1}>
                      {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  A senha deve ter ao menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.
                </p>

                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-red-500/15 border border-red-500/30 px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : "Redefinir senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
