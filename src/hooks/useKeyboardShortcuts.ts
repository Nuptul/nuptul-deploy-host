import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useKeyboardShortcuts = ({ isOpen, onClose }: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
};