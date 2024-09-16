import React, { useState, useEffect, useRef } from "react";
import { getTransactionById } from "../../dataApi";
import { Chart, registerables } from "chart.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTransition, animated } from "@react-spring/web";

Chart.register(...registerables);

interface DataGraphicsProps {
  businessId: Record<string, any>;
  database: string;
  fetchBusinessInfo: (businessId: string) => void;
}

const DataGraphics: React.FC<DataGraphicsProps> = ({
  businessId,
  database,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const hasFetchedTransactions = useRef(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonthInterval, setSelectedMonthInterval] = useState<number>(
    new Date().getMonth() - (new Date().getMonth() % 6)
  ); // 6 meses
  const [yearForYearChart, setYearForYearChart] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const today = new Date();
    const firstDayOfWeek = today.getDate() - today.getDay(); // Obtener el primer día de la semana actual
    return new Date(today.setDate(firstDayOfWeek));
  });
  const [selectedGraph, setSelectedGraph] = useState("year"); // Controla qué gráfica se muestra

  useEffect(() => {
    if (Object.keys(businessId).length > 0 && !hasFetchedTransactions.current) {
      fetchTransactions();
      hasFetchedTransactions.current = true;
    }
  }, [businessId]);

  const fetchTransactions = async () => {
    setLoading(true);
    let allTransactions: any[] = [];

    try {
      await Promise.all(
        Object.keys(businessId).map(async (id) => {
          const fetchedTransactions = await getTransactionById(id, database);
          if (fetchedTransactions && Array.isArray(fetchedTransactions)) {
            allTransactions = [...allTransactions, ...fetchedTransactions];
          } else if (
            typeof fetchedTransactions === "object" &&
            fetchedTransactions !== null
          ) {
            allTransactions.push(fetchedTransactions);
          }
        })
      );
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const businessName =
      businessId[transaction.business_id]?.businessInfo?.business_name?.toLowerCase() ||
      "desconocido";
  
    // Filtrar por tipo 'subtract' y también por el nombre del negocio
    return (
      transaction.transaction_type === "subtract" &&
      businessName.includes(searchQuery.toLowerCase())
    );
  });
  

  const groupTransactionsBy = (interval: "year" | "month" | "week") => {
    const filteredSubtractTransactions = transactions.filter(
      (transaction) => transaction.transaction_type === "subtract"
    );

    if (interval === "year") {
      // Filtrar transacciones solo para el año seleccionado (yearForYearChart)
      const yearTransactions = filteredSubtractTransactions.filter(
        (transaction) =>
          new Date(transaction.transaction_date).getFullYear() ===
          yearForYearChart
      );

      if (yearTransactions.length === 0) {
        // Si no hay transacciones para ese año, mostrar un valor por defecto
        return [{ name: yearForYearChart.toString(), value: 0 }];
      }

      // Agrupar las transacciones del año
      return yearTransactions.reduce((acc: any[], transaction) => {
        const year = new Date(transaction.transaction_date).getFullYear();
        const existingYear = acc.find((item) => item.name === year.toString());
        if (existingYear) {
          existingYear.value += transaction.transaction_ammount;
        } else {
          acc.push({
            name: year.toString(),
            value: transaction.transaction_ammount,
          });
        }
        return acc;
      }, []);
    }

    // Mantén el comportamiento existente para el intervalo de meses
    if (interval === "month") {
      const monthsInInterval = Array.from({ length: 6 }, (_, i) => {
        const month = ((selectedMonthInterval + i) % 12) + 1;
        let year = selectedYear;

        // Si el mes calculado es menor o igual al mes inicial, estamos en el mismo año,
        // pero si es mayor al mes inicial, significa que hemos pasado al año siguiente.
        if (month <= selectedMonthInterval) {
          year += 1;
        }

        return { name: `${year}-${month}`, value: 0 };
      });

      const grouped = filteredSubtractTransactions.reduce(
        (acc: any, transaction) => {
          const date = new Date(transaction.transaction_date);
          const month = date.getMonth() + 1;

          if (
            date.getFullYear() === selectedYear &&
            month >= selectedMonthInterval + 1 &&
            month <= selectedMonthInterval + 6
          ) {
            const key = `${date.getFullYear()}-${month}`;
            if (!acc[key]) {
              acc[key] = 0;
            }
            acc[key] += transaction.transaction_ammount;
          }

          return acc;
        },
        {}
      );

      monthsInInterval.forEach((monthObj) => {
        if (grouped[monthObj.name]) {
          monthObj.value = grouped[monthObj.name];
        }
      });

      return monthsInInterval;
    }

    if (interval === "week") {
      const daysInWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(selectedWeekStart);
        date.setDate(date.getDate() + i); // Obtener cada día de la semana
        return { name: date.toISOString().split("T")[0], value: 0 }; // Formato YYYY-MM-DD
      });

      const grouped = filteredSubtractTransactions.reduce(
        (acc: any, transaction) => {
          const date = new Date(transaction.transaction_date)
            .toISOString()
            .split("T")[0]; // Formato YYYY-MM-DD
          const startOfWeek = selectedWeekStart.toISOString().split("T")[0]; // Formato YYYY-MM-DD
          const endOfWeek = new Date(selectedWeekStart);
          endOfWeek.setDate(endOfWeek.getDate() + 6); // Último día de la semana actual

          if (
            date >= startOfWeek &&
            date <= endOfWeek.toISOString().split("T")[0]
          ) {
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += transaction.transaction_ammount;
          }
          return acc;
        },
        {}
      );

      daysInWeek.forEach((dayObj) => {
        if (grouped[dayObj.name]) {
          dayObj.value = grouped[dayObj.name];
        }
      });

      return daysInWeek; // Retorna los días de la semana con sus valores
    }
  };

  const getMonthName = (monthNumber: number) => {
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return monthNames[monthNumber - 1]; // Los meses en JavaScript van de 0 a 11
  };

  const formatWeekRange = (startOfWeek: Date) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const start = `${startOfWeek.getDate()} de ${getMonthName(
      startOfWeek.getMonth() + 1
    )}`;
    const end = `${endOfWeek.getDate()} de ${getMonthName(
      endOfWeek.getMonth() + 1
    )}`;

    return `del ${start} al ${end}`;
  };

  const formatMonthInterval = (startMonth: number, year: number) => {
    const endMonth = (startMonth + 5) % 12 || 12; // Calcular el último mes del intervalo
    let endYear = year;

    // Si el último mes es menor que el primero, estamos en el siguiente año
    if (endMonth < startMonth) {
      endYear = year + 1;
    }

    // Formatear los meses en nombres
    const startMonthName = new Date(year, startMonth - 1).toLocaleString(
      "default",
      { month: "long" }
    );
    const endMonthName = new Date(endYear, endMonth - 1).toLocaleString(
      "default",
      { month: "long" }
    );

    return `${startMonthName} ${year} - ${endMonthName} ${endYear}`;
  };

  const handleCurrentMonthInterval = () => {
    const currentMonth = new Date().getMonth();
    const newMonthInterval = currentMonth - (currentMonth % 6); // Reset al intervalo de 6 meses
    setSelectedMonthInterval(newMonthInterval);
    setSelectedYear(new Date().getFullYear()); // Restablece el año actual
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Reset a la semana actual (primer día de la semana)
    setSelectedWeekStart(currentWeekStart);
  };

  const handleCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    if (yearForYearChart !== currentYear) {
      setYearForYearChart(currentYear); // Asegura que se actualice solo si es diferente
    }
  };

  const handlePreviousYear = () => {
    setYearForYearChart((prevYear) => prevYear - 1);
  };

  const handleNextYear = () => {
    setYearForYearChart((prevYear) => prevYear + 1);
  };

  const handlePreviousInterval = () => {
    setSelectedMonthInterval((prev) => {
      if (prev === 0) {
        // Si estás en los primeros 6 meses, retrocede el año
        setSelectedYear((prevYear) => prevYear - 1);
        return 6; // Volver a la segunda mitad del año anterior
      }
      return prev - 6;
    });
  };

  const handleNextInterval = () => {
    setSelectedMonthInterval((prev) => {
      if (prev === 6) {
        // Si estás en la segunda mitad del año (julio a diciembre), avanza al próximo año
        setSelectedYear((prevYear) => prevYear + 1);
        return 0; // Cambia a la primera mitad del próximo año
      }
      return prev + 6; // Avanzar a la segunda mitad del mismo año
    });
  };

  const handlePreviousWeek = () => {
    setSelectedWeekStart((prevWeekStart) => {
      const previousWeek = new Date(prevWeekStart);
      previousWeek.setDate(previousWeek.getDate() - 7); // Retroceder 7 días
      return previousWeek;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekStart((prevWeekStart) => {
      const nextWeek = new Date(prevWeekStart);
      nextWeek.setDate(nextWeek.getDate() + 7); // Avanzar 7 días
      return nextWeek;
    });
  };

  // Función para cambiar la gráfica seleccionada
  const handleGraphChange = (graphType: string) => {
    setSelectedGraph(graphType);
  };

  // Transiciones para cambiar entre gráficos con animación de deslizamiento
  const transitions = useTransition(selectedGraph, {
    from: { opacity: 0, transform: "translate3d(100%,0,0)" },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    leave: { opacity: 0, transform: "translate3d(-50%,0,0)" },
    config: { duration: 500 },
  });

  return (
    <div>
      <div className="button-container">
        <button
          className="home-graphicsButton"
          onClick={toggleVisibility}
          disabled={loading}
        >
          {loading
            ? "Cargando..."
            : isVisible
            ? "Ocultar transacciones"
            : "Mostrar transacciones"}
        </button>
      </div>
      {isVisible && (
        <>
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
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"

            />
          </div>

          {loading ? (
            <p>Cargando transacciones...</p>
          ) : (
            <table>
              <thead >
                <tr >
                  <th style={{fontSize:'1rem'}}>Nombre del Negocio</th>
                  <th style={{fontSize:'1rem'}}>Business ID</th>
                  <th style={{fontSize:'1rem'}}>Fecha de Transacción</th>
                  <th style={{fontSize:'1rem'}}>Tipo de Transacción</th>
                  <th style={{fontSize:'1rem'}}>Monto de Transacción</th>
                  <th style={{fontSize:'1rem'}}>Fuente de Transacción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => {
                    if (!transaction) {
                      return null;
                    }


                    const businessName =
                      businessId[transaction.business_id]?.businessInfo
                        ?.business_name || "Desconocido";

                    return (
                      <tr key={index} className="transactions-table">
                        <td>{businessName}</td>
                        <td>{transaction.business_id}</td>
                        <td>
                          {new Date(
                            transaction.transaction_date
                          ).toLocaleDateString()}
                        </td>
                        <td>{transaction.transaction_type}</td>
                        <td>{transaction.transaction_ammount}</td>
                        <td>{transaction.transaction_source}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>No se encontraron transacciones.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div>
            {/* Botones para seleccionar entre gráficos */}
            <div className="button-graphicsContainer">
              <button
                className="anual-button"
                onClick={() => handleGraphChange("year")}
              >
                Gasto Anual
              </button>
              <button
                className="monthly-button"
                onClick={() => handleGraphChange("month")}
              >
                Gasto Mensual
              </button>
              <button
                className="weekly-button"
                onClick={() => handleGraphChange("week")}
              >
                Gasto Semanal
              </button>
            </div>

            {/* Renderizado condicional de las gráficas con animación */}
            {transitions((style, item) =>
              item === "year" ? (
                <animated.div style={style}>
                  {/* Gráfica por año */}
                  <div>
                    <h3>Transacciones por año</h3>
                    <button onClick={handlePreviousYear} className="alt-button">Año anterior</button>
                    <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>{yearForYearChart}</span>
                    <button onClick={handleNextYear} className="alt-button">Año siguiente</button>
                    <button onClick={handleCurrentYear} className="alt-button">
                      Volver al año actual
                    </button>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={groupTransactionsBy("year")}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </animated.div>
              ) : item === "month" ? (
                <animated.div style={style}>
                  {/* Gráfica por mes */}
                  <div>
                    <h3>Transacciones por mes</h3>
                    <button onClick={handlePreviousInterval} className="alt-button">
                      6 meses anteriores
                    </button>
                    <span  style={{fontWeight:'bold'}}>
                      {formatMonthInterval(
                        selectedMonthInterval + 1,
                        selectedYear
                      )}
                    </span>
                    <button onClick={handleNextInterval} className="alt-button">
                      6 meses siguientes
                    </button>
                    <button onClick={handleCurrentMonthInterval}  className="alt-button">
                      Volver al intervalo actual
                    </button>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={groupTransactionsBy("month")}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </animated.div>
              ) : (
                <animated.div style={style}>
                  {/* Gráfica por semana */}
                  <div>
                    <h3>Transacciones por día (intervalo semanal)</h3>
                    <button onClick={handlePreviousWeek} className="alt-button">
                      Semana anterior
                    </button>
                    <span  style={{fontWeight:'bold'}}>{formatWeekRange(selectedWeekStart)}</span>
                    <button onClick={handleNextWeek} className="alt-button">Semana siguiente</button>
                    <button onClick={handleCurrentWeek} className="alt-button">
                      Volver a la semana actual
                    </button>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={groupTransactionsBy("week")}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </animated.div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DataGraphics;
