import React, { useState } from 'react';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';


interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterForm) => void;
}

interface OptionType {
  value: string;
  label: string;
}

interface RegisterForm {
  nombre: string;
  correo: string;
  telefono: string;
  contrasena: string;
  nombreNegocio: string;
  casoUsoNegocio: OptionType[];
}


const customStyles = {
  control: (provided: any) => ({
    ...provided,
    borderRadius: '12px',
    background: '#f2f2f2',
    align: 'center',
    top: 8
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#56595c',
    textAlign: 'center',
  })
};


const caseUseOptions = [
  { value: "Atención al Cliente", label: "Atención al Cliente" },
  { value: "Gestión de Citas y Reservas", label: "Gestión de Citas y Reservas" },
  { value: "Soporte Técnico", label: "Soporte Técnico" },
  { value: "Encuestas y Feedback", label: "Encuestas y Feedback" },
  { value: "Promociones y Ofertas Especiales", label: "Promociones y Ofertas Especiales" },
  { value: "Información de Productos y Servicios", label: "Información de Productos y Servicios" },
  { value: "Asistencia en Compras", label: "Asistencia en Compras" },
  { value: "Confirmaciones y Seguimientos de Pedidos", label: "Confirmaciones y Seguimientos de Pedidos" },
  { value: "Resolución de Quejas y Reclamaciones", label: "Resolución de Quejas y Reclamaciones" },
  { value: "Información de Horarios y Disponibilidad", label: "Información de Horarios y Disponibilidad" },
];

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [form, setForm] = useState<RegisterForm>({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    nombreNegocio: '',
    casoUsoNegocio: []
  });

  const [selectedCase, setSelectedCase] = useState<OptionType[]>([]);
  const animatedComponents = makeAnimated();
  const [passwordError, setPasswordError] = useState('');

  const handleCaseUseChange = (selectedOption: any) => {
    setSelectedCase(selectedOption);
    // setUsecaseError(selectedOption.length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    if (name === 'contrasena') {
      if (value.length < 5) {
        setPasswordError('La contraseña debe tener al menos 5 caracteres');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (selectedCase.length === 0) {
      // Manejar error si caso de uso no está seleccionado
      alert("Debes seleccionar al menos un caso de uso.");
      return;
    }
  
    onRegister({
      ...form,
      casoUsoNegocio: selectedCase,
    });
  
    setForm({
      nombre: '',
      correo: '',
      telefono: '',
      contrasena: '',
      nombreNegocio: '',
      casoUsoNegocio: []
    });
  
    setSelectedCase([]);
  };
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Registrar usuario y negocio</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre:
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Correo:
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Telefono:
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contraseña:
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              required
            />
            {passwordError && <p style={{ color: 'red', marginTop: '5px' }}>{passwordError}</p>}
          </label>
          <label>
            Nombre del negocio:
            <input
              type="text"
              name="nombreNegocio"
              value={form.nombreNegocio}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Caso de uso del negocio:
            <ReactSelect
              closeMenuOnSelect={true}
              placeholder={'Caso de uso'}
              components={animatedComponents}
              isMulti={true}
              onChange={handleCaseUseChange}
              options={caseUseOptions}
              menuPortalTarget={document.body}
              styles={customStyles}
            />
          </label>
          <button type="submit" disabled={passwordError !== ''}>Registrar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUserModal;