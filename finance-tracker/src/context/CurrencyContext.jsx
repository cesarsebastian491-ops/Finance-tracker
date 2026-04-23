import { createContext, useState, useEffect } from "react";
import { API_URL } from "../config";

export const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [activeCurrency, setActiveCurrency] = useState({
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    exchangeRate: 56.5,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch active currency from backend
  useEffect(() => {
    const fetchActiveCurrency = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        const token = stored?.access_token;

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/currencies/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const currency = await res.json();
          setActiveCurrency(currency);
        }
      } catch (err) {
        console.error("Error fetching active currency:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}