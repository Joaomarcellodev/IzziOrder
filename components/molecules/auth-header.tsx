interface AuthHeaderProps {
  title?: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8 space-y-2 relative z-10">
      <div className="mx-auto flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
        <img
          className="w-24 h-24 drop-shadow-sm"
          src="/android-chrome-512x512.png" 
          alt="IzziOrder Logo"
        />
      </div>
      <h1 className="text-5xl font-black tracking-tight">
        <span className="text-[#007BFF]">izzi</span>
        <span className="text-[#FD7E14]">Order</span>
      </h1>
      <p className="text-muted-foreground font-medium italic">
        {subtitle}
      </p>
    </div>
  )
}