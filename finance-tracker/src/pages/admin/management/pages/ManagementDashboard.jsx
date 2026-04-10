import styles from "./ManagementDashboard.module.css";

export default function ManagementDashboard({ stats }) {
  return (
    <div className={styles.summaryCards}>

      <div className={`${styles.summaryCard} ${styles.cardUsers}`}>
        <h3>Total Users</h3>
        <p>{stats.totalUsers}</p>
      </div>

      <div className={`${styles.summaryCard} ${styles.cardCategories}`}>
        <h3>Total Categories</h3>
        <p>{stats.totalCategories}</p>
      </div>

      <div className={`${styles.summaryCard} ${styles.cardIncome}`}>
        <h3>Income Transactions</h3>
        <p>{stats.totalIncomeTransactions}</p>
      </div>

      <div className={`${styles.summaryCard} ${styles.cardExpense}`}>
        <h3>Expense Transactions</h3>
        <p>{stats.totalExpenseTransactions}</p>
      </div>

      <div className={`${styles.summaryCard} ${styles.cardLogs}`}>
        <h3>Total Logs</h3>
        <p>{stats.totalLogs}</p>
      </div>

      <div className={`${styles.summaryCard} ${styles.cardTransactions}`}>
        <h3>Total Transactions</h3>
        <p>{stats.totalTransactions}</p>
      </div>

    </div>
  );
}