import React, { useState, useEffect } from "react";
import { updateAssistant } from "../../dataApi";
interface UserListProps {
  data: Record<string, any>;
  handleUserAndBusinessDelete: (username: string, businessName: string) => void;
  handleUserSelect: (username: string) => void;
  handleOpenEditUserModal: (user: any) => void;
  handleBusinessSelect: (businessId: string) => void;
  handleOpenEditBusinessModal: () => void;
  handleRegisterUser: () => void;
  fetchBusinessInfo: (businessId: string) => void;
  currentDatabase: string;
  isTableVisible: boolean;
  onTableVisibilityChange: (isVisible: boolean) => void;
}



// Mapa de traducción para los nombres de las propiedades
const translationMap: { [key: string]: string } = {
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
  schema_version: "Versión del esquema",
  payment_type: "Tipo de pago",
  skills: "Habilidades",
  active_skills: "Habilidades activas",
  whitelist: "Lista blanca",
  stripe_customer_id: "ID de cliente de Stripe",
  status: "Estado"
};
// Función para renderizar el valor correctamente

const renderValue = (value: any, key?: string) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ""; // Return empty string for empty arrays
    }
    if (key === "use_case") {
      return value.map(item => item.label).join(", ");
    } else if (key === "categories") {
      return value.map(category => category.category_name).join(", ");
    } else if (key === "assistants") {
      return value.map(assistant => assistant.name).join(", ");
    } else if (key === "channels") {
      return value.map(channel => channel.channel_name).join(", ");
    } else if (key === "skills" || key === "active_skills") {
      return value.join(", ");
    }
    return JSON.stringify(value);
  } else if (typeof value === "boolean") {
    return value ? "Activo" : "Inactivo";
  } else if (key === "payment_type") {
    return value === "Premium" ? "Premium" : "Estándar";
  } else if (key === "intelligenceLevel") {
    const levels = { "1": "Bajo", "2": "Medio", "3": "Alto", "media": "Medio" };
    return levels[value as keyof typeof levels] || value;
  } else if (key === "responseLength") {
    const lengths = { "short": "Corto", "medium": "Medio", "long": "Largo", "cortas": "Corto" };
    return lengths[value as keyof typeof lengths] || value;
  } else if (key === "responseSpeed") {
    const speeds = { "slow": "Lento", "normal": "Normal", "fast": "Rápido", "media": "Normal" };
    return speeds[value as keyof typeof speeds] || value;
  }
  return value;
};

