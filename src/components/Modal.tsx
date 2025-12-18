
import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}

export const Modal: React.FC<ModalProps> = ({ title, children, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 border-2 border-teal-500 rounded-lg shadow-2xl shadow-teal-500/20 p-6 md:p-8 text-center max-w-sm w-full mx-4 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-teal-400 mb-4">{title}</h2>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
