import { useState } from "react";
import styles from "./UniversalFilterModal.module.css";

export default function UniversalFilterModal({ open, onClose, onApply }) {
    if (!open) return null;

    const [timeFilter, setTimeFilter] = useState("monthly");
    const [typeFilter, setTypeFilter] = useState("all");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    function applyFilters() {
        onApply({
            time: timeFilter,
            type: typeFilter,
            customStart,
            customEnd
        });
        onClose();
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Filter Options</h3>

                {/* TIME FILTER */}
                <div className={styles.section}>
                    <label className={styles.label}>Time Range</label>

                    <select
                        className={styles.select}
                        value={timeFilter}
                        onChange={e => setTimeFilter(e.target.value)}
                    >
                        <option value="monthly">This Month</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="1month">Last 30 Days</option>
                        <option value="1year">This Year</option>
                        <option value="custom">Custom Range</option>
                        <option value="specific">Specific Date</option>
                    </select>

                    {timeFilter === "custom" && (
                        <div className={styles.customDates}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                            />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                            />
                        </div>
                    )}

                    {timeFilter === "specific" && (
                        <div className={styles.customDates}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* TYPE FILTER */}
                <div className={styles.section}>
                    <label className={styles.label}>Type</label>

                    <select
                        className={styles.select}
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expense Only</option>
                    </select>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>

                    <button className={styles.applyBtn} onClick={applyFilters}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}