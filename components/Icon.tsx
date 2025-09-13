import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const IconWrapper: React.FC<IconProps & { children: React.ReactNode }> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {children}
    </svg>
);

export const MagicIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621m-5.043.025a15.998 15.998 0 00-3.388-1.621m16.5 5.043a15.998 15.998 0 00-1.622-3.385m-5.043.025a15.998 15.998 0 01-1.622-3.385m3.388 1.622a15.998 15.998 0 011.622 3.385m3.388-1.622a15.998 15.998 0 003.388-1.622m-5.043.025a15.998 15.998 0 013.388-1.622m-5.043.025a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.621M4.5 12.75a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 0115 0" />
    </IconWrapper>
);

// Fix: Replaced the backspace icon with a more intuitive eraser icon for "Remove Background" for better UX.
export const EraseIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props} viewBox="0 0 24 24" strokeWidth={1.5} fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21.267 3.033 14.3a1.5 1.5 0 0 1 0-2.121l9.192-9.192a1.5 1.5 0 0 1 2.121 0l7.067 7.067a1.5 1.5 0 0 1 0 2.121l-9.192 9.192a1.5 1.5 0 0 1-2.121 0zM10 21.267 18.2 13.067" />
    </IconWrapper>
);

// Fix: Corrected the PaintBrushIcon to display a paintbrush instead of a cog icon.
export const PaintBrushIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </IconWrapper>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </IconWrapper>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </IconWrapper>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </IconWrapper>
);

export const WandIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.12 2.24a1.125 1.125 0 01-1.008.744H5.385c-.65 0-1.18.53-1.18 1.18v2.24a1.125 1.125 0 01-.744 1.008l-2.24 1.12a1.125 1.125 0 010 2.016l2.24 1.12a1.125 1.125 0 01.744 1.008v2.24c0 .65.53 1.18 1.18 1.18h2.24a1.125 1.125 0 011.008.744l1.12 2.24a1.125 1.125 0 012.016 0l1.12-2.24a1.125 1.125 0 011.008-.744h2.24c.65 0 1.18-.53 1.18-1.18v-2.24a1.125 1.125 0 01.744-1.008l2.24-1.12a1.125 1.125 0 010-2.016l-2.24-1.12a1.125 1.125 0 01-.744-1.008v-2.24c0-.65-.53-1.18-1.18-1.18h-2.24a1.125 1.125 0 01-1.008-.744l-1.12-2.24a1.125 1.125 0 01-2.016 0z" />
    </IconWrapper>
);

export const LightbulbIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a6.01 6.01 0 00-3.75 0M12 2.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125s1.125-.504 1.125-1.125v-1.5A1.125 1.125 0 0012 2.25zM7.864 4.14a1.125 1.125 0 00-1.591 0L4.14 6.274a1.125 1.125 0 000 1.591l2.122 2.122a1.125 1.125 0 001.59 0l2.122-2.122a1.125 1.125 0 000-1.591L7.864 4.14zM16.14 4.14a1.125 1.125 0 000 1.591l2.122 2.122a1.125 1.125 0 001.59 0L21.96 6.274a1.125 1.125 0 000-1.591l-2.122-2.122a1.125 1.125 0 00-1.591 0z" />
    </IconWrapper>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </IconWrapper>
);

export const UndoIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </IconWrapper>
);

// Fix: Corrected the RectangleIcon to display a rectangle instead of a circle.
export const RectangleIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75z" />
    </IconWrapper>
);

export const CircleIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </IconWrapper>
);

export const ArrowUpRightIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </IconWrapper>
);

export const CameraIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </IconWrapper>
);

export const ImportIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
    </IconWrapper>
);

export const XIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </IconWrapper>
);

export const ClipboardIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </IconWrapper>
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </IconWrapper>
);

export const VideoCameraIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
    </IconWrapper>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </IconWrapper>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </IconWrapper>
);

export const ExpandIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </IconWrapper>
);

export const ZoomOutIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
    </IconWrapper>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </IconWrapper>
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </IconWrapper>
);

export const SlashIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15" />
    </IconWrapper>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.12 2.24a1.125 1.125 0 01-1.008.744H5.385c-.65 0-1.18.53-1.18 1.18v2.24a1.125 1.125 0 01-.744 1.008l-2.24 1.12a1.125 1.125 0 010 2.016l2.24 1.12a1.125 1.125 0 01.744 1.008v2.24c0 .65.53 1.18 1.18 1.18h2.24a1.125 1.125 0 011.008.744l1.12 2.24a1.125 1.125 0 012.016 0l1.12-2.24a1.125 1.125 0 011.008-.744h2.24c.65 0 1.18-.53 1.18-1.18v-2.24a1.125 1.125 0 01.744-1.008l2.24-1.12a1.125 1.125 0 010-2.016l-2.24-1.12a1.125 1.125 0 01-.744-1.008v-2.24c0-.65-.53-1.18-1.18-1.18h-2.24a1.125 1.125 0 01-1.008-.744l-1.12-2.24a1.125 1.125 0 01-2.016 0z" />
    </IconWrapper>
);

export const RegenerateIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </IconWrapper>
);

export const TextIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v18M3 3h9m-9 18h9" />
    </IconWrapper>
);

export const RestoreIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </IconWrapper>
);

export const SendToStartFrameIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3M3 3h18M3 9h5.25M15.75 9H21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h6" />
    </IconWrapper>
);

export const SendToEndFrameIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18M3 21h18M3 15h5.25M15.75 15H21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6" />
    </IconWrapper>
);

export const PaperClipIcon: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.735-7.662 7.662a4.5 4.5 0 0 1-6.364-6.364l7.662-7.662a3 3 0 0 1 4.242 4.242l-7.662 7.662a1.5 1.5 0 0 1-2.121-2.121L16.5 6.375" />
    </IconWrapper>
);