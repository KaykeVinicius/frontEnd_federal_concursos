"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function PagamentoSucesso() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.push("/"), 8000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <CheckCircle className="h-20 w-20 text-green-400" />
        <h1 className="text-3xl font-bold">Pagamento confirmado!</h1>
        <p className="text-gray-300 text-lg">
          Seu pagamento foi processado com sucesso. Em breve você receberá um e-mail com os dados de acesso ao curso.
        </p>
        <p className="text-sm text-gray-500">
          Você será redirecionado para a página inicial em alguns segundos...
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-6 py-3 bg-[#e8491d] hover:bg-[#d13a0f] rounded-lg font-semibold transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  )
}
