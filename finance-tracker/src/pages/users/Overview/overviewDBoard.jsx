import FilterMenu from "../../../components/FilterMenu";
import { CurrencyContext } from "../../../context/CurrencyContext";
import { useEffect, useState, useContext, useRef } from "react";
import styles from "./overview.module.css";
import { API_URL } from "../../../config";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ✅ STEP 2 GOES RIGHT HERE — OUTSIDE THE COMPONENT
function getDailyTotals(transactions) {
    const totalsByDay = new Map();

    transactions.forEach((t) => {
        const date = new Date(t.date);
        if (Number.isNaN(date.getTime())) return;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;

        if (!totalsByDay.has(key)) {
            totalsByDay.set(key, {
                key,
                income: 0,
                expense: 0
            });
        }

        const totals = totalsByDay.get(key);

        if (t.type === "income") {
            totals.income += Number(t.amount) || 0;
        } else if (t.type === "expense") {
            totals.expense += Number(t.amount) || 0;
        }
    });

    return [...totalsByDay.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function formatDateKey(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date
        .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        })
        .replace(",", "")
        .replace(" ", "/");
}

function filterCurrentMonth(transactions) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
}


export default function overviewDBoard() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const { mainCurrency } = useContext(CurrencyContext);
    const [filteredTransactions, setFilteredTransactions] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // "desc" = Latest first
    const tableRef = useRef(null);


    function handleFilter({ filtered, filterType, customStart, customEnd, specificDate }) {
        setFilteredTransactions(Array.isArray(filtered) ? filtered : []);
        setActiveFilter({ filterType, customStart, customEnd, specificDate });
    }

    const [activeFilter, setActiveFilter] = useState({
        filterType: "monthly",
        customStart: null,
        customEnd: null,
        specificDate: null
    });

    function getFilterLabel() {
        switch (activeFilter.filterType) {
            case "7days":
                return "Last 7 Days";
            case "1month":
                return "Last 30 Days";
            case "1year":
                return "This Year";
            case "specific":
                return activeFilter.specificDate
                    ? formatDate(activeFilter.specificDate)
                    : "Specific Date";
            case "custom":
                return `${formatDate(activeFilter.customStart)} → ${formatDate(activeFilter.customEnd)}`;
            default:
                return "This Month";
        }
    }


    // timefilter label end
    // get user info start
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            window.location.href = "/";
            return;
        }
        setUser(storedUser);
    }, []);

    useEffect(() => {
        if (!user) return; // prevent undefined fetch

        async function loadData() {
            const res = await fetch(`${API_URL}/transactions/user/${user.id}`);
            const data = await res.json();
            setTransactions(data);
        }

        loadData();
    }, [user]);

    // user data end

    // total money calculations
    const currentMonthTransactions = filterCurrentMonth(transactions);

    const dataToUse = filteredTransactions ?? currentMonthTransactions;

    const totalIncome = dataToUse
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = dataToUse
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpense;

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

    // chart data preparation
    const daily = getDailyTotals(dataToUse);

    const labels = daily.map((entry) => formatDateKey(entry.key));

    const data = {
        labels,
        datasets: [
            {
                label: "Income",
                data: daily.map(d => d.income),
                backgroundColor: "#8dd5ac",
            },
            {
                label: "Expense",
                data: daily.map(d => -Math.abs(d.expense)),
                backgroundColor: "#ff6b6b",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: (ctx) =>
                        ctx.tick.value === 0 ? "#000" : "rgba(0,0,0,0.1)", // bold center line
                    lineWidth: (ctx) => (ctx.tick.value === 0 ? 2 : 1),
                },
            },
        },
    };

    const baseList =
        filteredTransactions ?? currentMonthTransactions;

    const searchFiltered = baseList.filter((tx) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true; // if search is empty, keep everything

        return (
            tx.category?.toLowerCase().includes(term) ||
            tx.source?.toLowerCase().includes(term) ||
            tx.type?.toLowerCase().includes(term) ||
            formatDate(tx.date).toLowerCase().includes(term) ||
            formatMoney(tx.amount).toLowerCase().includes(term)
        );
    });

    const sortedTransactions = [...searchFiltered].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === "desc"
            ? dateB - dateA
            : dateA - dateB;
    });

    useEffect(() => {
        if (!tableRef.current) return;

        const wrapper = tableRef.current;

        if (sortOrder === "desc") {
            wrapper.scrollTop = 0; // newest → top
        } else {
            wrapper.scrollTop = wrapper.scrollHeight; // oldest → bottom
        }
    }, [sortOrder, sortedTransactions]);


    if (!user) return null;
    return (
        <>
            <main className="content">
                <div className="page-transition">

                    <div className={styles.title}>
                        <h5>Overview</h5>
                    </div>


                    {/* TOP ROW */}
                    <div className="top-row">

                        {/* SEARCH */}
                        <div className="row search-row">
                            <div className="search-wrap">
                                <input
                                    type="text"
                                    className="search"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* FILTERS */}
                        <div className="row control-row">
                            <div className="filter-wrapper">


                                <FilterMenu
                                    onApplyFilters={handleFilter}
                                    transactions={transactions}
                                />


                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="row action-row">

                            <button
                                className="button"
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            >
                                Sort: {sortOrder === "desc" ? "Latest ↓" : "Oldest ↑"}
                            </button>
                            {/* <button className="button">Export CSV</button>
                            <button className="button">Print</button> */}
                        </div>

                    </div>




                    <section className={styles.overview}>
                        <div className={styles.cards}>

                            <div className={styles.card}>
                                Total Revenue ({getFilterLabel()})
                                <div className={styles.value}>{formatMoney(totalIncome)}</div>
                            </div>

                            <div className={styles.card}>
                                Total Expense ({getFilterLabel()})
                                <div className={styles.value}>{formatMoney(totalExpense)}</div>
                            </div>

                            <div className={styles.card}>
                                Net Balance ({getFilterLabel()})
                                <div className={`${styles.value} ${netBalance < 0 ? styles.negativeValue : ""}`}>
                                    {formatMoney(netBalance)}
                                </div>
                            </div>

                        </div>
                    </section>

                    <div className={styles.bottomSections}>

                        <section className={styles.transactions}>
                            <div className={styles.txHeader}>
                                <h3>Recent transactions</h3>
                            </div>

                            <div className={styles.runningTableWrapper} ref={tableRef}>
                                <table className={styles.runningTable}>
                                    <thead>
                                        <tr>
                                            <th>Category / Source</th>
                                            <th>Income</th>
                                            <th>Expense</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {searchFiltered.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className={styles.txEmpty}>
                                                    No recent transactions
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedTransactions.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td>
                                                        {tx.type === "income"
                                                            ? tx.source
                                                            : tx.category || "—"}
                                                    </td>

                                                    <td className={styles.green}>
                                                        {tx.type === "income"
                                                            ? formatMoney(tx.amount)
                                                            : ""}
                                                    </td>

                                                    <td className={styles.red}>
                                                        {tx.type === "expense"
                                                            ? formatMoney(tx.amount)
                                                            : ""}
                                                    </td>

                                                    <td>{formatDate(tx.date)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className={styles.report}>
                            <div className={styles.txHeader}>
                                <h3>Report</h3>
                            </div>

                            <div className={styles.txList}>
                                <h3>{getFilterLabel()} Income vs Expense</h3>
                                <Bar data={data} options={options} />
                            </div>
                        </section>

                    </div>
                </div>
            </main>

        </>
    );
}
