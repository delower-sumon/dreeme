import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: 28,  // 28px for small (w-7 h-7)
        md: 36,  // 36px for medium (w-9 h-9) - Header
        lg: 64   // 64px for large (w-16 h-16) - Auth page
    }

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg'
    }

    const pixelSize = sizes[size]

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Actual Logo */}
            <Image
                src="/logo.svg"
                alt="dreeme Logo"
                width={pixelSize}
                height={pixelSize}
                className="flex-shrink-0"
                priority
            />

            {showText && (
                <div className="flex flex-col leading-tight">
                    <span className={`logo-main ${textSizes[size]} font-semibold tracking-tight text-slate-50`}>
                        dreeme
                    </span>
                    <span className="hero-subtitle logo-subtitle text-[11px] text-slate-200/90">
                        Dream journal & oracle
                    </span>
                </div>
            )}
        </div>
    )
}
