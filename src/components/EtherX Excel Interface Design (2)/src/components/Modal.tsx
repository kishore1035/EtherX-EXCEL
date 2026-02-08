import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  isDarkMode = false, 
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        ${sizeClasses[size]} w-full mx-4 rounded-lg shadow-lg
        ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}
      `}>
        {title && (
          <div className={`
            flex items-center justify-between p-4 border-b
            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className={`
                p-1 rounded hover:bg-opacity-10 hover:bg-gray-500
                ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}