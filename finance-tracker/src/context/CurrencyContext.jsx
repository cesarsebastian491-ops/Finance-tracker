import { createContext, useState, useEffect } from "react";

export const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const saved = localStorage.getItem("mainCurrency") || "PHP";
    const [mainCurrency, setMainCurrency] = useState(saved);

    useEffect(() => {
        localStorage.setItem("mainCurrency", mainCurrency);
    }, [mainCurrency]);

    return (
        <CurrencyContext.Provider value={{ mainCurrency, setMainCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}