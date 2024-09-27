import React from 'react';

interface CustomInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  requiredValue: string;  // Add this prop for the required input value
}

const CustomInputModal: React.FC<CustomInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  inputValue,
  onInputChange,
  confirmButtonText,
  requiredValue,  // Add this to the destructured props
}) => {
  if (!isOpen) return null;

  const isInputValid = inputValue === requiredValue;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Ingrese el nombre del negocio"
        />
        <div className="modal-buttons">
          <button 
            onClick={onConfirm} 
            disabled={!isInputValid}
            style={{ opacity: isInputValid ? 1 : 0.5 }}
          >
            {confirmButtonText}
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default CustomInputModal;