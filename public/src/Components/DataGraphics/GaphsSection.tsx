import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import loadingGif from "../../img/loading.gif";

interface GraphsSectionProps {
  groupedByBusiness: Record<string, any>;
  currentDatabase: string;
  businessNames: Record<string, string>;
  transactions: any[];
  onVisibilityChange: (isVisible: boolean) => void;
  fetchTransactions: () => Promise<void>;
  isVisible: boolean;
}

const GraphsSection: React.FC<GraphsSectionProps> = ({
  groupedByBusiness,
  currentDatabase,
  businessNames,
  transactions,
  onVisibilityChange,
  fetchTransactions,
  isVisible,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<"month" | "week">("month");
  const [selectedMonthInterval, setSelectedMonthInterval] = useState<number>(
    new Date().getMonth() - (new Date().getMonth() % 6)
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const today = new Date();
    const firstDayOfWeek = today.getDate() - today.getDay();
    return new Date(today.setDate(firstDayOfWeek));
  });
  const [inputDate, setInputDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const filterTransactionsByDate = useCallback((transactionsToFilter: any[]) => {
    if (!inputDate) return transactionsToFilter;
    const date = new Date(inputDate);
    return transactionsToFilter.filter((transaction) => {
      const transactionDate = new Date(
        transaction.transaction_date.$date || transaction.transaction_date
      );
      return (
        transactionDate.getFullYear() === date.getFullYear() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getDate() === date.getDate()
      );
    });
  }, [inputDate]);

  const memoizedFilteredTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions);
  }, [transactions, filterTransactionsByDate]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      fetchTransactions().then(() => {
        setFilteredTransactions([]);
        setIsLoading(false);
      });
    }
  }, [isVisible, currentDatabase, fetchTransactions]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setFilteredTransactions(memoizedFilteredTransactions);
      setIsLoading(false);
    }
  }, [isVisible, memoizedFilteredTransactions, currentDatabase]);

  const toggleVisibility = () => {
    onVisibilityChange(!isVisible);
  };

  const memoizedGroupTransactionsBy = useCallback((interval: "month" | "week") => {
    const filteredSubtractTransactions = memoizedFilteredTransactions.filter(
      (transaction) => transaction.transaction_type === "subtract"
    );

    if (interval === "month") {
      const monthsInInterval = Array.from({ length: 6 }, (_, i) => {
        const month = ((selectedMonthInterval + i) % 12) + 1;
        let year = selectedYear;

        if (month <= selectedMonthInterval) {
          year += 1;
        }

        return { name: `${year}-${month}`, subtracts: 0 };
      });

      filteredSubtractTransactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();
        const monthIndex = monthsInInterval.findIndex(
          (item) => item.name === `${year}-${month}`
        );
        if (monthIndex !== -1) {
          monthsInInterval[monthIndex].subtracts += transaction.transaction_ammount;
        }
      });

      return monthsInInterval;
    } else if (interval === "week") {
      const daysInWeek = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(selectedWeekStart);
        day.setDate(day.getDate() + i);
        return {
          name: day.toISOString().split("T")[0],
          subtracts: 0,
        };
      });

      filteredSubtractTransactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        const dayIndex = daysInWeek.findIndex(
          (item) => item.name === transactionDate.toISOString().split("T")[0]
        );
        if (dayIndex !== -1) {
          daysInWeek[dayIndex].subtracts += transaction.transaction_ammount;
        }
      });

      return daysInWeek;
    }

    return [];
  }, [memoizedFilteredTransactions, selectedMonthInterval, selectedYear, selectedWeekStart]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      updateGraphBasedOnDate(date);
    }
  };

  const clearDateInput = () => {
    setSelectedDate("");
    updateGraphBasedOnDate(new Date());
  };

  const updateGraphBasedOnDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    setSelectedYear(year);
    setSelectedMonthInterval(month - (month % 6));
    setSelectedWeekStart(weekStart);
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const formatMonthInterval = (startMonth: number, year: number) => {
    const endMonth = (startMonth + 5) % 12 || 12;
    const endYear = startMonth + 5 > 12 ? year + 1 : year;
    return `${getMonthName(startMonth)} ${year} - ${getMonthName(endMonth)} ${endYear}`;
  };

  const handleCurrentMonthInterval = () => {
    const currentMonth = new Date().getMonth();
    const newMonthInterval = currentMonth - (currentMonth % 6);
    setSelectedMonthInterval(newMonthInterval);
    setSelectedYear(new Date().getFullYear());
    clearDateInput();
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    setSelectedWeekStart(currentWeekStart);
    clearDateInput();
  };

  const handlePreviousInterval = () => {
    setSelectedMonthInterval((prevInterval) => {
      const newInterval = prevInterval - 6;
      if (newInterval < 0) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 12 + newInterval;
      }
      return newInterval;
    });
  };

  const handleNextInterval = () => {
    setSelectedMonthInterval((prevInterval) => {
      const newInterval = prevInterval + 6;
      if (newInterval >= 12) {
        setSelectedYear((prevYear) => prevYear + 1);
        return newInterval - 12;
      }
      return newInterval;
    });
  };

  const handlePreviousWeek = () => {
    setSelectedWeekStart((prevWeekStart) => {
      const newWeekStart = new Date(prevWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      return newWeekStart;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekStart((prevWeekStart) => {
      const newWeekStart = new Date(prevWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      return newWeekStart;
    });
  };

  const transitions = useTransition(selectedGraph, {
    from: { opacity: 0, transform: "translateY(50px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-50px)", position: "absolute" },
    config: { tension: 280, friction: 60 },
  });

  const LoadingSpinner = () => (
    <div className="loading-spinner" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <img src={loadingGif} alt="Loading..." />
    </div>
  );

  return (
    <div className="graphs-section">
      <div className="button-container">
        <button
          className="home-graphicsButton"
          onClick={toggleVisibility}
        >
          {isVisible ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </button>
      </div>

      {isVisible && (
        <>
          <div className="button-graphicsContainer">
            <button
              className="monthly-button"
              onClick={() => setSelectedGraph("month")}
            >
              Gasto Mensual
            </button>
            <button
              className="weekly-button"
              onClick={() => setSelectedGraph("week")}
            >
              Gasto Semanal
            </button>
          </div>

          <div className="date-input-container">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="search-input"
            />
            <button onClick={clearDateInput} className="clear-date-btn">X</button>
          </div>

          <div
            style={{
              position: "relative",
              height: "450px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              transitions((style, item) => (
                <animated.div
                  style={{ ...style, position: "absolute", width: "100%" }}
                >
                  {item === "month" && (
                    <div>
                      <h3>Transacciones por mes</h3>
                      <button
                        onClick={handlePreviousInterval}
                        className="alt-button"
                      >
                        6 meses anteriores
                      </button>
                      <span style={{ fontWeight: "bold" }}>
                        {formatMonthInterval(
                          selectedMonthInterval + 1,
                          selectedYear
                        )}
                      </span>
                      <button onClick={handleNextInterval} className="alt-button">
                        6 meses siguientes
                      </button>
                      <button
                        onClick={handleCurrentMonthInterval}
                        className="alt-button"
                      >
                        Volver al intervalo actual
                      </button>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={memoizedGroupTransactionsBy(selectedGraph)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ angle: -90, position: "insideLeft" }} />
                          <Tooltip
                            formatter={(
                              value: number,
                              name: string,
                              props: any
                            ) => [`${value} subtracts`, "Amount"]}
                          />
                          <Legend />
                          <Bar
                            dataKey="subtracts"
                            name="Subtracts"
                            fill="#82ca9d"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {item === "week" && (
                    <div>
                      <h3>Transacciones por día (intervalo semanal)</h3>
                      <button onClick={handlePreviousWeek} className="alt-button">
                        Semana anterior
                      </button>
                      <span style={{ fontWeight: "bold" }}>
                        {formatWeekRange(selectedWeekStart)}
                      </span>
                      <button onClick={handleNextWeek} className="alt-button">
                        Semana siguiente
                      </button>
                      <button onClick={handleCurrentWeek} className="alt-button">
                        Volver a la semana actual
                      </button>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={memoizedGroupTransactionsBy(selectedGraph)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ angle: -90, position: "insideLeft" }} />
                          <Tooltip
                            formatter={(
                              value: number,
                              name: string,
                              props: any
                            ) => [`${value} subtracts`, "Amount"]}
                          />
                          <Legend />
                          <Bar
                            dataKey="subtracts"
                            name="Subtracts"
                            fill="#ffc658"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </animated.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GraphsSection;
