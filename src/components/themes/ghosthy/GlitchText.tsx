"use client"

import { useState, useEffect } from "react"

interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text)
/* 
  useEffect(() => {
    // Set initial text
    setDisplayText(text)

    // Create glitch effect at random intervals
    const glitchInterval = setInterval(
      () => {
        if (Math.random() > 0.7) {
          // Create glitched version of text
          const glitchText = text
            .split("")
            .map((char) => {
              if (Math.random() > 0.8) {
                const glitchChars = '!@#$%^&*()_+{}|:"<>?'
                return glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
              return char
            })
            .join("")

          setDisplayText(glitchText)

          // Reset back to original text after a short delay
          setTimeout(
            () => {
              setDisplayText(text)
            },
            160,
          )
        }
      },
      8000 ,
    )

    return () => clearInterval(glitchInterval)
  }, [text])
 */
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{displayText}</span>
      <span className="absolute top-0 left-0 text-red-500 opacity-30 transform translate-x-[1px] translate-y-[1px] z-0">
        {displayText}
      </span>
      <span className="absolute top-0 left-0 text-blue-500 opacity-30 transform translate-x-[-1px] translate-y-[-1px] z-0">
        {displayText}
      </span>
    </span>
  )
}
