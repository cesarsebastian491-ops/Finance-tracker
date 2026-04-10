import React, { useState } from "react";
import styles from "./DateFilterMenu.module.css";

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
                const d = new Date(t.date);
                const target = new Date(specificDate);

                return (
                    d.getFullYear() === target.getFullYear() &&
                    d.getMonth() === target.getMonth() &&
                    d.getDate() === target.getDate()
                );
            });
        }

        if (filterType === "custom" && customStart && customEnd) {
            filtered = data.filter(t => {
                const d = new Date(t.date);
                return d >= new Date(customStart) && d <= new Date(customEnd);
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