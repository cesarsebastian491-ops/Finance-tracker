import React, { useState } from "react";
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

export default function DateFilterMenu({ data, onApply }) {
    const [open, setOpen] = useState(false);
    const [filterType, setFilterType] = useState("all");
    const [customStart, setCustomStart] = useState(null);
    const [customEnd, setCustomEnd] = useState(null);
    const [specificDate, setSpecificDate] = useState(null);

    function applyFilter() {
        let filtered = data;
        const now = new Date();

        if (filterType === "7days") {
            const past = new Date(now);
            past.setDate(now.getDate() - 7);
            filtered = data.filter(t => new Date(t.date) >= past);
        }

        if (filterType === "1month") {
            const past = new Date(now);
            past.setDate(now.getDate() - 30);
            filtered = data.filter(t => new Date(t.date) >= past);
        }

        if (filterType === "1year") {
            const past = new Date(now);
            past.setFullYear(now.getFullYear() - 1);
            filtered = data.filter(t => new Date(t.date) >= past);
        }

        if (filterType === "specific" && specificDate) {
            filtered = data.filter(t => {
                return toLocalDateKey(t.date) === toLocalDateKey(specificDate);
            });
        }

        if (filterType === "custom" && customStart && customEnd) {
            filtered = data.filter(t => {
                const d = new Date(t.date);

                const start = new Date(customStart);
                start.setHours(0, 0, 0, 0);

                const end = new Date(customEnd);
                end.setHours(23, 59, 59, 999);

                return d >= start && d <= end;
            });
        }

        onApply({ filtered, filterType, customStart, customEnd, specificDate });
        setOpen(false);
    }

    function resetFilter() {
        setFilterType("all");
        setCustomStart(null);
        setCustomEnd(null);
        setSpecificDate(null);

        onApply({
            filtered: data,
            filterType: "all",
            customStart: null,
            customEnd: null,
            specificDate: null
        });

        setOpen(false);
    }

    return (
        <div className={styles.filterWrapper}>
            <button className={styles.filterButton} onClick={() => setOpen(!open)}>
                Filter
            </button>

            {open && (
                <div className={styles.filterDropdown}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Time</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="1month">Last 30 Days</option>
                        <option value="1year">This Year</option>
                        <option value="specific">Specific Date</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {filterType === "specific" && (
                        <input
                            type="date"
                            className={styles.dateInput}
                            onChange={(e) => setSpecificDate(e.target.value)}
                        />
                    )}

                    {filterType === "custom" && (
                        <>
                            <input
                                type="date"
                                className={styles.dateInput}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                            <input
                                type="date"
                                className={styles.dateInput}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </>
                    )}

                    <div className={styles.filterActions}>
                        <button className={styles.resetBtn} onClick={resetFilter}>
                            Reset
                        </button>

                        <button className={styles.applyBtn} onClick={applyFilter}>
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}