const UserList: React.FC<UserListProps> = ({
  data,
  handleUserAndBusinessDelete,
  handleUserSelect,
  handleOpenEditUserModal,
  handleBusinessSelect,
  handleOpenEditBusinessModal,
  handleRegisterUser,
  fetchBusinessInfo,
  currentDatabase,
  isTableVisible,
  onTableVisibilityChange,
}) => {
  const [openBusinessId, setOpenBusinessId] = useState<string | null>(null);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [openAssistantId, setOpenAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assistantSearchTerm, setAssistantSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assistantEditData, setAssistantEditData] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState(false);


  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setLoading(false);
    }
  }, [data]);

  const handleBusinessClick = (businessId: string) => {
    if (openBusinessId === businessId) {
      setOpenBusinessId(null);
    } else {
      setOpenBusinessId(businessId);
      fetchBusinessInfo(businessId);
    }
  };

  const handleUserClick = (username: string) => {
    if (openUserId === username) {
      setOpenUserId(null);
    } else {
      setOpenUserId(username);
    }
  };

  const handleAssistantClick = (assistantId: string) => {
    if (openAssistantId === assistantId) {
      setOpenAssistantId(null);
      setAssistantEditData({}); // Limpiar los datos de edición si se cierra
    } else {
      setOpenAssistantId(assistantId);

      // Verificar que openBusinessId no sea null
    }
  };

  const handleAssistantUpdate = async () => {
    if (openBusinessId) {
      const assistantId = assistantEditData.assistant_id;

      try {
        console.log("Current assistantEditData:", assistantEditData);

        // Get the current business data
        const business = data[openBusinessId].businessInfo;
        const isBeingActivated = assistantEditData.active === true || assistantEditData.active === "true";

        let updatedAssistants = business.assistants.map((assistant: any) => {
          if (assistant.assistant_id === assistantId) {
            // This is the assistant being edited
            return {
              ...assistant,
              ...assistantEditData,
              active: isBeingActivated
            };
          } else {
            // For all other assistants, set active to false only if the current assistant is being activated
            return {
              ...assistant,
              active: isBeingActivated ? false : assistant.active
            };
          }
        });

        console.log("Updated assistants:", updatedAssistants);

        // Update all assistants for the business
        await updateAssistant(
          openBusinessId,
          assistantId,
          updatedAssistants,
          currentDatabase
        );

        // Fetch updated business info to refresh the local state
        await fetchBusinessInfo(openBusinessId);

        setIsModalOpen(false); // Close the modal after saving
      } catch (error) {
        console.error("Error al actualizar el asistente:", error);
      }
    }
  };

  const handleOpenAssistantEditModal = (assistantId: string) => {
    console.log("Abriendo modal para asistente con ID:", assistantId); // Debugging log
    if (openBusinessId) {
      const selectedAssistant = data[
        openBusinessId
      ]?.businessInfo?.assistants?.find(
        (assistant: any) => assistant.assistant_id === assistantId
      );
      if (selectedAssistant) {
        setAssistantEditData(selectedAssistant); // Configurar los datos del asistente para editar
        setIsModalOpen(true); // Abrir el modal de edición
        console.log("Modal abierto, datos cargados:", selectedAssistant);
      } else {
        console.log("No se encontró asistente con ese ID");
      }
    } else {
      console.log("No hay negocio seleccionado");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAssistantSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssistantSearchTerm(event.target.value);
  };

  const filteredBusinesses = Object.keys(data).filter((businessId) => {
    const businessData = data[businessId];

    // Verificar si business_name existe y es una cadena válida
    const businessName = businessData.businessInfo?.business_name || "";
    const matchesBusinessName = businessName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Verificar si assistants existe y es un array válido
    const assistantsArray = businessData.businessInfo?.assistants || [];
    const matchesAssistantName = assistantsArray.some((assistant: any) =>
      assistant.name?.toLowerCase().includes(assistantSearchTerm.toLowerCase())
    );

    // Si uno de los términos de búsqueda es una cadena vacía, considerarlo como no usado
    const isBusinessSearchActive = searchTerm.trim() !== "";
    const isAssistantSearchActive = assistantSearchTerm.trim() !== "";

    // Retornar true si:
    // - Se está buscando por negocio y coincide
    // - Se está buscando por asistente y coincide
    // - O ambas búsquedas están activas y alguna coincide
    return (
      (!isBusinessSearchActive || matchesBusinessName) &&
      (!isAssistantSearchActive || matchesAssistantName)
    );
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleAssistantInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'active') {
      const newValue = value === 'true';
      setAssistantEditData((prevData: any) => ({
        ...prevData,
        [name]: newValue
      }));
    } else {
      setAssistantEditData((prevData: any) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [assistantEditData]);

  // Función para verificar si todos los campos están completos
  const validateForm = () => {
    const requiredFields = [
      assistantEditData.name,
      assistantEditData.description,
      assistantEditData.instructions,
      assistantEditData.intelligenceLevel,
      assistantEditData.responseLength,
      assistantEditData.responseSpeed,
      assistantEditData.workingHoursStart,
      assistantEditData.workingHoursEnd,
      assistantEditData.active,
    ];

    // Verifica si todos los campos tienen valores
    return requiredFields.every((field) => field !== undefined && field !== "");
  };

  const toggleTableVisibility = () => {
    onTableVisibilityChange(!isTableVisible);
  };
 

  const handleEditUser = (user: any) => {
    handleOpenEditUserModal(user);
  };

  return (
    <div>
      <div className="button-container">
        <button
          className="home-panelButton"
          onClick={toggleTableVisibility}
          disabled={loading}
        >
          {loading
            ? "Cargando"
            : isTableVisible
            ? "Ocultar Negocios"
            : "Mostrar Negocios"}
        </button>
      </div>
      <div>
        {isTableVisible && (
          <>
            {/* Campo de búsqueda */}
            <div
              style={{
                margin: "0 0 1rem 0",
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Buscar negocio por nombre..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"

              />
              <input
                type="text"
                placeholder="Buscar asistente por nombre..."
                value={assistantSearchTerm}
                onChange={handleAssistantSearchChange}
                className="search-input"
              />
            </div>
            {filteredBusinesses.length > 0 ? (
              <>
                <table className="table-container">
                  <thead>
                    <tr>
                      <th colSpan={2}>Nombre del Negocio</th>
                      {/* Ocupa todo el ancho */}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBusinesses.map((businessId) => {
                      const businessData = data[businessId];
                      const isOpenBusiness = openBusinessId === businessId;
                      return (
                        <React.Fragment key={businessId}>
                          {businessData.businessInfo &&
                            businessData.businessInfo.business_name && (
                              <>
                                <tr>
                                  <td
                                    onClick={() =>
                                      handleBusinessClick(businessId)
                                    }
                                    className="clickable-cell"
                                  >
                                    {businessData.businessInfo.business_name}
                                  </td>
                                  <td
                                    className="clickable-row-button"
                                    onClick={() => {
                                      handleBusinessSelect(businessId);
                                      handleOpenEditBusinessModal();
                                    }}
                                  >
                                    Editar Negocio
                                  </td>
                                  {/* Botón ocupa toda la fila */}
                                </tr>
                                {isOpenBusiness && (
                                  <tr className="details-row">
                                    <td colSpan={2} style={{border:'none'}}>
                                      <div
                                        className={`details-container ${
                                          isOpenBusiness ? "show" : ""
                                        }`}
                                      >
                                        <div className="business-details">
                                          <h3>Detalles del Negocio</h3>
                                          <ul className="details-list">
                                            {Object.entries(
                                              businessData.businessInfo
                                            ).map(([key, value]) => {
                                              if (key === "assistants" || key === "__v") return null;
                                              const translatedKey =
                                                translationMap[key] || key;
                                              
                                              if (key === "skills" && Array.isArray(value)) {
                                                return (
                                                  <li key={`business-${businessId}-${key}`}>
                                                    <span>
                                                      <strong>{translatedKey}:</strong>
                                                      <ul className="inner-list">
                                                        {value.map((skill: any) => (
                                                          <li key={`business-${businessId}-skill-${skill.skill_id}`}>
                                                            <strong>{skill.skill_name}</strong>
                                                            <ul>
                                                              <li>Tipo: {skill.skill_type}</li>
                                                              <li>Descripción: {skill.skill_description}</li>
                                                            </ul>
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </span>
                                                  </li>
                                                );
                                              }
                                              
                                              return (
                                                <li key={`business-${businessId}-${key}`}>
                                                  <span>
                                                    <strong>
                                                      {translatedKey}:
                                                    </strong>
                                                    <ul className="inner-list">
                                                      <li key={`business-${businessId}-${key}-value`}>
                                                        {renderValue(
                                                          value as any,
                                                          key
                                                        )}
                                                      </li>
                                                    </ul>
                                                  </span>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                        <div className="assistant-details">
                                          <h3>Asistentes</h3>
                                          <ul className="details-list">
                                            {businessData.businessInfo
                                              .assistants &&
                                            businessData.businessInfo.assistants
                                              .length > 0 ? (
                                              businessData.businessInfo.assistants.map(
                                                (assistant: any) => {
                                                  const isOpenAssistant =
                                                    openAssistantId ===
                                                    assistant.assistant_id;
                                                  const circleColor =
                                                    assistant.active
                                                      ? "green"
                                                      : "red";
                                                  return (
                                                    <React.Fragment key={`assistant-${assistant.assistant_id}`}>

                                                      <div className="assistant-controller">
                                                        <li
                                                          className="clickable-text"
                                                          onClick={() =>
                                                            handleAssistantClick(
                                                              assistant.assistant_id
                                                            )
                                                          }
                                                        >
                                                          <span
                                                            style={{
                                                              display:
                                                                "inline-block",
                                                              width: "10px",
                                                              height: "10px",
                                                              borderRadius:
                                                                "50%",
                                                              backgroundColor:
                                                                circleColor,
                                                              marginRight:
                                                                "8px",
                                                            }}
                                                          />
                                                          {assistant.name}
                                                        </li>
                                                        <li>
                                                          <button
                                                            onClick={() =>
                                                              handleOpenAssistantEditModal(
                                                                assistant.assistant_id
                                                              )
                                                            }
                                                          >
                                                            Editar asistente
                                                          </button>
                                                        </li>
                                                      </div>

                                                      {isOpenAssistant && (
                                                        <li
                                                          className="assistant-detailsContainer show"
                                                          style={{
                                                            listStyle: "none",
                                                          }}
                                                        >
                                                          <ul className="inner-list">
                                                            {Object.entries(assistant).map(([key, value]) => {
                                                              // Skip rendering for specific keys
                                                              if (
                                                                key === '__v' || 
                                                                key === 'baileys_port' || 
                                                                key === 'assistant_id' ||
                                                                key === 'assistant_knowledge_base' ||
                                                                key === 'whitelist' ||
                                                                (key === 'assistant_knowledge_base' && value === 'undefined') ||
                                                                (Array.isArray(value) && value.length === 0)
                                                              ) {
                                                                return null;
                                                              }
                                                              
                                                              const translatedKey = translationMap[key] || key;
                                                              return (
                                                                <li key={`assistant-${assistant.assistant_id}-${key}`}>
                                                                  <strong>{translatedKey}:</strong> {renderValue(value, key)}
                                                                </li>
                                                              );
                                                            })}
                                                          </ul>
                                                        </li>
                                                      )}
                                                    </React.Fragment>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <li
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  fontStyle: "italic",
                                                }}
                                              >
                                                No hay Asistentes Disponibles
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                        <div className="user-details">
                                          <h3>Detalles del Usuario</h3>
                                          <ul className="details-list">
                                            {businessData.users &&
                                            businessData.users.length > 0 ? (
                                              businessData.users.map(
                                                (user: any) => {
                                                  const isOpenUser =
                                                    openUserId ===
                                                    user.username;
                                                  return (
                                                    <React.Fragment key={`user-${user.username}`}>

                                                      <div className="user-controller">
                                                        <li
                                                          className="clickable-text"
                                                          onClick={() =>
                                                            handleUserClick(
                                                              user.username
                                                            )
                                                          }
                                                        >
                                                          {user.username}
                                                        </li>
                                                        <li>
                                                          <button
                                                            onClick={() => handleEditUser(user)}
                                                          >
                                                            Editar Usuario
                                                          </button>
                                                          <button
                                                            onClick={() => {
                                                              handleUserAndBusinessDelete(
                                                                user.username,
                                                                businessData
                                                                  .businessInfo
                                                                  .business_name
                                                              );
                                                            }}
                                                          >
                                                            Eliminar Usuario y
                                                            Negocio
                                                          </button>
                                                        </li>
                                                      </div>
                                                      {isOpenUser && (
                                                        <li
                                                          className="user-detailsContainer show"
                                                          style={{
                                                            listStyle: "none",
                                                          }}
                                                        >
                                                          <ul className="inner-list">
                                                            {Object.entries(
                                                              user
                                                            ).map(
                                                              ([
                                                                key,
                                                                value,
                                                              ]) => {
                                                                if (key === "__v" || key === "baileys_port") return null;
                                                                const translatedKey =
                                                                  translationMap[
                                                                    key
                                                                  ] || key;
                                                                return (
                                                                  <li key={`user-${user.username}-${key}`}>
                                                                    <span>
                                                                      <strong>
                                                                        {
                                                                          translatedKey
                                                                        }
                                                                        :
                                                                      </strong>{" "}
                                                                      {renderValue(
                                                                        value,
                                                                        key
                                                                      )}
                                                                    </span>
                                                                  </li>
                                                                );
                                                              }
                                                            )}
                                                          </ul>
                                                        </li>
                                                      )}
                                                    </React.Fragment>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <li
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  fontStyle: "italic",
                                                }}
                                              >
                                                No hay Usuarios Disponibles
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                }}
              >
                No se encontraron negocios...
              </p>
            )}
            <div style={{ padding: "2rem 0 0 0" }} className="button-container">
              <button onClick={handleRegisterUser}>Registrar usuario</button>
            </div>
          </>
        )}
      </div>

      {/* Modal para editar el asistente */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Asistente</h3>
            <form>
              {Object.entries(assistantEditData).map(([key, value]) => {
                // Skip rendering for specific keys
                if (
                  key === '__v' || 
                  key === 'baileys_port' || 
                  key === 'assistant_id' ||
                  key === 'assistant_knowledge_base' ||
                  key === 'whitelist' ||
                  key === '_id' ||  // Add this line to skip the ID
                  (key === 'assistant_knowledge_base' && value === 'undefined') ||
                  (Array.isArray(value) && value.length === 0)
                ) {
                  return null;
                }
                
                const translatedKey = translationMap[key] || key;
                return (
                  <label key={key}>
                    {translatedKey}:
                    {key === 'active' ? (
                      <select
                        name={key}
                        value={value?.toString() || ""}
                        onChange={handleAssistantInputChange}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    ) : key === 'intelligenceLevel' || key === 'responseLength' || key === 'responseSpeed' ? (
                      <select
                        name={key}
                        value={value?.toString() || ""}
                        onChange={handleAssistantInputChange}
                      >
                        {key === 'intelligenceLevel' && (
                          <>
                            <option value="baja">Bajo</option>
                            <option value="media">Medio</option>
                            <option value="corta">Alto</option>
                          </>
                        )}
                        {key === 'responseLength' && (
                          <>
                            <option value="cortas">Corto</option>
                            <option value="medias">Medio</option>
                            <option value="largas">Largo</option>
                          </>
                        )}
                        {key === 'responseSpeed' && (
                          <>
                            <option value="lenta">Lento</option>
                            <option value="media">Normal</option>
                            <option value="rapida">Rápido</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={key.includes('Hours') ? "number" : "text"}
                        name={key}
                        value={value?.toString() || ""}
                        onChange={handleAssistantInputChange}
                        min={key.includes('Hours') ? "0" : undefined}
                        max={key.includes('Hours') ? "24" : undefined}
                      />
                    )}
                  </label>
                );
              })}
            </form>
            <button onClick={handleAssistantUpdate} disabled={!isFormValid}>
              Guardar
            </button>
            <button onClick={handleCloseModal}>Cancelar</button>
          </div>
        </div>
      )}


    </div>
  );
};
export default UserList;

