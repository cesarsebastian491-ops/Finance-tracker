import { useState, useRef, useEffect } from "react";
import { useContext } from "react";
import { CurrencyContext } from "../context/CurrencyContext";

export default function CurrencyMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { mainCurrency, setMainCurrency } = useContext(CurrencyContext);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(currency) {
    setMainCurrency(currency);
    setOpen(false);
  }

  return (
    <div className="currency-wrapper" ref={ref}>
      <button className="button currency-btn" onClick={() => setOpen(!open)}>
        Currency ({mainCurrency})
      </button>

      {open && (
        <div className="currency-popup">
          <div className="currency-section">
            <label>Select Currency</label>
            <select
              value={mainCurrency}
              onChange={(e) => handleSelect(e.target.value)}
            >
              <option value="PHP">PHP (₱)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}