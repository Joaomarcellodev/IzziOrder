'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Erro capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 text-center space-y-6">

        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold shadow-sm">
          !
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">
          Algo deu errado
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <p className="text-red-500 text-xs text-left font-mono p-2 bg-red-50 rounded">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Tentar novamente
          </button>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/auth/orders')
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}   