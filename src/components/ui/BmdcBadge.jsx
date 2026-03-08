import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * BmdcBadge — "Verified BMDC Doctor" trust badge.
 * Shows a green checkmark with an animated tooltip on hover.
 *
 * Usage:
 *   <BmdcBadge />                     // default (Bengali label visible)
 *   <BmdcBadge showLabel={false} />   // icon-only with tooltip
 *   <BmdcBadge lang="en" />           // English tooltip
 *   <BmdcBadge size="lg" />           // large variant
 */
export default function BmdcBadge({ showLabel = true, lang = 'bn', size = 'md', className = '' }) {
    const [hovered, setHovered] = useState(false);

    const sizes = {
        sm: { icon: 'w-3.5 h-3.5', text: 'text-xs', gap: 'gap-1', padding: 'px-1.5 py-0.5' },
        md: { icon: 'w-4 h-4',     text: 'text-xs', gap: 'gap-1.5', padding: 'px-2 py-1' },
        lg: { icon: 'w-5 h-5',     text: 'text-sm', gap: 'gap-2',   padding: 'px-3 py-1.5' },
    };
    const s = sizes[size] || sizes.md;

    const tooltipText = lang === 'en'
        ? 'Verified by BMDC (Bangladesh Medical & Dental Council). This doctor\'s credentials have been confirmed.'
        : 'BMDC (বাংলাদেশ মেডিকেল ও ডেন্টাল কাউন্সিল) কর্তৃক যাচাইকৃত। এই ডাক্তারের সনদপত্র নিশ্চিত করা হয়েছে।';

    const label = lang === 'en' ? 'BMDC Verified' : 'BMDC যাচাইকৃত';

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Badge pill */}
            <div
                className={`
                    inline-flex items-center ${s.gap} ${s.padding} rounded-full
                    bg-emerald-50 border border-emerald-300
                    select-none cursor-default
                    transition-all duration-200
                    ${hovered ? 'bg-emerald-100 shadow-md shadow-emerald-100' : ''}
                `}
                role="img"
                aria-label={label}
            >
                <CheckCircle2 className={`${s.icon} text-emerald-600 fill-emerald-100`} strokeWidth={2.5} />
                {showLabel && (
                    <span className={`${s.text} font-semibold text-emerald-700 whitespace-nowrap`}>
                        {label}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            {hovered && (
                <div
                    className="
                        absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                        w-64 p-3 rounded-xl shadow-xl
                        bg-gray-900 text-white text-xs leading-relaxed
                        pointer-events-none
                        animate-in fade-in zoom-in-95 duration-150
                    "
                    role="tooltip"
                >
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p>{tooltipText}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}