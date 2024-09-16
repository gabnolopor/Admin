import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  main,
  getBusinessById,
  updateUser,
  updateBusiness,
  deleteUser,
  modifyRenataPoints,
  insertTransaction,
  modifyPassword,
  createUser,
  createBusiness,
  fixPhoneNumber,
  deleteBusiness,
} from "./dataApi";
import loadingGif from "./img/loading.gif";
import "./css/modal.css";
import RegisterUserModal from "./Components/Register/RegisterUserModal";
import CustomModal from "./CustomModal";
import UserList from "./Components/usersComponent/UserList";
import DataGraphics from "./Components/DataGraphics/DataGraphics";

interface RegisterForm {
  nombre: string;
  correo: string;
  telefono: string;
  contrasena: string;
  nombreNegocio: string;
  casoUsoNegocio: OptionType[];
}

interface OptionType {
  value: string;
  label: string;
}

const translationMap = {
  business_name: "Nombre del negocio",
  business_id: "ID del negocio",
  assistant_id: "ID del asistente",
  baileys_status: "Estado de baileys",
  use_case: "Utilidad",
  categories: "Categorías",
  category_name: "Nombre de la categoría",
  options: "Opciones",
  option_name: "Nombre de la opción",
  icon: "Icono",
  description: "Descripción",
  _id: "ID",
  assistants: "Asistentes",
  name: "Nombre",
  intelligenceLevel: "Nivel de inteligencia",
  responseLength: "Longitud de respuesta",
  workingHoursStart: "Inicio de horario laboral",
  workingHoursEnd: "Fin de horario laboral",
  responseSpeed: "Velocidad de respuesta",
  instructions: "Instrucciones",
  active: "Activo",
  __v: "Versión",
  renata_points: "Puntos de renata",
  baileys_port: "Puerto de baileys",
  channels: "Canales",
  channel_name: "Nombre del canal",
  main_number: "Número principal",
  username: "Nombre de usuario",
  password: "Contraseña",
  phoneNumber: "Número de teléfono",
  businessId: "ID del negocio",
};

