import React, { useState, createContext, useContext, useEffect } from 'react';

// Create Context
export const ModalContext = createContext();

// Provider Component
export const ModalProvider = ({ children }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [onConfirm, setOnConfirm] = useState(null);
  const [modalActions, setModalActions] = useState([]);

  useEffect(() => {
    if(!modalContent) {
      setModalOpen(false)
    }
  }, [modalContent]);

  const openModal = (content, confirmCallback) => {
    setModalContent(content);
    setOnConfirm(() => confirmCallback);
    setModalOpen(true);
  };

  const updateModalContent = (newContent) => {
    setModalContent(newContent);
  };

  const closeModal = () => {
    setModalOpen(false);
    setOnConfirm(null);

    const timer = setTimeout(() => {
      setModalContent(null);
    }, 200);

    return () => clearTimeout(timer);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, modalContent, onConfirm, openModal, closeModal, modalActions, setModalActions, updateModalContent }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => useContext(ModalContext);
