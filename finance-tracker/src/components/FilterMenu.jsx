import { useState, useRef, useEffect } from "react";
import styles from "./DateFilterMenu.module.css";

export default function FilterMenu({ onApplyFilters, transactions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [dateFilter, setDateFilter] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [specificDate, setSpecificDate] = useState("");

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyDateFilter() {
    const now = new Date();

    if (dateFilter === "7days") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (dateFilter === "1month") {
      const past = new Date();
      past.setMonth(now.getMonth() - 1);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (dateFilter === "1year") {
      const past = new Date();
      past.setFullYear(now.getFullYear() - 1);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (dateFilter === "specific" && specificDate) {
      const target = new Date(specificDate);
      return transactions.filter(t => {
        const d = new Date(t.date);
        return (
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        );
      });
    }

    if (dateFilter === "custom") {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    }

    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }

  function resetFilters() {
    setDateFilter("monthly");
    setCustomStart("");
    setCustomEnd("");
    setSpecificDate("");

    onApplyFilters({
      filtered: applyDateFilter(),
      filterType: "monthly",
      customStart: "",
      customEnd: "",
      specificDate: ""
    });

    setOpen(false);
  }

  return (
    <div className={styles.filterWrapper} ref={ref}>
      <button className={styles.filterButton} onClick={() => setOpen(!open)}>
        Filter
      </button>

      {open && (
        <div className={styles.filterDropdown}>
          <div className={styles.filterSection}>
            <label>Date Filter</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={styles.select}
            >
              <option value="monthly">Monthly (Default)</option>
              <option value="7days">Last 7 Days</option>
              <option value="1month">Last 1 Month</option>
              <option value="1year">Last 1 Year</option>
              <option value="specific">Specific Date</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "specific" && (
            <div className={styles.filterSection}>
              <label>Select Date</label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          )}

          {dateFilter === "custom" && (
            <div className={styles.filterSection}>
              <label>Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={styles.dateInput}
              />

              <label>End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          )}

          <div className={styles.filterActions}>
            <button className={styles.resetBtn} onClick={resetFilters}>
              Reset
            </button>

            <button
              className={styles.applyBtn}
              onClick={() => {
                onApplyFilters({
                  filtered: applyDateFilter(),
                  filterType: dateFilter,
                  customStart,
                  customEnd,
                  specificDate
                });
                setOpen(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}