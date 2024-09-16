import React from 'react';
import './css/modal.css';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className='modal-overlay'>
            <div className='modal-content'>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default CustomModal;