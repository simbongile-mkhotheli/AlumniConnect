import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing modal state
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [itemId, setItemId] = useState<string | undefined>();

  const openModal = useCallback(
    (modalMode: 'create' | 'edit' | 'view' = 'create', id?: string) => {
      console.log('useModal openModal called with:', { modalMode, id });
      
      setMode(modalMode);
      setItemId(id);
      setIsOpen(true);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    },
    []
  );

  const closeModal = useCallback(() => {
    console.log('useModal closeModal called');
    setIsOpen(false);
    setItemId(undefined);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);

  // Cleanup on unmount just in case modal left open
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Debug log state changes (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[useModal] state changed', { isOpen, mode, itemId });
    }
  }, [isOpen, mode, itemId]);

  return {
    isOpen,
    mode,
    itemId,
    openModal,
    closeModal,
    setMode,
    setItemId,
  };
}