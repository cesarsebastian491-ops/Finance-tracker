
import { useState, useEffect, useContext, useRef } from "react";
import DateFilterMenu from "../../../components/DateFilterMenu";
import AddIncomeModal from "../../../components/AddIncomeModal";
import { CurrencyContext } from "../../../context/CurrencyContext";
import styles from "./incomeDBoard.module.css";
import { API_URL } from "../../../config";

export default function IncomeDBoard() {

    const [openAddModal, setOpenAddModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { mainCurrency } = useContext(CurrencyContext);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc");
    const tableRef = useRef();

  


    // ⭐ SAME AS EXPENSE DASHBOARD
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

    // ⭐ Load user-specific transactions
    async function loadData() {
        try {
            if (!userId) return;

            const res = await fetch(`${API_URL}/transactions/user/${userId}`);
            const data = await res.json();

            setTransactions(data);
        } catch (err) {
            console.error("Error loading transactions:", err);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // ⭐ Add or Edit Income
    async function handleAddIncome(data) {
        try {
            const payload = {
                ...data,
                user: { id: userId }   // ⭐ correct structure
            };

            if (editData) {
                await fetch(`${API_URL}/transactions/update-income/${editData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch(`${API_URL}/transactions/add-income`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            await loadData();
            setOpenAddModal(false);
            setEditData(null);

        } catch (err) {
            console.error("Error saving income:", err);
        }
    }
    // ⭐ Delete Income
    async function handleDelete(income) {
        if (!confirm(`Delete ${income.source}?`)) return;

        try {
            await fetch(
                `${API_URL}/transactions/delete-income/${income.id}/${userId}`,
                { method: "DELETE" }
            );

            await loadData();
        } catch (err) {
            console.error("Error deleting income:", err);
        }
    }
    // ⭐ Edit Income
    function handleEdit(income) {
        setEditData(income);
        setOpenAddModal(true);
    }

    // ⭐ Filter only income
    const incomeList = transactions.filter(t => t.type?.toLowerCase() === "income");


    function formatMoney(amount) {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: mainCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function getCurrentMonthTransactions(transactions) {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        return transactions.filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);

        const options = {
            month: "short",
            day: "2-digit",
            year: "numeric"
        };

        return date
            .toLocaleDateString("en-US", options)
            .replace(",", "")
            .replace(" ", "/");
    }

    // ⭐ Filter state MUST come first
    const [filteredIncome, setFilteredIncome] = useState([]);


    const [incomeFilter, setIncomeFilter] = useState({
        filterType: "all",
        customStart: null,
        customEnd: null
    });
    const [searchTerm, setSearchTerm] = useState("");   // ✅ Add this

    // ⭐ Handler for shared DateFilterMenu
    function handleIncomeFilter({ filtered, filterType, customStart, customEnd }) {
        setFilteredIncome(filtered);
        setIncomeFilter({ filterType, customStart, customEnd });
    }

    // ⭐ Filter label (fixed: replaced activeFilter → incomeFilter)
    function getFilterLabel() {
        switch (incomeFilter.filterType) {
            case "7days":
                return "Last 7 Days";
            case "1month":
                return "Last 30 Days";
            case "1year":
                return "This Year";
            case "custom":
                return `${formatDate(incomeFilter.customStart)} → ${formatDate(incomeFilter.customEnd)}`;
            default:
                return "This Month";
        }
    }

    // Decide which list to use (filtered or full)
    const tableData =
        incomeFilter.filterType !== "all"
            ? filteredIncome
            : incomeList;

    // Apply search on top of date filter
    const searchFiltered = tableData.filter((inc) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        return (
            inc.source?.toLowerCase().includes(term) ||
            inc.category?.toLowerCase().includes(term) ||
            formatDate(inc.date).toLowerCase().includes(term) ||
            formatMoney(inc.amount).toLowerCase().includes(term)
        );
    });

    // 1. Sort ASC (oldest → newest)
    const sortedAsc = [...searchFiltered].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    // 2. Apply sort toggle
    const finalIncomeList =
        sortOrder === "desc"
            ? [...sortedAsc].reverse()   // newest → oldest
            : sortedAsc;                 // oldest → newest


    useEffect(() => {
        if (sortOrder === "asc" && tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    }, [sortOrder, finalIncomeList]);


    const userSelectedDateFilter = incomeFilter.filterType !== "all";


    function getCurrentMonthTransactions(transactions) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    }

    // ⭐ Summary dataset (default = THIS MONTH)
    const summaryData = userSelectedDateFilter
        ? filteredIncome
        : getCurrentMonthTransactions(incomeList);

    // ⭐ Summary calculations
    const tx = summaryData;

    // Total Income
    const totalIncome = tx
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Highest Income Source
    function getHighestSource(transactions) {
        const sourceTotals = {};

        transactions.forEach(tx => {
            if (tx.type === "income") {
                const src = tx.source || "Uncategorized";
                sourceTotals[src] = (sourceTotals[src] || 0) + Number(tx.amount);
            }
        });

        let highest = null;
        let highestAmount = 0;

        for (const src in sourceTotals) {
            if (sourceTotals[src] > highestAmount) {
                highest = src;
                highestAmount = sourceTotals[src];
            }
        }

        return highest || "—";
    }

    const highestSource = getHighestSource(tx);

    // Average Income
    const incomeOnly = tx.filter(t => t.type === "income");

    const averageIncome = incomeOnly.length > 0
        ? totalIncome / incomeOnly.length
        : 0;

    function exportIncomeToCSV(filename, rows) {
        if (!rows || rows.length === 0) return;

        const headers = [
            "Date",
            "Source",
            "Income Amount",
            "Recurring"
        ];

        const values = rows.map(inc => [
            formatDate(inc.date),
            inc.source || "—",
            formatMoney(inc.amount),
            inc.isRecurring ? "Yes" : "No"
        ]);

        const csvContent =
            headers.join(",") +
            "\n" +
            values.map(row => row.map(v => `"${v}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function printIncomeTable() {
        window.print();
    }
    return (
        <>
            <main className="content">
                <div className="page-transition">
                    <div className={styles.title}>
                        <h5>Revenue </h5>
                    </div>
                   

                    <div className="top-row">

                        <div className="row search-row">
                            <div className="search-wrap">
                                <input
                                    type="text"
                                    className="search"
                                    placeholder="Search expense..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="row control-row">
                            <DateFilterMenu
                                data={incomeList}
                                onApply={handleIncomeFilter}
                            />

                            <button
                                className="button"
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            >
                                Sort: {sortOrder === "desc" ? "Latest ↓" : "Oldest ↑"}
                            </button>
                        </div>

                        <div className="row action-row">
                            <button className="button" onClick={() => exportIncomeToCSV("income.csv", searchFiltered)}>
                                Export CSV
                            </button>

                            <button className="button" onClick={printIncomeTable}>
                                Print
                            </button>
                        </div>

                    </div>

                    {/* DESKTOP-ONLY LAYOUT */}
                    <div className={styles.incomeLayout}>

                        {/* LEFT SIDE — TABLE */}
                        <section className={styles.tableSection}>
                            {/* <div className={styles.txHeader}>
                                <h3>Revenue</h3>
                            </div> */}

                            <div className={styles.txTableWrapper} ref={tableRef}>
                                <table className={styles.txTable}>
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Recurring</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {finalIncomeList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                                    No income to display
                                                </td>
                                            </tr>
                                        ) : (
                                            finalIncomeList.map((inc) => (
                                                <tr
                                                    key={inc.id}
                                                    className={styles.incomeRow}
                                                    onClick={() => setSelectedIncome(inc)}
                                                >
                                                    <td>{inc.source}</td>
                                                    <td>{formatDate(inc.date)}</td>
                                                    <td className={styles.incomeAmount}>{formatMoney(inc.amount)}</td>
                                                    <td className={inc.isRecurring ? styles.recurringYes : styles.recurringNo}>
                                                        {inc.isRecurring ? "Yes" : "No"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* RIGHT SIDE — SUMMARY PANEL */}
                        <aside className={styles.summaryPanel}>
                            <div className={styles.summaryBox}>
                                <h3>Revenue Summary</h3>

                                <h4>Total Revenue ({getFilterLabel()})</h4>
                                <p>{formatMoney(totalIncome)}</p>

                                <h4>Highest Revenue Source ({getFilterLabel()})</h4>
                                <p>{highestSource}</p>

                                <h4>Monthly Average ({getFilterLabel()})</h4>
                                <p>{formatMoney(averageIncome)}</p>
                            </div>

                            <div className={styles.summaryActions}>
                                <button className={styles.addbtn} onClick={() => setOpenAddModal(true)}>
                                    Add Revenue
                                </button>
                            </div>
                        </aside>

                    </div>

                    {/* MODALS */}
                    <AddIncomeModal
                        open={openAddModal}
                        onClose={() => {
                            setOpenAddModal(false);
                            setEditData(null);
                        }}
                        onSubmit={handleAddIncome}
                        editData={editData}
                    />
                </div>
            </main>

            {selectedIncome && (
                <IncomeViewModal
                    income={selectedIncome}
                    onClose={() => setSelectedIncome(null)}
                    onEdit={(inc) => {
                        setEditData(inc);
                        setOpenAddModal(true);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </>
    );

    function IncomeViewModal({ income, onClose, onEdit, onDelete }) {
        if (!income) return null;

        return (
            <div className={styles.infoOverlay} onClick={onClose}>
                <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
                    <h2 className={styles.infoTitle}>{income.source}</h2>

                    <div className={styles.infoContent}>

                        <div className={styles.twoColRow}>
                            <div className={styles.colItem}>
                                <span className={styles.label}>Date</span>
                                <span className={styles.value}>{formatDate(income.date)}</span>
                            </div>
                        </div>

                        {/* AMOUNT */}
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Amount</span>
                            <span className={styles.amountValue}>{formatMoney(income.amount)}</span>
                        </div>

                        {/* DESCRIPTION */}
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Description</span>
                            <span className={styles.value}>{income.description || "No description"}</span>
                        </div>

                        {/* -------------------------------------- */}
                        {/* ADDITIONAL CHARGES SECTION */}
                        {/* -------------------------------------- */}

                        <div className={styles.twoColumnSection}>

                            {/* LEFT COLUMN — Additional Charges */}
                            {(income.tax > 0 ||
                                income.serviceFee > 0 ||
                                income.discount > 0 ||
                                income.otherCharge > 0) && (
                                    <div className={styles.column}>
                                        <h5 className={styles.sectionTitle}>Additional Charges</h5>

                                        {income.tax > 0 && (
                                            <div className={styles.infoRow}>
                                                <h6 className={styles.label}>Tax</h6>
                                                <h7 className={styles.value}>{formatMoney(income.tax)}</h7>
                                            </div>
                                        )}

                                        {income.serviceFee > 0 && (
                                            <div className={styles.infoRow}>
                                                <h5 className={styles.label}>Service Fee</h5>
                                                <span className={styles.value}>{formatMoney(income.serviceFee)}</span>
                                            </div>
                                        )}

                                        {income.discount > 0 && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.label}>Discount</span>
                                                <span className={styles.value}>-{formatMoney(income.discount)}</span>
                                            </div>
                                        )}

                                        {income.otherCharge > 0 && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.label}>Other Charge</span>
                                                <span className={styles.value}>{formatMoney(income.otherCharge)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* RIGHT COLUMN — Recurring */}
                            {income.isRecurring && (
                                <div className={styles.column}>
                                    <h5 className={styles.sectionTitle}>Recurring</h5>

                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Frequency</span>
                                        <span className={styles.value}>{income.recurringType}</span>
                                    </div>

                                    {income.recurringEndDate && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Ends On</span>
                                            <span className={styles.value}>{formatDate(income.recurringEndDate)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                    </div>

                    <div className={styles.infoActions}>
                        <div className={styles.actionRow}>
                            <button className={styles.editBtn} onClick={() => { onClose(); onEdit(income); }}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => onDelete(income.id)}>Delete</button>
                        </div>

                        <button className={styles.closeBtn} onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }
}