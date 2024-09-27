import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate } from './dataApi';

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const token = await authenticate(phoneNumber, password);
    if (token) {
      localStorage.setItem('gojimx_token', token);
      navigate('/home');
    } else {
      setError('Fallo en la autenticación. Por favor, verifica tus credenciales.');
    }
  };
// Comment1
// Comment2ss
// Comment3
// Comment4
  return (
    <div className="container">
      <h2>INICIA SESIÓN</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Usuario:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