const Home: React.FC = () => {
  const location = useLocation();
  const initialData = location.state?.data;
  const [data, setData] = useState<any[]>(initialData || []);
  const initialDatabase =
    location.state?.currentDatabase || "GOJI_DEVELOPMENT_DB_COPY";
  const [currentDatabase, setCurrentDatabase] =
    useState<string>(initialDatabase);

  // Data agrupada por negocio
  const [groupedByBusiness, setGroupedByBusiness] = useState<{
    [key: string]: any;
  }>({});

  //configuracion de estado para visibilidad de usuarios

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [userEditData, setUserEditData] = useState<any>({});
  const [businessEditData, setBusinessEditData] = useState<any>({});

  //selector de negocio para individualidad
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState<boolean>(false);

  const [isAddingPoints, setIsAddingPoints] = useState<boolean>(false);
  const [number, setNumber] = useState(""); //for the addingPoints
  const [isLoading, setIsLoading] = useState(false); //for the renata-points incremente
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [pass, setPass] = useState(""); //for the password change
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisteringUser, setIsRegisteringUser] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    // Fetch data automatically when the component mounts
    fetchData(currentDatabase);
  }, [currentDatabase]);


  // Sistema de acumulacion de usuarios relacionales al business segun el businessId para estructura de user data permitiendo uno o mas usuarios.
  useEffect(() => {
    if (data.length > 0) {
      const groupedData = data.reduce((acc, user) => {
        if (user.businessId) {
          if (!acc[user.businessId]) {
            acc[user.businessId] = {
              businessInfo: null,
              users: [],
            };
          }
          acc[user.businessId].users.push(user);
        }
        return acc;
      }, {});

      setGroupedByBusiness(groupedData);

      // Carga el business info para cada business ID
      Object.keys(groupedData).forEach((businessId) => {
        fetchBusinessInfo(businessId);
      });
    }
  }, [data]);

  useEffect(() => {
    if (selectedUser?.businessId) {
      fetchBusinessInfo(selectedUser.businessId);
    }
  }, [selectedUser]);

  // Fetch data function
  const fetchData = async (database: string) => {
    try {
      const newData = await main(database);
      setData(newData);
      setCurrentDatabase(database);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBusinessInfo = async (businessId: string) => {
    try {
      const business = await getBusinessById(businessId, currentDatabase);
      setGroupedByBusiness((prev) => ({
        ...prev,
        [businessId]: {
          ...prev[businessId],
          businessInfo: business,
        },
      }));
    } catch (error) {
      console.error("Error fetching business info:", error);
    }
  };

  const handleRegisterUser = () => {
    setIsRegisteringUser(true);
  };

  const handleCloseRegisterUserModal = () => {
    setIsRegisteringUser(false);
  };

  const handleRegister = async (data: RegisterForm) => {
    const newUser = {
      username: data.nombre,
      password: data.contrasena,
      phoneNumber: data.telefono,
      businessId: "521" + fixPhoneNumber(data.telefono),
      email: data.correo,
    };

    const newBusiness = {
      business_name: data.nombreNegocio,
      business_id: "521" + fixPhoneNumber(data.telefono),
      assistant_id: "",
      baileys_status: false,
      use_case: data.casoUsoNegocio,
      assistants: [
        {
          assistant_id: "",
          name: "Renata Default",
          description: "Asistente predeterminado",
          intelligenceLevel: "media",
          responseLength: "cortas",
          workingHoursStart: 0,
          workingHoursEnd: 24,
          responseSpeed: "media",
          instructions:
            "Eres un asistente que ayuda en la información de Goji.mx Goji es una empresa de tecnología y provee una app de Renata assistant, que les dirigirás a ella. Pide amablemente a los usuarios que configuren a Renata dentro del app para poder comenzar a optimizar sus flujos de trabajo.NO uses más de 30 palabras. Eres gentil, pero si te mandan muchos mensajes, les dices que te has agotado",
          active: true,
        },
      ],
      categories: [
        {
          category_name: "default",
          options: [
            {
              option_name: "Feliz",
              icon: "😄",
              description:
                "Cuando el usuario parece estar complacido con el servicio, no se ha quejado.",
            },
            {
              option_name: "Triste",
              icon: "😞",
              description:
                "El usuario ha indicado que tiene alguna dificultad.",
            },
            {
              option_name: "Neutral",
              icon: "😐",
              description:
                "El usuario no ha mostrado ningún sentimiento ni positivo ni negativo.",
            },
          ],
        },
        {
          category_name: "category example",
          options: [],
        },
      ],
      channels: [
        {
          channel_name: "WhatsApp",
          active: true,
          username: "521" + fixPhoneNumber(data.telefono),
        },
      ],
      renata_points: 0,
    };

    try {
      await createUser(newUser, currentDatabase);
      await createBusiness(newBusiness, currentDatabase);
      fetchData(currentDatabase); // Refresh data after creation
      setIsRegisteringUser(false);
      setModalMessage("Usuario y negocio creados exitosamente");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating user and business:", error);
      setModalMessage("Error al crear usuario y negocio");
      setIsModalOpen(true);
    }
  };

  const handleUserSelect = async (username: string) => {
    if (selectedUser && selectedUser.username === username) {
      setSelectedUser(null);
      return;
    }

    try {
      const user = data.find((user: any) => user.username === username);
      setSelectedUser(user);
      setUserEditData(user || {});
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const handleBusinessSelect = async (businessId: string) => {
    // Si el negocio seleccionado es el mismo, deseleccionarlo
    if (businessInfo && businessInfo.business_id === businessId) {
      setBusinessInfo(null);
      return;
    }

    try {
      // Llamamos a fetchBusinessInfo para actualizar groupedByBusiness
      await fetchBusinessInfo(businessId);

      // Esperamos un ciclo de render para asegurar que groupedByBusiness se actualizó
      setTimeout(() => {
        // Obtener la información del negocio recién cargada desde el estado
        const business = groupedByBusiness[businessId]?.businessInfo;

        if (business) {
          // Establecer la información del negocio seleccionado
          setBusinessInfo(business);
          console.log(business);
          setBusinessEditData(business || {});
        }
      }, 0); // Establecer delay a 0 asegura que el código se ejecuta en el siguiente ciclo del event loop
    } catch (error) {
      console.error("Error selecting business:", error);
    }
  };

  const handleUserUpdate = async () => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.username, userEditData, currentDatabase);
        fetchData(currentDatabase);
        setSelectedUser(null);
        setUserEditData({});
        setIsEditingUser(false);
        setBusinessInfo(null);
        setModalMessage("Se ha modificado el usuario");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleBusinessUpdate = async () => {
    try {
      if (businessInfo) {
        await updateBusiness(
          businessInfo.business_id,
          businessEditData,
          currentDatabase
        );
        const updatedBusiness = await fetchBusinessInfo(
          businessInfo.business_id
        ); // Asegúrate de obtener la información actualizada del negocio
        setBusinessInfo(updatedBusiness); // Actualiza la información del negocio en el estado
        setBusinessEditData({});
        setIsEditingBusiness(false);
        setModalMessage("Se ha modificado el negocio");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  // Función para eliminar un negocio y su usuario asociado
  const handleUserAndBusinessDelete = async (
    username: string,
    businessName: string
  ) => {
    if (!username) {
      setModalMessage(
        "No se ha seleccionado un usuario para eliminar junto con el negocio."
      );
      setIsModalOpen(true);
      return;
    }

    if (!businessName) {
      setModalMessage("No se ha seleccionado un negocio para eliminar.");
      setIsModalOpen(true);
      return;
    }

    try {
      // Confirmación de eliminación
      const confirmDelete = window.confirm(
        "¿Estás seguro de que quieres eliminar este negocio y su usuario asociado?"
      );
      if (!confirmDelete) return;

      console.log(businessName);

      // Eliminar el negocio
      await deleteBusiness(businessName, currentDatabase);
      console.log(`Business ${businessName} deleted successfully`);

      // Eliminar usuario
      await deleteUser(username, currentDatabase);
      console.log(`User ${username} deleted successfully`);

      // Refrescar los datos después de la eliminación
      fetchData(currentDatabase);

      // Limpiar estados y mostrar confirmación
      setBusinessInfo(null);
      setBusinessEditData({});
      setIsEditingBusiness(false);
      setSelectedUser(null);
      setModalMessage(
        "El negocio y el usuario asociado han sido eliminados exitosamente."
      );
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting user and business:", error);
      setModalMessage("Error al eliminar el negocio y el usuario asociado.");
      setIsModalOpen(true);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (selectedUser && pass) {
        fetchData(currentDatabase);
        setSelectedUser(null);

        await modifyPassword(selectedUser.businessId, currentDatabase, pass);
        setModalMessage("Se ha modificado la contraseña del usuario");
        setIsModalOpen(true);
        handleCloseModal();
      } else {
        setModalMessage("Error al guardar los cambios");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setModalMessage("Error al modificar la contraseña");
      setIsModalOpen(true);
    }
  };

  const handleModifyRenataPoints = async () => {
    setIsLoading(true);
    try {
      if (businessInfo && selectedUser && number) {
        //await updateUser(selectedUser.username, userEditData, currentDatabase);

        setSelectedUser(null);
        //setUserEditData({});
        setIsEditingUser(false);
        //setBusinessInfo(null);
        const value = parseFloat(number);
        //agregar los puntos y crear un documento en transactions
        await modifyRenataPoints(
          selectedUser.businessId,
          currentDatabase,
          value
        );
        await insertTransaction(
          selectedUser.businessId,
          currentDatabase,
          value,
          "add"
        );
        setModalMessage("Se han agregado puntos: " + number);
        setIsModalOpen(true);
        setNumber("");
        //setIsAddingPoints(false);
        handleCloseModal();
        fetchData(currentDatabase);
      } else {
        setModalMessage("Error al guardar los cambios");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating user: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure only positive numbers and decimals are allowed
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setNumber(value);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Agregar tipo explícito para el parámetro prevData
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name !== "password") {
      setUserEditData((prevData: Record<string, any>) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleBusinessInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setBusinessEditData((prevData: Record<string, any>) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getTranslation = (key: string): string => {
    return (
      translationMap[key as keyof typeof translationMap] ||
      key.charAt(0).toUpperCase() + key.slice(1)
    );
  };

  const handleOpenEditBusinessModal = () => {
    setIsEditingBusiness(true);
  };

  const handleOpenEditUserModal = () => {
    setIsEditingUser(true);
  };

  const handleOpenAddingPoints = () => {
    setIsAddingPoints(true);
  };

  const handleOpenChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleCloseModal = () => {
    setIsEditingUser(false);
    setIsEditingBusiness(false);
    setIsAddingPoints(false);
    setIsChangingPassword(false);
  };

  const handleCloseModalPoints = () => {
    setIsAddingPoints(false);
  };

  return (
    //-- CONFIGURACION DE SELECTOR DE DB --
    //    <div className="button-container">
    //      <button
    //        className={`custom-button ${selectedButton === 'GOJI_DEVELOPMENT_DB_COPY' ? 'selected' : ''}`}
    //        onClick={() => fetchData('GOJI_DEVELOPMENT_DB_COPY')}
    //      >
    //        Development
    //      </button>
    //    </div>

    <div className="container">
      <h1 className="panel-title">PANEL DE CONTROL</h1>

      {Object.keys(groupedByBusiness).length > 0 && (
        <UserList
          data={groupedByBusiness}
          handleUserAndBusinessDelete={handleUserAndBusinessDelete}
          handleUserSelect={handleUserSelect}
          handleOpenEditBusinessModal={handleOpenEditBusinessModal}
          handleBusinessSelect={handleBusinessSelect}
          handleOpenEditUserModal={handleOpenEditUserModal}
          handleRegisterUser={handleRegisterUser}
          fetchBusinessInfo={fetchBusinessInfo}
          currentDatabase={currentDatabase}
        />
      )}
      {Object.keys(groupedByBusiness).length > 0 && (
        <DataGraphics
          database={currentDatabase}
          businessId={groupedByBusiness}
          fetchBusinessInfo={fetchBusinessInfo}
        />
      )}

      <RegisterUserModal
        isOpen={isRegisteringUser}
        onClose={handleCloseRegisterUserModal}
        onRegister={handleRegister}
      />
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />

      {isEditingBusiness && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Negocio</h3>
            {Object.keys(businessEditData).map(
              (key) =>
                // Excluir renata_points, assistants, categories, use_case
                ![
                  "renata_points",
                  "assistants",
                  "categories",
                  "use_case",
                  "channels",
                  "assistant_id"
                ].includes(key) && (
                  <label key={key}>
                    {/* Usamos la función de traducción segura */}
                    {getTranslation(key)}:
                    <input
                      type="text"
                      name={key}
                      value={businessEditData[key]}
                      onChange={handleBusinessInputChange}
                    />
                  </label>
                )
            )}
            <button onClick={handleBusinessUpdate}>Guardar</button>
            <button onClick={handleCloseModal}>Cancelar</button>
            <button onClick={handleOpenAddingPoints}>
              Modificar Puntos Renata
            </button>
          </div>
        </div>
      )}

      {isEditingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Usuario</h3>
            {Object.keys(userEditData).map(
              (key) =>
                key !== "password" && (
                  <label key={key}>
                    {/* Usamos la función de traducción segura */}
                    {getTranslation(key)}:
                    <input
                      type="text"
                      name={key}
                      value={userEditData[key]}
                      onChange={handleInputChange}
                    />
                  </label>
                )
            )}
            <button onClick={handleUserUpdate}>Guardar</button>
            <button onClick={handleCloseModal}>Cancelar</button>
            <button onClick={handleOpenChangePassword}>
              Cambiar Contraseña
            </button>
          </div>
        </div>
      )}

      {isAddingPoints && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add renata points</h3>
            <input
              type="text"
              value={number}
              onChange={handleInputNumberChange}
              placeholder="Ingresa un número positivo"
            />
            <button
              onClick={handleModifyRenataPoints}
              disabled={isLoading}
              className="custom-button"
            >
              {isLoading ? (
                <img
                  src={loadingGif}
                  alt="Loading..."
                  className="loading-gif"
                />
              ) : (
                "Guardar"
              )}
            </button>
            <button onClick={handleCloseModalPoints}>Cancel</button>
          </div>
        </div>
      )}

      {isChangingPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Password</h3>
            <input
              type={showPassword ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Ingresa una contraseña"
            />
            <button onClick={toggleShowPassword}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
            <button onClick={handleChangePassword}>Save</button>
            <button onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
