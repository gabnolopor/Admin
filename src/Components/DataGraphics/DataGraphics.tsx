import React, { useState, useEffect, useMemo } from "react";
import loadingGif from "../../img/loading.gif"; 

interface DataGraphicsProps {
  businessId: Record<string, any>;
  database: string;
  transactions: any[];
  businessNames: Record<string, string>;
  onVisibilityChange: (isVisible: boolean) => void;
  fetchTransactions: () => Promise<void>;
  isVisible: boolean;
}

const DataGraphics: React.FC<DataGraphicsProps> = ({
  businessId,
  database,
  transactions,
  businessNames,
  onVisibilityChange,
  fetchTransactions,
  isVisible,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [visibleTransactions, setVisibleTransactions] = useState<Record<string, any[]>>({});
  const ITEMS_PER_PAGE = 20;

  const [isLoading, setIsLoading] = useState(true); 

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!startDate && !endDate) return true;
      const transactionDate = new Date(transaction.transaction_date.$date || transaction.transaction_date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, startDate, endDate]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      if (transaction.transaction_type === "subtract") {
        if (!acc[transaction.business_id]) {
          acc[transaction.business_id] = [];
        }
        acc[transaction.business_id].push(transaction);
      }
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredTransactions]);

  const filteredBusinesses = useMemo(() => {
    return Object.keys(groupedTransactions).filter((id) => {
      const businessName = businessNames[id]?.toLowerCase() || "";
      const hasMatchingName = businessName.includes(searchQuery.toLowerCase());
      const hasTransactions = groupedTransactions[id].length > 0;
      return (searchQuery === "" || hasMatchingName) && hasTransactions;
    });
  }, [groupedTransactions, businessNames, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (inputDate.getFullYear() <= 2150) {
      setStartDate(e.target.value);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (inputDate.getFullYear() <= 2150) {
      setEndDate(e.target.value);
    }
  };

  const clearStartDate = () => {
    setStartDate('');
  };

  const clearEndDate = () => {
    setEndDate('');
  };

  const handleBusinessClick = (businessId: string) => {
    setVisibleTransactions(prev => ({
      ...prev,
      [businessId]: prev[businessId] 
        ? undefined 
        : groupedTransactions[businessId].slice(0, ITEMS_PER_PAGE)
    }));
  };

  const formatDate = (dateString: string | { $date: string | number }) => {
    let date: Date;
    if (typeof dateString === "object" && "$date" in dateString) {
      date = new Date(dateString.$date);
    } else if (typeof dateString === "string") {
      date = new Date(dateString);
    } else {
      return "Invalid Date";
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>, businessId: string) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      const currentLength = visibleTransactions[businessId]?.length || 0;
      const newTransactions = groupedTransactions[businessId].slice(
        currentLength,
        currentLength + ITEMS_PER_PAGE
      );
      if (newTransactions.length > 0) {
        setVisibleTransactions(prev => ({
          ...prev,
          [businessId]: [...(prev[businessId] || []), ...newTransactions]
        }));
      }
    }
  };

  const toggleVisibility = () => {
    onVisibilityChange(!isVisible);
    if (!isVisible) {
      fetchTransactions();
    }
  };

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true); // Set loading to true when fetching
      fetchTransactions().then(() => {
        setVisibleTransactions({});
        setIsLoading(false); // Set loading to false when done
      });
    }
  }, [isVisible, database, fetchTransactions]);

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <img src={loadingGif} alt="Loading..." />
    </div>
  );

  return (
    <div className="data-graphics-container">
      <div className="button-container">
        <button
          className="home-graphicsButton"
          onClick={toggleVisibility}
        >
          {isVisible ? "Ocultar Transacciones" : "Mostrar Transacciones"}
        </button>
      </div>

      {isVisible && (
        <>
          <div className="search-container">
            <div className="date-input-container">
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max="2150-12-31"
                className="search-input"
              />
              <button onClick={clearStartDate} className="clear-date-btn">X</button>
            </div>
            <div className="date-input-container">
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                max="2150-12-31"
                className="search-input"
              />
              <button onClick={clearEndDate} className="clear-date-btn">X</button>
            </div>
            <input
              type="text"
              placeholder="Buscar negocio por nombre..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {isLoading ? (
            <div style={{ position: "relative", height: "450px", width: "100%", margin: "0 auto" }}>
              <LoadingSpinner />
            </div>
          ) : (
            <table className="data-graphics-table">
              <thead>
                <tr>
                  <th colSpan={3}>Información de Transacciones</th>
                </tr>
                <tr>
                  <th>Nombre del Negocio</th>
                  <th>Business ID</th>
                  <th>Número de Transacciones (Subtract)</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((businessId) => (
                  <React.Fragment key={businessId}>
                    <tr className="data-graphics-row">
                      <td
                        onClick={() => handleBusinessClick(businessId)}
                        className="data-graphics-clickable-cell"
                      >
                        {businessNames[businessId]}
                      </td>
                      <td>{businessId}</td>
                      <td>{groupedTransactions[businessId].length}</td>
                    </tr>
                    {visibleTransactions[businessId] && (
                      <tr className="data-graphics-details-row">
                        <td colSpan={3} style={{border: 'none'}}>
                          <div className={`data-graphics-details-container ${visibleTransactions[businessId] ? "show" : ""}`}>
                            <div 
                              className="data-graphics-transaction-details"
                              style={{ maxHeight: '300px', overflowY: 'auto' }}
                              onScroll={(e) => handleScroll(e, businessId)}
                            >
                              <table className="data-graphics-inner-table">
                                <thead>
                                  <tr>
                                    <th>Fecha de Transacción</th>
                                    <th>Monto de Transacción</th>
                                    <th>Fuente de Transacción</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visibleTransactions[businessId]?.map((transaction: any, index: number) => (
                                    <tr key={index}>
                                      <td>{formatDate(transaction.transaction_date)}</td>
                                      <td>{transaction.transaction_ammount}</td>
                                      <td>{transaction.transaction_source}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default DataGraphics;
