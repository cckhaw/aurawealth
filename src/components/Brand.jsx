import { Sparkles } from 'lucide-react'

export function LogoMark({ size = 40 }) {
  return (
    <div
      className="rounded-[12px] flex items-center justify-center text-white shrink-0 shadow-[0_6px_16px_rgba(88,86,214,0.35)]"
      style={{ width: size, height: size, background: 'linear-gradient(135deg,#007AFF,#5856D6)' }}
    >
      <Sparkles size={size * 0.5} />
    </div>
  )
}
