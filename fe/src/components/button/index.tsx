import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'tertiary';
  icon?: React.ReactNode;
}

export const Button = ({ variant, value, className, icon, onClick }: ButtonProps) => {
  return (
    <button
      className={classNames(
        'rounded-full px-10 py-2 font-bold transition duration-200 ease-in-out tracking-wider gap-x-2 flex items-center justify-center',
        {
          'bg-blue-700 hover:bg-blue-800 text-white uppercase text-sm': variant === 'primary',
          'bg-gray-700 hover:bg-gray-800 text-white uppercase text-sm': variant === 'secondary',
          'bg-transparent text-blue-700 normal-case text-lg': variant === 'tertiary',
        },
        className
      )}
      onClick={onClick}
    >
      <span>{value}</span>
      <span>{icon}</span>
    </button>
  );
};
