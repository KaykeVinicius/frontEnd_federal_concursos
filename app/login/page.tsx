"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Lock, Mail, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { authenticateUser } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Preencha todos os campos.")
      return
    }

    setLoading(true)

    // Simula chamada API de login
    await new Promise((r) => setTimeout(r, 1000))

    const user = authenticateUser(email, password)

    if (user) {
      // Salva usuario no localStorage para demo
      localStorage.setItem("currentUser", JSON.stringify(user))

      // Redireciona baseado no tipo de usuario
      switch (user.role) {
        case "diretor":
          router.push("/diretor")
          break
        case "admin":
          router.push("/admin")
          break
        case "professor":
          router.push("/professor")
          break
        case "aluno":
          router.push("/aluno")
          break
        default:
          router.push("/admin")
      }
    } else {
      setError("Email ou senha invalidos.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a1a1a]">
      {/* Background logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <Image
          src="/images/logo.jpg"
          alt=""
          width={900}
          height={450}
          className="max-w-[90vw] select-none"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>

      {/* Decorative accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-primary" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-primary" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/logo.jpg"
            alt="Federal Cursos"
            width={320}
            height={160}
            className="rounded-lg"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>

        {/* Login Card */}
        <Card className="w-full border-[#333] bg-[#222222]">
          <CardContent className="p-6">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-[#f1f1f1]">
                Acesso ao Sistema
              </h1>
              <p className="mt-1 text-sm text-[#9ca3af]">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#d1d5db]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#444] bg-[#2a2a2a] pl-10 text-[#f1f1f1] placeholder:text-[#6b7280] focus-visible:ring-primary"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#d1d5db]">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#444] bg-[#2a2a2a] pl-10 pr-10 text-[#f1f1f1] placeholder:text-[#6b7280] focus-visible:ring-primary"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#d1d5db]"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar senha" : "Mostrar senha"}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-[#f87171]">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="mt-2 w-full bg-primary text-primary-foreground hover:bg-[#cc3f18]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-primary transition-colors hover:text-[#cc3f18]"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Credenciais de Teste */}
        <Card className="w-full border-[#333] bg-[#222222]/80">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-[#f1f1f1]">Credenciais de Teste</span>
            </div>
            <div className="space-y-2 text-xs text-[#9ca3af]">
              <div className="flex items-center justify-between rounded bg-[#2a2a2a] px-3 py-2">
                <div>
                  <span className="font-medium text-primary">Diretor:</span>
                  <span className="ml-2">diretor@federalcursos.com.br</span>
                </div>
                <span className="text-[#6b7280]">diretor123</span>
              </div>
              <div className="flex items-center justify-between rounded bg-[#2a2a2a] px-3 py-2">
                <div>
                  <span className="font-medium text-primary">Admin:</span>
                  <span className="ml-2">admin@federalcursos.com.br</span>
                </div>
                <span className="text-[#6b7280]">admin123</span>
              </div>
              <div className="flex items-center justify-between rounded bg-[#2a2a2a] px-3 py-2">
                <div>
                  <span className="font-medium text-primary">Professor:</span>
                  <span className="ml-2">professor@federalcursos.com.br</span>
                </div>
                <span className="text-[#6b7280]">prof123</span>
              </div>
              <div className="flex items-center justify-between rounded bg-[#2a2a2a] px-3 py-2">
                <div>
                  <span className="font-medium text-primary">Aluno:</span>
                  <span className="ml-2">aluno@federalcursos.com.br</span>
                </div>
                <span className="text-[#6b7280]">aluno123</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#6b7280]">
          Federal Cursos - Concursos Publicos, CFC e OAB
        </p>
      </div>
    </div>
  )
}
