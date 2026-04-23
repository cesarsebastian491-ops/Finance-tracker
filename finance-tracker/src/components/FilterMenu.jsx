import { useState, useRef, useEffect } from "react";
import styles from "./DateFilterMenu.module.css";

function toLocalDateKey(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FilterMenu({ onApplyFilters, transactions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [dateFilter, setDateFilter] = useState("all");
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

  function applyDateFilter({
    selectedDateFilter = dateFilter,
    selectedCustomStart = customStart,
    selectedCustomEnd = customEnd,
    selectedSpecificDate = specificDate,
  } = {}) {
    const now = new Date();

    if (selectedDateFilter === "7days") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (selectedDateFilter === "1month") {
      const past = new Date();
      past.setMonth(now.getMonth() - 1);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (selectedDateFilter === "1year") {
      const past = new Date();
      past.setFullYear(now.getFullYear() - 1);
      return transactions.filter(t => new Date(t.date) >= past);
    }

    if (selectedDateFilter === "specific" && selectedSpecificDate) {
      const targetKey = toLocalDateKey(selectedSpecificDate);
      return transactions.filter(t => {
        return toLocalDateKey(t.date) === targetKey;
      });
    }

    if (selectedDateFilter === "custom" && selectedCustomStart && selectedCustomEnd) {
      const start = new Date(selectedCustomStart);
      start.setHours(0, 0, 0, 0);

      const end = new Date(selectedCustomEnd);
      end.setHours(23, 59, 59, 999);

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
    const resetState = {
      selectedDateFilter: "all",
      selectedCustomStart: "",
      selectedCustomEnd: "",
      selectedSpecificDate: "",
    };

    setDateFilter(resetState.selectedDateFilter);
    setCustomStart(resetState.selectedCustomStart);
    setCustomEnd(resetState.selectedCustomEnd);
    setSpecificDate(resetState.selectedSpecificDate);

    onApplyFilters({
      filtered: transactions,
      filterType: "all",
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
              <option value="all">All Time (Default)</option>
              <option value="monthly">This Month</option>
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
                const nextFiltered = applyDateFilter();

                onApplyFilters({
                  filtered: nextFiltered,
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