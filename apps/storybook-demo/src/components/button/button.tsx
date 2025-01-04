interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                variant = 'primary',
                                                size = 'md',
                                                isLoading = false,
                                                children
                                              }) => {
  const baseStyles = 'rounded font-medium transition-colors';
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    ghost: 'hover:bg-gray-100 text-gray-800'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        isLoading ? 'opacity-50 cursor-wait' : ''
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="inline-block animate-spin mr-2">⚪</span>
      ) : null}
      {children}
    </button>
  );
};