import React, { useRef, useEffect } from 'react';

type AutosizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutosizeTextarea: React.FC<AutosizeTextareaProps> = (props) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Temporarily reset height to get the correct scrollHeight
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]); // Re-run when the value changes

    return (
        <textarea
            {...props}
            ref={textareaRef}
            rows={1} // Start with a single row
            style={{
                ...props.style,
                overflow: 'hidden', // Hide the scrollbar
            }}
        />
    );
};
