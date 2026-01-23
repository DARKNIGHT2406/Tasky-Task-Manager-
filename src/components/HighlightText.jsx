'use client';

export default function HighlightText({ text, highlight, className = '' }) {
    if (!highlight || !highlight.trim()) {
        return <span className={className}>{text}</span>;
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span className={className}>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} style={{ backgroundColor: 'yellow', color: 'black', borderRadius: '2px', padding: '0 2px' }}>
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
}
