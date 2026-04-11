import { useState, useEffect, useContext, useRef } from "react";
import DateFilterMenu from "../../../components/DateFilterMenu";
import AddExpenseModal from "../../../components/AddExpenseModal";
import { CurrencyContext } from "../../../context/CurrencyContext";
import styles from "./expenseDBoard.module.css";
import { API_URL } from "../../../config";



export default function expenseDBoard() {

    const [openAddModal, setOpenAddModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { mainCurrency } = useContext(CurrencyContext);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const tableRef = useRef(null);
    const [sortOrder, setSortOrder] = useState("desc"); // "desc" = latest first


    const storedUser = JSON.parse(localStorage.getItem("user"));

    const userId = storedUser?.id;

    async function handleAddExpense(data) {
        try {
            const payload = {
                ...data,
                user: { id: userId }   // ⭐ correct field
            };

            if (editData) {
                // UPDATE
                await fetch(`${API_URL}/transactions/update-expense/${editData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                // CREATE
                await fetch(`${API_URL}/transactions/add-expense`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            loadData();
            setOpenAddModal(false);
            setEditData(null);
        } catch (err) {
            console.error("Error saving expense:", err);
        }
    }
    async function handleDelete(expense) {
        if (!confirm(`Delete ${expense.expense}?`)) return;

        try {
            await fetch(
                `${API_URL}/transactions/delete-expense/${expense.id}/${userId}`,
                { method: "DELETE" }
            );

            loadData(); // refresh table
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    }
    // function handleEdit(expense) {
    //     setEditData(expense);
    //     setOpenAddModal(true);
    // }

    async function loadData() {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser) return;

            const res = await fetch(`${API_URL}/transactions/user/${storedUser.id}`);
            const data = await res.json();

            setTransactions(data);
        } catch (err) {
            console.error("Error loading transactions:", err);
        }
    }

    useEffect(() => {
        loadData();
    }, []);


    const expenseList = transactions.filter(t => t.type === "expense");
    function formatMoney(amount) {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: mainCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
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
    // ⭐ Filter state FIRST

    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const [expenseFilter, setExpenseFilter] = useState({
        filterType: "all",
        customStart: null,
        customEnd: null
    });

    function handleExpenseFilter({ filtered, filterType, customStart, customEnd }) {
        setFilteredExpenses(filtered);
        setExpenseFilter({ filterType, customStart, customEnd });
    }

    function getFilterLabel() {
        switch (expenseFilter.filterType) {
            case "7days":
                return "Last 7 Days";
            case "1month":
                return "Last 30 Days";
            case "1year":
                return "This Year";
            case "custom":
                return `${formatDate(expenseFilter.customStart)} → ${formatDate(expenseFilter.customEnd)}`;
            default:
                return "this month";
        }
    }
    // Decide which list to use (filtered or full)
    const tableData =
        expenseFilter.filterType !== "all"
            ? filteredExpenses
            : expenseList;


    const searchFiltered = tableData.filter((exp) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        return (
            exp.category?.toLowerCase().includes(term) ||
            formatDate(exp.date).toLowerCase().includes(term) ||
            formatMoney(exp.amount).toLowerCase().includes(term)
        );


    });

    // ⭐ SIMPLE ASC/DESC SORT
    const finalExpenseList = [...searchFiltered].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === "desc"
            ? dateB - dateA // latest first
            : dateA - dateB; // oldest first
    });


    useEffect(() => {
        const userSelectedDateFilter = expenseFilter.filterType !== "all";

        if (!userSelectedDateFilter && sortOrder === "asc" && tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    }, [sortOrder, finalExpenseList, expenseFilter]);

    // Detect if the user selected a date filter
    const userSelectedDateFilter = expenseFilter.filterType !== "all";



    function getCurrentMonthTransactions(transactions) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    }

    const summaryData = userSelectedDateFilter
        ? filteredExpenses
        : getCurrentMonthTransactions(expenseList);

    const tx = summaryData;

    // Total Expense
    const totalExpense = tx
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Highest Category
    function getHighestCategory(transactions) {
        const categoryTotals = {};

        transactions.forEach(tx => {
            if (tx.type === "expense") {
                const cat = tx.category || "Uncategorized";
                categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount);
            }
        });

        let highest = null;
        let highestAmount = 0;

        for (const cat in categoryTotals) {
            if (categoryTotals[cat] > highestAmount) {
                highest = cat;
                highestAmount = categoryTotals[cat];
            }
        }

        return highest || "—";
    }

    const highestCategory = getHighestCategory(tx);

    // Average Expense
    const expensesOnly = tx.filter(t => t.type === "expense");

    const averageExpense = expensesOnly.length > 0
        ? totalExpense / expensesOnly.length
        : 0;

    function exportExpensesToCSV(filename, rows) {
        if (!rows || rows.length === 0) return;

        const headers = [
            "Date",
            "Category",
            "Expense Amount",
            "Recurring"
        ];

        const values = rows.map(exp => [
            formatDate(exp.date),
            exp.category || "—",
            formatMoney(exp.amount),
            exp.isRecurring ? "Yes" : "No"
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

    function printTable() {
        window.print();
    }


    function getNextRecurringDate(tx) {
        if (!tx.isRecurring) return null;

        const last = tx.lastGenerated || tx.date;

        const base = dayjs(last);

        switch (tx.recurringType) {
            case "daily":
                return base.add(1, "day").format("MMM DD, YYYY");
            case "weekly":
                return base.add(1, "week").format("MMM DD, YYYY");
            case "monthly":
                return base.add(1, "month").format("MMM DD, YYYY");
            case "yearly":
                return base.add(1, "year").format("MMM DD, YYYY");
            default:
                return null;
        }
    }
    return (


        <>

            <main className="content">
                <div className="page-transition">
                    <div className={styles.title}>
                        <h5>Expense</h5>
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
                            <div className="filter-wrapper">
                                <DateFilterMenu
                                    data={expenseList}
                                    onApply={handleExpenseFilter}
                                />
                            </div>

                            <button
                                className="button"
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            >
                                Sort: {sortOrder === "desc" ? "Latest ↓" : "Oldest ↑"}
                            </button>
                        </div>

                        <div className="row action-row">
                            <button className="button" onClick={() => exportExpensesToCSV("expenses.csv", expenseList)}>
                                Export CSV
                            </button>

                            <button className="button" onClick={printTable}>
                                Print
                            </button>
                        </div>

                    </div>

                    {/* DESKTOP-ONLY LAYOUT */}
                    <div className={styles.expenseLayout}>

                        {/* LEFT SIDE — TABLE */}
                        <section className={styles.tableSection}>
                            {/* <div className={styles.txHeader}>
                                <h3>Expenses</h3>
                            </div> */}

                            <div className={styles.txTableWrapper} ref={tableRef}>
                                <table className={styles.txTable}>
                                    <thead>
                                        <tr>
                                            <th>Expense</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Recurring</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {finalExpenseList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                                    No expenses to display
                                                </td>
                                            </tr>
                                        ) : (
                                            finalExpenseList.map((exp) => (
                                                <tr
                                                    key={exp.id}
                                                    className={styles.expenseRow}
                                                    onClick={() => setSelectedExpense(exp)}
                                                >
                                                    <td>{exp.expense}</td>
                                                    <td>{exp.category}</td>
                                                    <td>{formatDate(exp.date)}</td>
                                                    <td className={styles.expenseAmount}>{formatMoney(exp.amount)}</td>
                                                    <td className={exp.isRecurring ? styles.recurringYes : styles.recurringNo}>
                                                        {exp.isRecurring ? "Yes" : "No"}
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
                                <h3>Expense Summary</h3>

                                <h4>Total Expenses ({getFilterLabel()})</h4>
                                <p>{formatMoney(totalExpense)}</p>

                                <h4>Highest Expense Category ({getFilterLabel()})</h4>
                                <p>{highestCategory}</p>

                                <h4>Monthly Average ({getFilterLabel()})</h4>
                                <p>{formatMoney(averageExpense)}</p>
                            </div>

                            <div className={styles.summaryActions}>
                                <button className={styles.addbtn} onClick={() => setOpenAddModal(true)}>
                                    Add Expense
                                </button>
                            </div>
                        </aside>



                    </div>


                </div>



                {selectedExpense && (
                    <ExpenseViewModal
                        expense={selectedExpense}
                        onClose={() => setSelectedExpense(null)}
                        onEdit={(exp) => {
                            setEditData(exp);
                            setOpenAddModal(true);
                        }}
                        onDelete={handleDelete}
                    />
                )}

            </main>
            <AddExpenseModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onSubmit={handleAddExpense}
                editData={editData}
            />

        </>
    );

    function ExpenseViewModal({ expense, onClose, onEdit, onDelete }) {
        if (!expense) return null;

        return (
            <div className={styles.infoOverlay} onClick={onClose}>
                <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
                    <h2 className={styles.infoTitle}>{expense.expense}</h2>

                    <div className={styles.infoContent}>

                        <div className={styles.twoColRow}>
                            <div className={styles.colItem}>
                                <span className={styles.label}>Category</span>
                                <span className={styles.value}>{expense.category || "—"}</span>
                            </div>

                            <div className={styles.colItem}>
                                <span className={styles.label}>Date</span>
                                <span className={styles.value}>{formatDate(expense.date)}</span>
                            </div>
                        </div>

                        {/* AMOUNT */}
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Amount</span>
                            <span className={styles.amountValue}>{formatMoney(expense.amount)}</span>
                        </div>

                        {/* DESCRIPTION */}
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Description</span>
                            <span className={styles.value}>{expense.description || "No description"}</span>
                        </div>

                        {/* -------------------------------------- */}
                        {/* ADDITIONAL CHARGES SECTION */}
                        {/* -------------------------------------- */}

                        <div className={styles.twoColumnSection}>

                            {/* LEFT COLUMN — Additional Charges */}
                            {(expense.tax > 0 ||
                                expense.serviceFee > 0 ||
                                expense.discount > 0 ||
                                expense.otherCharge > 0) && (
                                    <div className={styles.column}>
                                        <h5 className={styles.sectionTitle}>Additional Charges</h5>

                                        {expense.tax > 0 && (
                                            <div className={styles.infoRow}>
                                                <h6 className={styles.label}>Tax</h6>
                                                <h7 className={styles.value}>{formatMoney(expense.tax)}</h7>
                                            </div>
                                        )}

                                        {expense.serviceFee > 0 && (
                                            <div className={styles.infoRow}>
                                                <h5 className={styles.label}>Service Fee</h5>
                                                <span className={styles.value}>{formatMoney(expense.serviceFee)}</span>
                                            </div>
                                        )}

                                        {expense.discount > 0 && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.label}>Discount</span>
                                                <span className={styles.value}>-{formatMoney(expense.discount)}</span>
                                            </div>
                                        )}

                                        {expense.otherCharge > 0 && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.label}>Other Charge</span>
                                                <span className={styles.value}>{formatMoney(expense.otherCharge)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* RIGHT COLUMN — Recurring */}
                            {expense.isRecurring && (
                                <div className={styles.column}>
                                    <h5 className={styles.sectionTitle}>Recurring</h5>

                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Frequency</span>
                                        <span className={styles.value}>{expense.recurringType}</span>
                                    </div>

                                    {expense.recurringEndDate && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Ends On</span>
                                            <span className={styles.value}>{formatDate(expense.recurringEndDate)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                    </div>

                    {/* ACTION BUTTONS */}
                    <div className={styles.infoActions}>
                        <div className={styles.actionRow}>
                            <button className={styles.editBtn} onClick={() => { onClose(); onEdit(expense); }}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => onDelete(expense.id)}>Delete</button>
                        </div>

                        <button className={styles.closeBtn} onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }
}
