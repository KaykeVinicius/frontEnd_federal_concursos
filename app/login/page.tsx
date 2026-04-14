"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircle, Landmark, Calculator, Scale, BookOpen, Trophy, GraduationCap, Target, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { api, setToken } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sessionMsg, setSessionMsg] = useState("")

  useEffect(() => {
    const msg = sessionStorage.getItem("session_msg")
    if (msg) { setSessionMsg(msg); sessionStorage.removeItem("session_msg") }
  }, [])

  async function handleLogin(e: { preventDefault(): void }) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Preencha todos os campos.")
      return
    }

    setLoading(true)

    try {
      const { token, user } = await api.auth.login(email, password)

      setToken(token)
      localStorage.setItem("currentUser", JSON.stringify(user))

      switch (user.role) {
        case "ceo":
          router.push("/ceo")
          break
        case "assistente_comercial":
          router.push("/assistente")
          break
        case "equipe_pedagogica":
          router.push("/pedagogica")
          break
        case "professor":
          router.push("/professor")
          break
        case "aluno":
          router.push("/aluno")
          break
        case "diretor":
          router.push("/ceo")
          break
        default:
          router.push("/ceo")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao conectar com o servidor."
      setError(message)
      setLoading(false)
    }
  }

  const phrases = [
    { text: "Concursos Públicos.", icon: Landmark },
    { text: "Conselho Federal de Contabilidade.", icon: Calculator },
    { text: "Ordem dos Advogados do Brasil.", icon: Scale },
    { text: "Aqui você estuda de verdade.", icon: BookOpen },
    { text: "Sua aprovação começa aqui.", icon: Trophy },
    { text: "Estude com quem entende de concursos.", icon: GraduationCap },
    { text: "Transformamos dedicação em aprovação.", icon: Target },
    { text: "Prepare-se. A vaga é sua.", icon: CheckCircle },
  ]
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
        setPhraseVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const whatsappNumber = "556993697213"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Tiger Background - Full Page with more opacity */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/85 z-10" />
        <Image
          src="/images/tigre_redimensionado.png"
          alt=""
          fill
          className="object-cover object-center select-none opacity-20"
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Decorative top bar */}
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-1 w-full bg-primary" />

      {/* Logo - centralizada no mobile, esquerda no desktop */}
      <div className="absolute left-0 right-0 top-5 z-20 flex justify-center lg:left-6 lg:right-auto lg:top-6 lg:block">
        <Image
          src="/images/federal_cursos_sem_fundo.png"
          alt="Federal Cursos"
          width={140}
          height={70}
          className="rounded-lg"
          style={{ width: "auto", height: "auto", maxWidth: "140px" }}
          priority
        />
      </div>

      {/* WhatsApp Button - Bottom Right Corner */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-20 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Fale conosco
        </span>
      </a>

      {/* Content - Layout 2 Colunas */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Section - Welcome Message */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 py-12">
          <div className="max-w-xl w-full text-center">
            <h1 className="font-extrabold text-primary animate-text-glow mb-6">
              <span className="block text-5xl md:text-6xl">Seja bem-vindo</span>
              <span className="block text-5xl md:text-6xl">ao</span>
              <span className="block text-4xl md:text-5xl whitespace-nowrap">Federal Cursos.</span>
            </h1>
            <div
              className="flex items-center justify-center gap-3 transition-all duration-500 min-h-[3rem]"
              style={{ opacity: phraseVisible ? 1 : 0, transform: phraseVisible ? "translateY(0)" : "translateY(8px)" }}
            >
              {(() => {
                const phrase = phrases[phraseIndex]
                const Icon = phrase.icon
                return (
                  <>
                    <Icon className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-xl text-gray-200 font-medium">{phrase.text}</span>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <div className="flex w-full items-center justify-center lg:w-1/2 px-3 py-16 sm:px-4 sm:py-12">
          <div className="w-full max-w-md">
            {/* Mobile Welcome Text */}
            <div className="mb-6 text-center lg:hidden">
              <h1 className="font-extrabold text-primary animate-text-glow leading-tight">
                <span className="block text-2xl">Seja bem-vindo ao</span>
                <span className="block text-3xl whitespace-nowrap">Federal Cursos.</span>
              </h1>
            </div>

            {/* Login Card */}
            <Card className="relative overflow-hidden border-white/10 bg-black/60 backdrop-blur-md shadow-2xl">
              <CardContent className="relative z-10 p-5 sm:p-8">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    Acesso ao Sistema
                  </h2>
                  <p className="mt-2 text-sm text-gray-300">
                    Entre com suas credenciais para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border-white/20 bg-white/10 pl-10 text-white placeholder:text-gray-400 focus-visible:ring-primary focus-visible:ring-offset-0"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 border-white/20 bg-white/10 pl-10 pr-10 text-white placeholder:text-gray-400 focus-visible:ring-primary focus-visible:ring-offset-0"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-200"
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

                  {sessionMsg && (
                    <p className="rounded-md bg-orange-500/20 px-3 py-2 text-sm text-orange-300 flex items-center gap-2">
                      <span>⚠</span> {sessionMsg}
                    </p>
                  )}
                  {error && (
                    <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="mt-2 h-11 w-full bg-primary text-white font-semibold hover:bg-primary/90 transition-all duration-200"
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

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    className="text-xs text-primary transition-colors hover:text-primary/80"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-center space-y-1">
                  <p className="text-sm font-semibold animate-pulse text-primary drop-shadow-[0_0_8px_rgba(232,73,29,0.6)]">
                    Ainda não tem acesso?
                  </p>
                  <p className="text-xs text-gray-500">
                    O acesso é liberado após a matrícula. Fale com nossa equipe pelo WhatsApp.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}