import { useState, useEffect, useContext, useRef } from "react";
import DateFilterMenu from "../../../components/DateFilterMenu";
import AddExpenseModal from "../../../components/AddExpenseModal";
import TransactionInfoModal from "../../../components/TransactionInfoModal";
import { CurrencyContext } from "../../../context/CurrencyContext";
import styles from "./expenseDBoard.module.css";
import { API_URL } from "../../../config";



export default function expenseDBoard({ role } = {}) {

    const isStaff = role === "staff";
    const [openAddModal, setOpenAddModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [editData, setEditData] = useState(null);
    const { activeCurrency } = useContext(CurrencyContext);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const tableRef = useRef(null);
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" = oldest first


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
        const label = expense.expense || expense.category || "this expense";
        if (!confirm(`Delete ${label}?`)) return;

        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser?.access_token) {
                alert("Session expired. Please login again.");
                return;
            }

            await fetch(
                `${API_URL}/transactions/delete-expense/${expense.id}/${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${storedUser.access_token}`,
                    },
                }
            );

            setSelectedExpense(null);
            await loadData();
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

            const url = isStaff
                ? `${API_URL}/analytics/staff/transactions`
                : `${API_URL}/transactions/user/${storedUser.id}`;

            const res = await fetch(url, {
                headers: isStaff ? { Authorization: `Bearer ${storedUser.access_token}` } : {},
            });
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
            currency: activeCurrency?.code || 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    function calculateExpenseAdditionalCharges(exp) {
        const tax = Number(exp.tax) || 0;
        const serviceFee = Number(exp.serviceFee) || 0;
        const otherCharge = Number(exp.otherCharge) || 0;
        const discount = Number(exp.discount) || 0;
        return tax + serviceFee + otherCharge - discount;
    }

    function formatAdditionalCharges(value) {
        if (value === 0) return "None";
        if (value < 0) return `Less ${formatMoney(Math.abs(value))}`;
        return formatMoney(value);
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
        customEnd: null,
        specificDate: null
    });

    function handleExpenseFilter({ filtered, filterType, customStart, customEnd, specificDate }) {
        setFilteredExpenses(filtered);
        setExpenseFilter({ filterType, customStart, customEnd, specificDate });
    }

    function getFilterLabel() {
        switch (expenseFilter.filterType) {
            case "7days":
                return "Last 7 Days";
            case "1month":
                return "Last 30 Days";
            case "1year":
                return "This Year";
            case "specific":
                return expenseFilter.specificDate
                    ? formatDate(expenseFilter.specificDate)
                    : "Specific Date";
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
            formatMoney(exp.amount).toLowerCase().includes(term) ||
            formatMoney(calculateExpenseAdditionalCharges(exp)).toLowerCase().includes(term) ||
            formatAdditionalCharges(calculateExpenseAdditionalCharges(exp)).toLowerCase().includes(term) ||
            (isStaff && exp.user?.username?.toLowerCase().includes(term))
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
            "Additional Charges",
            "Recurring"
        ];

        const values = rows.map(exp => [
            formatDate(exp.date),
            exp.category || "—",
            formatMoney(exp.amount),
            formatAdditionalCharges(calculateExpenseAdditionalCharges(exp)),
            exp.isRecurring ? "Yes" : ""
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
                            <button className="button" onClick={() => exportExpensesToCSV("expenses.csv", finalExpenseList)}>
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
                                <div id="print-area">
                                    {/* <h2 style={{marginBottom: '20px'}}>Expense Report</h2> */}
                                    <table className={styles.txTable}>
                                    <thead>
                                        <tr>
                                            {isStaff && <th>Username</th>}
                                            <th>Expense</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Additional Charges</th>
                                            <th>Amount</th>
                                            <th>Recurring</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {finalExpenseList.length === 0 ? (
                                            <tr>
                                                <td colSpan={isStaff ? 7 : 6} style={{ textAlign: "center", padding: "20px" }}>
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
                                                    {isStaff && <td>{exp.user?.username || '—'}</td>}
                                                    <td>{exp.expense}</td>
                                                    <td>{exp.category}</td>
                                                    <td>{formatDate(exp.date)}</td>
                                                    <td className={styles.expenseAmount}>{formatAdditionalCharges(calculateExpenseAdditionalCharges(exp))}</td>
                                                    <td className={styles.expenseAmount}>{formatMoney((Number(exp.amount) || 0) + calculateExpenseAdditionalCharges(exp))}</td>
                                                    <td className={exp.isRecurring ? styles.recurringYes : styles.recurringNo}>
                                                        {exp.isRecurring ? "Yes" : ""}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                </div>
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
                                {!isStaff && (
                                    <button className={styles.addbtn} onClick={() => {
                                        setEditData(null);
                                        setOpenAddModal(true);
                                    }}>
                                        Add Expense
                                    </button>
                                )}
                            </div>
                        </aside>



                    </div>

                </div>



                {selectedExpense && (
                    <TransactionInfoModal
                        transaction={selectedExpense}
                        onClose={() => setSelectedExpense(null)}
                        onEdit={!isStaff ? (exp) => {
                            setEditData(exp);
                            setOpenAddModal(true);
                        } : undefined}
                        onDelete={!isStaff ? handleDelete : undefined}
                        formatMoney={formatMoney}
                        formatDate={formatDate}
                    />
                )}

            </main>
            {!isStaff && (
                <AddExpenseModal
                    open={openAddModal}
                    onClose={() => {
                        setOpenAddModal(false);
                        setEditData(null);
                    }}
                    onSubmit={handleAddExpense}
                    editData={editData}
                />
            )}

        </>
    );

}
