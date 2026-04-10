import { NavLink, Routes, Route } from "react-router-dom";
import AllTransactions from "./Pages/AllTransactions";
import IncomeTransactions from "./Pages/IncomeTransactions";
import ExpenseTransactions from "./Pages/ExpenseTransactions";
import CategoryBreakdown from "./Pages/CategoryBreakdown";
import TransactionDashboard from "./Pages/TransactionDashboard";
import styles from "./staffTransactionPage.module.css";

export default function StaffTransactionPage() {
    return (
        <>
            <div className={styles.page}>

                <div className={styles.stickyHeader}>
                    <h1 className={styles.title}>Transactions</h1>

                    <div className={styles.tabs}>
                        <NavLink
                            to="/staff/transactions"
                            end
                            className={({ isActive }) => isActive ? styles.active : ""}
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/staff/transactions/all"
                            className={({ isActive }) => isActive ? styles.active : ""}
                        >
                            All
                        </NavLink>
                         <NavLink
                            to="/staff/transactions/income"
                            className={({ isActive }) => isActive ? styles.active : ""}
                        >
                            Income
                        </NavLink>
                       <NavLink
                            to="/staff/transactions/expense"
                            className={({ isActive }) => isActive ? styles.active : ""}
                        >
                            Expense
                        </NavLink>
                        
                        {/* <NavLink to="/staff/transactions/categories">Categories</NavLink> */}
                    </div>
                </div>

                <div className={styles.content}>
                    <Routes>
                        <Route index element={<TransactionDashboard />} />
                        <Route path="all" element={<AllTransactions />} />
                        <Route path="income" element={<IncomeTransactions />} />
                        <Route path="expense" element={<ExpenseTransactions />} />
                        {/* <Route path="categories" element={<CategoryBreakdown />} /> */}
                    </Routes>
                </div>

            </div>

        </>
    );
}