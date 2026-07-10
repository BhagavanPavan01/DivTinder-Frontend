// src/components/common/Avatar.jsx
const Avatar = ({ src, name, size = 'md', className = '' }) => {
    const initials = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClass =
        size === 'sm' ? 'w-8 h-8' :
            size === 'md' ? 'w-10 h-10' :
                'w-12 h-12'; // lg

    return (
        <div
            className={`rounded-full bg-gray-300 flex items-center justify-center text-white font-bold ${sizeClass} ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={name || 'Avatar'}
                    className="rounded-full object-cover w-full h-full"
                />
            ) : (
                initials
            )}
        </div>
    );
};

export default Avatar;