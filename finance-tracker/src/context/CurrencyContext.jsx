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

  // Fetch on mount
  useEffect(() => {
    fetchActiveCurrency();
  }, []);

  // Poll for currency changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveCurrency();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency, loading, fetchActiveCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}