"use client"

import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"

export default function PagamentoCancelado() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <XCircle className="h-20 w-20 text-red-400" />
        <h1 className="text-3xl font-bold">Pagamento cancelado</h1>
        <p className="text-gray-300 text-lg">
          O pagamento foi cancelado. Nenhum valor foi cobrado. Se desejar, tente novamente.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-6 py-3 bg-[#e8491d] hover:bg-[#d13a0f] rounded-lg font-semibold transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
