import React from 'react';

/**
 * 3D floating icon with CSS-based depth, float animation, and hover tilt.
 * Pure CSS 3D — no heavy 3D engine, smooth on mobile.
 *
 * props:
 *  - Icon: lucide icon component
 *  - color: tailwind bg/text classes e.g. "bg-emerald-100 text-emerald-600"
 *  - size: 'sm' | 'md' | 'lg'  (default md)
 *  - float: boolean (default true) — gentle floating animation
 *  - delay: ms stagger for float animation
 */
const SIZES = {
    sm: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    md: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
    lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
};

export default function FloatingIcon({ Icon, color = 'bg-emerald-100 text-emerald-600', size = 'md', float = true, delay = 0, className = '' }) {
    const s = SIZES[size] || SIZES.md;
    return (
        <div
            className={`floating-icon-3d ${s.box} ${color} ${className}`}
            style={{ animationDelay: `${delay}ms` }}
            data-float={float ? 'on' : 'off'}
        >
            <div className="floating-icon-face">
                {Icon && <Icon className={`${s.icon} floating-icon-svg`} />}
            </div>
            <div className="floating-icon-glow" />
        </div>
    );
}