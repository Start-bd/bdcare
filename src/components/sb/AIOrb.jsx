import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';

/**
 * Animated AI orb — glowing 3D-style orb that pulses to signal AI is active.
 * Clicking navigates to the AI Doctor page.
 *
 * props:
 *  - size: 'sm' (nav) | 'md' (inline) | 'lg' (hero)
 *  - asLink: boolean (default true) — wrap in Link to SBAIDoctor
 *  - label: optional tooltip text
 */
const SIZE_MAP = {
    sm: { w: 'w-9 h-9', core: 'w-3 h-3', ring: 'after:w-9 after:h-9' },
    md: { w: 'w-12 h-12', core: 'w-4 h-4', ring: 'after:w-12 after:h-12' },
    lg: { w: 'w-20 h-20', core: 'w-6 h-6', ring: 'after:w-20 after:h-20' },
};

export default function AIOrb({ size = 'md', asLink = true, label, isBn = true }) {
    const s = SIZE_MAP[size] || SIZE_MAP.md;
    const inner = (
        <div
            className={`ai-orb ${s.w} ${s.ring} relative flex items-center justify-center group`}
            role="img"
            aria-label={label || (isBn ? 'AI সহায়ক' : 'AI Assistant')}
        >
            <div className="ai-orb-core-wrap">
                <div className={`ai-orb-core ${s.core}`} />
            </div>
            <Sparkles className="ai-orb-sparkle" />
            <div className="ai-orb-shine" />
        </div>
    );

    if (!asLink) return inner;
    return (
        <Link to={createPageUrl('SBAIDoctor')} className="inline-flex" title={label || (isBn ? 'AI ডাক্তার' : 'AI Doctor')}>
            {inner}
        </Link>
    );
}