import { AuthBackground } from "@/components/atoms/auth-background"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}