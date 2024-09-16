import React, { useState, useEffect } from "react";
import { updateAssistant } from "../../dataApi";
interface UserListProps {
  data: Record<string, any>;
  handleUserAndBusinessDelete: (username: string, businessName: string) => void;
  handleUserSelect: (username: string) => void;
  handleOpenEditUserModal: () => void;
  handleBusinessSelect: (businessId: string) => void;
  handleOpenEditBusinessModal: () => void;
  handleRegisterUser: () => void;
  fetchBusinessInfo: (businessId: string) => void;
  currentDatabase: string;
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
};
// Función para renderizar el valor correctamente
const renderValue = (value: any, key?: string) => {
  if (key === "use_case") {
    return (
      <ul style={{ listStyle: "disc", padding: 0 }}>
        {value.map((item: any, index: number) => (
          <li key={index}>{item.label}</li>
        ))}
      </ul>
    );
  } else if (key === "categories") {
    return (
      <ul style={{ listStyle: "disc", padding: 0 }}>
        {value.map((category: any, index: number) => (
          <li key={index}>
            <strong>{translationMap["category_name"]}:</strong>{" "}
            {category.category_name}
            <ul style={{ listStyle: "circle", padding: "0 0 0 1.25rem" }}>
              {category.options.map((option: any, optionIndex: number) => (
                <li key={optionIndex}>
                  <strong>{translationMap["option_name"]}:</strong>{" "}
                  {option.option_name}
                  <ul style={{ listStyle: "none", padding: "0 0 0 1.25rem" }}>
                    <li>
                      <strong>{translationMap["icon"]}:</strong> {option.icon}
                    </li>
                    <li>
                      <strong>{translationMap["description"]}:</strong>{" "}
                      {option.description}
                    </li>
                    <li>
                      <strong>{translationMap["_id"]}:</strong> {option._id}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  } else if (key === "channels") {
    return (
      <ul style={{ listStyle: "disc", padding: 0 }}>
        {value.map((channel: any, index: number) => (
          <li key={index}>
            <strong>{translationMap["channel_name"]}:</strong>{" "}
            {channel.channel_name}
            <ul style={{ listStyle: "circle", padding: "0 0 0 1.25rem" }}>
              <li>
                <strong>{translationMap["active"]}:</strong>{" "}
                {String(channel.active)}
              </li>
              <li>
                <strong>{translationMap["username"]}:</strong>{" "}
                {channel.username}
              </li>
              <li>
                <strong>{translationMap["main_number"]}:</strong>{" "}
                {String(channel.main_number)}
              </li>
              <li>
                <strong>{translationMap["baileys_port"]}:</strong>{" "}
                {channel.baileys_port}
              </li>
              <li>
                <strong>{translationMap["baileys_status"]}:</strong>{" "}
                {String(channel.baileys_status)}
              </li>
            </ul>
          </li>
        ))}
      </ul>
    );
  } else if (Array.isArray(value)) {
    return (
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {value.map((item, index) => (
          <li key={index}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === "object" && value !== null) {
    return (
      <ul style={{ listStyle: "disc", padding: 0 }}>
        {Object.entries(value).map(([key, val]) => (
          <li key={key}>
            <strong>{translationMap[key] || key}:</strong>{" "}
            {renderValue(val, key)}
          </li>
        ))}
      </ul>
    );
  } else {
    return <span>{value.toString()}</span>;
  }
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
}) => {
  const [isUsersVisible, setIsUsersVisible] = useState(false);
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

  const toggleUsersVisibility = () => {
    // Si la tabla se está ocultando, reseteamos los IDs de apertura
    if (isUsersVisible) {
      setOpenBusinessId(null);
      setOpenAssistantId(null);
      setOpenUserId(null);
    }
    // Luego alternamos la visibilidad
    setIsUsersVisible(!isUsersVisible);
  };

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
        console.log(
          openBusinessId,
          assistantId,
          assistantEditData,
          currentDatabase
        ); // Debería mostrar el assistant_id

        await updateAssistant(
          openBusinessId,
          assistantId,
          assistantEditData,
          currentDatabase
        );

        // Actualizar la información del negocio después de guardar
        fetchBusinessInfo(openBusinessId);
        setIsModalOpen(false); // Cerrar el modal después de guardar
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
  const handleAssistantInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setAssistantEditData({
      ...assistantEditData,
      [name]: value,
    });
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

  return (
    <div>
      <div className="button-container">
        <button
          className="home-panelButton"
          onClick={toggleUsersVisibility}
          disabled={loading}
        >
          {loading
            ? "Cargando"
            : isUsersVisible
            ? "Ocultar Negocios"
            : "Mostrar Negocios"}
        </button>
      </div>
      <div>
        {isUsersVisible && (
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
                                              if (key === "assistants")
                                                return null;
                                              const translatedKey =
                                                translationMap[key] || key;
                                              return (
                                                <li key={key}>
                                                  <span>
                                                    <strong>
                                                      {translatedKey}:
                                                    </strong>
                                                    <ul className="inner-list">
                                                      <li>
                                                        {renderValue(
                                                          value,
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
                                                    assistant._id;
                                                  const circleColor =
                                                    assistant.active
                                                      ? "green"
                                                      : "red";
                                                  return (
                                                    <React.Fragment
                                                      key={assistant._id}
                                                    >
                                                      <div className="assistant-controller">
                                                        <li
                                                          className="clickable-text"
                                                          onClick={() =>
                                                            handleAssistantClick(
                                                              assistant._id
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
                                                            {Object.entries(
                                                              assistant
                                                            ).map(
                                                              ([
                                                                key,
                                                                value,
                                                              ]) => {
                                                                if (
                                                                  key === "_id"
                                                                )
                                                                  return null;
                                                                const translatedKey =
                                                                  translationMap[
                                                                    key
                                                                  ] || key;
                                                                return (
                                                                  <li key={key}>
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
                                                    <React.Fragment
                                                      key={user.username}
                                                    >
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
                                                            onClick={() => {
                                                              handleUserSelect(
                                                                user.username
                                                              );
                                                              handleOpenEditUserModal();
                                                            }}
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
                                                                const translatedKey =
                                                                  translationMap[
                                                                    key
                                                                  ] || key;
                                                                return (
                                                                  <li key={key}>
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
              <label>
                Nombre:
                <input
                  type="text"
                  name="name"
                  value={assistantEditData.name || ""}
                  onChange={handleAssistantInputChange}
                />
              </label>
              <label>
                Descripción:
                <input
                  type="text"
                  name="description"
                  value={assistantEditData.description || ""}
                  onChange={handleAssistantInputChange}
                />
              </label>
              <label>
                Instrucciones:
                <input
                  type="text"
                  name="instructions"
                  value={assistantEditData.instructions || ""}
                  onChange={handleAssistantInputChange}
                />
              </label>
              <label>
                Nivel de Inteligencia:
                <select
                  name="intelligenceLevel"
                  value={assistantEditData.intelligenceLevel || ""}
                  onChange={handleAssistantInputChange}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </label>

              <label>
                Longitud de Respuesta:
                <select
                  name="responseLength"
                  value={assistantEditData.responseLength || ""}
                  onChange={handleAssistantInputChange}
                >
                  <option value="cortas">Cortas</option>
                  <option value="medias">Medias</option>
                  <option value="largas">Largas</option>
                </select>
              </label>
              <label>
                Velocidad de respuesta:
                <select
                  name="responseSpeed"
                  value={assistantEditData.responseSpeed || ""}
                  onChange={handleAssistantInputChange}
                >
                  <option value="lenta">Lenta</option>
                  <option value="media">Media</option>
                  <option value="rapida">Rápida</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>
                  Inicio Horario Laboral:
                  <input
                    type="number"
                    name="workingHoursStart"
                    value={assistantEditData.workingHoursStart || "0"}
                    onChange={handleAssistantInputChange}
                    min="1"
                    max="24"
                    style={{ width: "80px" }}
                  />
                </label>

                <label>
                  Fin Horario Laboral:
                  <input
                    type="number"
                    name="workingHoursEnd"
                    value={assistantEditData.workingHoursEnd || ""}
                    onChange={handleAssistantInputChange}
                    min="1"
                    max="24"
                    style={{ width: "80px" }}
                  />
                </label>
              </div>

              <label>
                Estado:
                <select
                  name="active"
                  value={assistantEditData.active || ""}
                  onChange={handleAssistantInputChange}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </label>
            </form>

            {/* El botón de guardar se deshabilita si el formulario no es válido */}
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
