import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Rotas que não precisam de autenticação
  const isPublicRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/sign-up') || 
    pathname.startsWith('/reset-password') || 
    pathname.startsWith('/error')

  // Se for uma rota pública, não chamamos getUser() para evitar o erro de "Session Missing" no log
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Se NÃO for rota pública, aí sim validamos o usuário
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Redireciona se não houver usuário logado em rotas protegidas
  if (!user || error) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}