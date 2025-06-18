"use client"

import { Power } from "lucide-react"

interface PowerButtonProps {
  onClick: () => void
  small?: boolean
}

export function PowerButton({ onClick, small = false }: PowerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative 
        ${small ? "w-8 h-8" : "w-16 h-16"} 
        rounded-full 
        bg-gradient-to-br from-gray-800 to-gray-900 
        flex items-center justify-center 
        shadow-lg 
        border-2 border-green-500/50
        hover:border-green-400
        transition-all
        group
      `}
    >
      <Power size={small ? 16 : 24} className="text-green-500 group-hover:text-green-400 transition-colors" />
      <span
        className={`
        absolute inset-0 rounded-full 
        bg-green-500/10 
        group-hover:bg-green-500/20 
        animate-pulse
      `}
      ></span>
    </button>
  )
}
