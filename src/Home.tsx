import React, { useState, useEffect, useCallback } from "react";
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
  getTransactionById,
  authenticate,
} from "./dataApi";
import loadingGif from "./img/loading.gif";
import "./css/modal.css";
import RegisterUserModal from "./Components/Register/RegisterUserModal";
import CustomModal from "./CustomModal";
import UserList from "./Components/usersComponent/UserList";
import DataGraphics from "./Components/DataGraphics/DataGraphics";
import CustomInputModal from "./CustomInputModal";
import GraphsSection from "./Components/DataGraphics/GaphsSection";
import axios from "axios";
import config from './config';

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
    location.state?.currentDatabase || "GOJI_DEVELOPMENT_DB";
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
  const [pass, setPass] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisteringUser, setIsRegisteringUser] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalInput, setDeleteModalInput] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allBusinessNames, setAllBusinessNames] = useState<Record<string, string>>({});
  const [pointsOperation, setPointsOperation] = useState<'add' | 'subtract'>('add');
  const [shouldFetchTransactions, setShouldFetchTransactions] = useState(false);
  const [isGraphsSectionVisible, setIsGraphsSectionVisible] = useState(false);
  const [isDataGraphicsVisible, setIsDataGraphicsVisible] = useState(false);
  const [isUserListTableVisible, setIsUserListTableVisible] = useState(false);

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

  useEffect(() => {
    if (Object.keys(groupedByBusiness).length > 0) {
      fetchAllTransactionsAndBusinessNames();
    }
  }, [groupedByBusiness]);

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

  const fetchAllTransactionsAndBusinessNames = useCallback(async () => {
    let businessNames: Record<string, string> = {};

    for (const businessId of Object.keys(groupedByBusiness)) {
      businessNames[businessId] = groupedByBusiness[businessId].businessInfo?.business_name || "Unknown";
    }

    setAllBusinessNames(businessNames);
  }, [groupedByBusiness]);

  const fetchTransactions = useCallback(async () => {
    if (shouldFetchTransactions && allTransactions.length === 0) {
      try {
        let transactions: any[] = [];
        for (const businessId of Object.keys(groupedByBusiness)) {
          const businessTransactions = await getTransactionById(businessId, currentDatabase);
          if (Array.isArray(businessTransactions)) {
            transactions = [...transactions, ...businessTransactions.map(t => ({...t, business_id: businessId}))];
          }
        }
        setAllTransactions(transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }
  }, [shouldFetchTransactions, allTransactions.length, groupedByBusiness, currentDatabase]);

  useEffect(() => {
    if (shouldFetchTransactions) {
      fetchTransactions();
    }
  }, [shouldFetchTransactions, fetchTransactions]);

  const handleTransactionVisibilityChange = (isVisible: boolean) => {
    setShouldFetchTransactions(isVisible);
  };

  const handleRegisterUser = () => {
    setIsRegisteringUser(true);
  };

  const handleCloseRegisterUserModal = () => {
    setIsRegisteringUser(false);
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      const newUser = {
        username: data.nombre,
        password: data.contrasena,
        phoneNumber: data.telefono,
        businessId: "521" + fixPhoneNumber(data.telefono),
        email: data.correo,
      };

      console.log("New user data:", newUser); // Add this line for debugging

      await createUser(newUser, currentDatabase);

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

  const handleUserSelect = (username: string) => {
    const user = data.find((u) => u.username === username);
    console.log("Selected user:", user);
    setSelectedUser(user);
    if (user && user.businessId) {
      getBusinessById(user.businessId, currentDatabase)
        .then((business) => {
          setBusinessInfo(business);
        })
        .catch((error) => {
          console.error("Error fetching business info:", error);
        });
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
        // Remove this line: setUserEditData({});
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
  const handleUserAndBusinessDelete = async (username: string, businessName: string) => {
    if (!username || !businessName) {
      setModalMessage("No se ha seleccionado un usuario o negocio para eliminar.");
      setIsModalOpen(true);
      return;
    }

    setUserToDelete(username);
    setBusinessToDelete(businessName);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    if (deleteModalInput === businessToDelete) {
      try {
        const token = await authenticate(process.env.REACT_APP_API_EMAIL || '', process.env.REACT_APP_API_PASSWORD || '');
        
        if (!token) {
          throw new Error('Failed to obtain token.');
        }

        const businessData = await getBusinessById(businessToDelete!, currentDatabase);

        // Delete channels
        if (businessData && businessData.channels) {
          for (const channel of businessData.channels) {
            if (channel.baileys_port) {
              await deleteChannel(channel, businessData.business_id, token);
            }
          }
        }

        // Delete business
        await deleteBusiness(businessToDelete!, currentDatabase);
        console.log(`Business ${businessToDelete} deleted successfully`);

        // Delete user
        await deleteUser(userToDelete!, currentDatabase);
        console.log(`User ${userToDelete} deleted successfully`);

        // Refresh data
        fetchData(currentDatabase);

        setModalMessage("El negocio, usuario asociado y canales han sido eliminados exitosamente.");
        setIsModalOpen(true);
      } catch (error) {
        console.error("Error deleting user, business, and channels:", error);
        setModalMessage("Error al eliminar el negocio, usuario asociado y canales.");
        setIsModalOpen(true);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteModalInput("");
        setUserToDelete(null);
        setBusinessToDelete(null);
      }
    } else {
      setModalMessage("El nombre del negocio no coincide. No se realizó la eliminación.");
      setIsModalOpen(true);
    }
  };

  const deleteChannel = async (channel: any, businessId: string, token: string) => {
    try {
      await axios.post(`${config.apiBaileys}/logoutBaileys`, {
        baileys_port: channel.baileys_port
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await axios.post(`${config.apiBaileys}/deleteRenataBaileysFromChannel`, {
        business_id: businessId,
        username: channel.username
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Error deleting channel:", error);
      throw error;
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPass(newPassword);
    if (newPassword.length < 5) {
      setPasswordError('La contraseña debe tener al menos 5 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !selectedUser.businessId) {
      console.error("No user selected or business ID not available for password change");
      return;
    }

    try {
      await modifyPassword(selectedUser.businessId, currentDatabase, pass);
      
      // Close both modals
      setIsEditingUser(false);
      setIsChangingPassword(false);
      
      // Reset states
      setSelectedUser(null);
      setUserEditData({});
      setPass("");
      
      // Show confirmation message
      setModalMessage("Se ha cambiado la contraseña exitosamente");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error changing password:", error);
      setModalMessage("Error al cambiar la contraseña");
      setIsModalOpen(true);
    }
  };

  const handleModifyRenataPoints = async () => {
    setIsLoading(true);
    try {
      if (!businessInfo || !businessInfo.business_id) {
        throw new Error('No se ha seleccionado un negocio válido');
      }

      if (number === '' || isNaN(parseFloat(number))) {
        throw new Error('La cantidad ingresada no es válida');
      }

      const value = parseFloat(number);
      const finalValue = pointsOperation === 'add' ? value : -value;

      console.log('Modifying points:', { businessId: businessInfo.business_id, database: currentDatabase, value: finalValue });

      const actualChange = await modifyRenataPoints(
        businessInfo.business_id,
        currentDatabase,
        finalValue
      );

      console.log('Actual change:', actualChange);

      // Use the absolute value of actualChange for the transaction
      const transactionAmount = Math.abs(actualChange);

      await insertTransaction(
        businessInfo.business_id,
        currentDatabase,
        transactionAmount,
        pointsOperation
      );

      if (actualChange !== finalValue) {
        setModalMessage(`Se han ${pointsOperation === 'add' ? 'agregado' : 'restado'} ${transactionAmount} puntos. El negocio ahora tiene 0 puntos Renata.`);
      } else {
        setModalMessage(`Se han ${pointsOperation === 'add' ? 'agregado' : 'restado'} ${transactionAmount} puntos.`);
      }

      setIsModalOpen(true);
      setNumber("");
      handleCloseModal();
      
      // Reset states and refresh data
      setSelectedUser(null);
      setBusinessInfo(null);
      setIsAddingPoints(false);
      fetchData(currentDatabase);

    } catch (error) {
      console.error("Error modifying Renata points: ", error);
      setModalMessage(`Error al modificar los puntos: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure only positive numbers and decimals are allowed
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      if (pointsOperation === 'subtract' && businessInfo) {
        const currentPoints = businessInfo.renata_points || 0;
        // Allow any valid input, but limit to current points
        const newValue = Math.min(parseFloat(value) || 0, currentPoints);
        setNumber(newValue.toString());
      } else {
        setNumber(value);
      }
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  // Modify this function to accept the user data
  const handleOpenEditUserModal = (user: any) => {
    if (user) {
      const editableData = {
        username: user.username,
        phoneNumber: user.phoneNumber,
        email: user.email,
        // Add any other fields you want to be editable
      };
      console.log("Opening edit user modal with data:", editableData);
      setUserEditData(editableData);
      setSelectedUser(user);
      setIsEditingUser(true);
    } else {
      console.error("No user data provided for editing");
    }
  };

  const handleOpenAddingPoints = () => {
    console.log("Selected User:", selectedUser);
    console.log("Business Info:", businessInfo);

    if (businessInfo && businessInfo.business_id) {
      setIsAddingPoints(true);
    } else if (selectedUser && selectedUser.businessId) {
      getBusinessById(selectedUser.businessId, currentDatabase)
        .then((business) => {
          console.log("Fetched Business:", business);
          setBusinessInfo(business);
          setIsAddingPoints(true);
        })
        .catch((error) => {
          console.error("Error fetching business info:", error);
          setModalMessage(`Error al obtener información del negocio: ${error.message}`);
          setIsModalOpen(true);
        });
    } else {
      console.error("No valid user or business selected");
      setModalMessage("No se ha seleccionado un usuario o negocio válido");
      setIsModalOpen(true);
    }
  };

  const handleOpenChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleCloseModal = () => {
    setIsEditingUser(false);
    setIsEditingBusiness(false);
    setIsAddingPoints(false);
    setIsChangingPassword(false);
    setSelectedUser(null);
    setBusinessInfo(null);
    setUserEditData({});
    setBusinessEditData({});
    setNumber("");
    setPass("");
    setPasswordError("");
  };

  const handleCloseModalPoints = () => {
    setIsAddingPoints(false);
  };

  const handleDatabaseChange = (newDatabase: string) => {
    setCurrentDatabase(newDatabase);
    setAllTransactions([]); // Reset transactions when database changes
    setShouldFetchTransactions(false); // Reset fetch flag
    setIsGraphsSectionVisible(false); // Close GraphsSection
    setIsDataGraphicsVisible(false); // Close DataGraphics
    setIsUserListTableVisible(false); // Close UserList table
    setGroupedByBusiness({}); // Reset grouped business data
  };

  const handlePointsOperationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointsOperation(e.target.value as 'add' | 'subtract');
    setNumber("");
  };
  const handleGraphsSectionVisibilityChange = (isVisible: boolean) => {
    setIsGraphsSectionVisible(isVisible);
    setShouldFetchTransactions(isVisible);
  };

  const handleDataGraphicsVisibilityChange = (isVisible: boolean) => {
    setIsDataGraphicsVisible(isVisible);
    setShouldFetchTransactions(isVisible);
  };

  const handleUserListTableVisibilityChange = (isVisible: boolean) => {
    setIsUserListTableVisible(isVisible);
  };

  return (
    <>
        <div className="button-container">
          <button
            className={`custom-button ${currentDatabase === 'GOJI_DEVELOPMENT_DB_COPY' ? 'selected' : ''}`}
            onClick={() => handleDatabaseChange('GOJI_DEVELOPMENT_DB_COPY')}
          >
            Development Copy
          </button>
          <button
            className={`custom-button ${currentDatabase === 'GOJI_DEVELOPMENT_DB' ? 'selected' : ''}`}
            onClick={() => handleDatabaseChange('GOJI_DEVELOPMENT_DB')}
          >
            Development
          </button>
          <button
            className={`custom-button ${currentDatabase === 'GOJI_QUALITY_DB' ? 'selected' : ''}`}
            onClick={() => handleDatabaseChange('GOJI_QUALITY_DB')}
          >
            Quality
          </button>
          <button
            className={`custom-button ${currentDatabase === 'GOJI_MAIN_DB' ? 'selected' : ''}`}
            onClick={() => handleDatabaseChange('GOJI_MAIN_DB')}
          >
            Main
          </button>
        </div>

      <div className="container">
        <h1 className="panel-title">PANEL DE CONTROL</h1>



        <GraphsSection 
          groupedByBusiness={groupedByBusiness}
          currentDatabase={currentDatabase}
          businessNames={allBusinessNames}
          transactions={allTransactions}
          onVisibilityChange={handleGraphsSectionVisibilityChange}
          fetchTransactions={fetchTransactions}
          isVisible={isGraphsSectionVisible}
        />

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
          isTableVisible={isUserListTableVisible}
          onTableVisibilityChange={handleUserListTableVisibilityChange}
        />

        <DataGraphics
          businessId={groupedByBusiness}
          database={currentDatabase}
          transactions={allTransactions}
          businessNames={allBusinessNames}
          onVisibilityChange={handleDataGraphicsVisibilityChange}
          fetchTransactions={fetchTransactions}
          isVisible={isDataGraphicsVisible}
        />

        <RegisterUserModal
          isOpen={isRegisteringUser}
          onClose={handleCloseRegisterUserModal}
          onRegister={handleRegister} />
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage} />

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
                    "assistant_id",
                    "__v",
                    "baileys_port",
                    "schema_version",
                    "skills",
                    "stripe_customer_id",
                    "baileys_status"
                  ].includes(key) && (
                    <label key={key}>
                      {/* Usamos la función de traducción segura */}
                      {getTranslation(key)}:
                      {key === "payment_type" ? (
                <select
                  name={key}
                  value={businessEditData[key]}
                  onChange={handleBusinessInputChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={businessEditData[key]}
                  onChange={handleBusinessInputChange}
                />
              )}
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
              {Object.keys(userEditData).map((key) => {
                // Skip rendering for schema_version, password, __v, and any other fields you want to exclude
                if (key === 'schema_version' || key === 'password' || key === '__v') {
                  return null;
                }
                return (
                  <label key={key}>
                    {/* Usamos la función de traducción segura */}
                    {getTranslation(key)}:
                    <input
                      type="text"
                      name={key}
                      value={userEditData[key]}
                      onChange={handleInputChange} />
                  </label>
                );
              })}
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
              <h3>Modificar puntos Renata</h3>
              <div>
                <label>
                  <input
                    type="radio"
                    value="add"
                    checked={pointsOperation === 'add'}
                    onChange={handlePointsOperationChange}
                  />
                  Agregar puntos
                </label>
                <label>
                  <input
                    type="radio"
                    value="subtract"
                    checked={pointsOperation === 'subtract'}
                    onChange={handlePointsOperationChange}
                  />
                  Restar puntos
                </label>
              </div>
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
                  `${pointsOperation === 'add' ? 'Agregar' : 'Restar'} Puntos`
                )}
              </button>
              <button onClick={handleCloseModalPoints}>Cancelar</button>
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
                onChange={handlePasswordChange}
                
                placeholder="Ingresa una contrasea"
              />
              {passwordError && <p style={{ color: 'red', marginTop: '5px' }}>{passwordError}</p>}
              <button onClick={toggleShowPassword}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
              <button onClick={handleChangePassword} disabled={passwordError !== ''}>Save</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        )}

        <CustomInputModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirmation}
          message={`Para confirmar la eliminación, por favor ingrese el nombre completo del negocio: ${businessToDelete}`}
          inputValue={deleteModalInput}
          onInputChange={(e) => setDeleteModalInput(e.target.value)}
          confirmButtonText="Eliminar"
          requiredValue={businessToDelete || ''} // Add this line
        />
      </div>
    </>
  );
};

export default Home;
