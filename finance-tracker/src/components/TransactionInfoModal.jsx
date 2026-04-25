import { createPortal } from "react-dom";
import styles from "./TransactionInfoModal.module.css";

function getTotalWithCharges(tx) {
    const base = Number(tx.amount) || 0;
    const tax = Number(tx.tax) || 0;
    const serviceFee = Number(tx.serviceFee) || 0;
    const otherCharge = Number(tx.otherCharge) || 0;
    const discount = Number(tx.discount) || 0;
    return base + tax + serviceFee + otherCharge - discount;
}

export default function TransactionInfoModal({ transaction, onClose, onEdit, onDelete, formatMoney, formatDate }) {
    if (!transaction) return null;

    const tx = transaction;
    const isIncome = tx.type === "income";
    const title = isIncome
        ? (tx.source || "Income")
        : (tx.expense || tx.category || "Expense");

    const hasCharges = tx.tax > 0 || tx.serviceFee > 0 || tx.discount > 0 || tx.otherCharge > 0;
    const amountClass = isIncome ? styles.amountIncome : styles.amountExpense;

    return createPortal(
        <div className={styles.infoOverlay} onClick={onClose}>
            <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.infoTitle}>{title}</h2>

                <div className={styles.infoContent}>
                    <div className={styles.twoColRow}>
                        <div className={styles.colItem}>
                            <span className={styles.label}>Category</span>
                            <span className={styles.value}>{tx.category || "—"}</span>
                        </div>
                        <div className={styles.colItem}>
                            <span className={styles.label}>Date</span>
                            <span className={styles.value}>{formatDate(tx.date)}</span>
                        </div>
                    </div>

                    <div className={styles.twoColRow}>
                        <div className={styles.colItem}>
                            <span className={styles.label}>Type</span>
                            <span className={styles.value} style={{ textTransform: "capitalize" }}>{tx.type}</span>
                        </div>
                        <div className={styles.colItem}>
                            <span className={styles.label}>Amount</span>
                            <span className={amountClass}>{formatMoney(tx.amount)}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>Description</span>
                        <span className={styles.value}>{tx.description || "No description"}</span>
                    </div>

                    <div className={styles.twoColumnSection}>
                        <div className={styles.column}>
                            <h5 className={styles.sectionTitle}>Additional Charges</h5>
                            {hasCharges ? (
                                <>
                                    {tx.tax > 0 && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Tax</span>
                                            <span className={styles.value}>{formatMoney(tx.tax)}</span>
                                        </div>
                                    )}
                                    {tx.serviceFee > 0 && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Service Fee</span>
                                            <span className={styles.value}>{formatMoney(tx.serviceFee)}</span>
                                        </div>
                                    )}
                                    {tx.discount > 0 && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Discount</span>
                                            <span className={styles.value}>-{formatMoney(tx.discount)}</span>
                                        </div>
                                    )}
                                    {tx.otherCharge > 0 && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Other Charge</span>
                                            <span className={styles.value}>{formatMoney(tx.otherCharge)}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.infoRow}>
                                    <span className={styles.value}>None</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.column}>
                            <h5 className={styles.sectionTitle}>Recurring</h5>
                            {tx.isRecurring ? (
                                <>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Frequency</span>
                                        <span className={styles.value}>{tx.recurringType}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Starts On</span>
                                        <span className={styles.value}>{formatDate(tx.date)}</span>
                                    </div>
                                    {tx.recurringEndDate && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Ends On</span>
                                            <span className={styles.value}>{formatDate(tx.recurringEndDate)}</span>
                                        </div>
                                    )}
                                    {!tx.recurringEndDate && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Ends On</span>
                                            <span className={styles.value}>No end date</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.infoRow}>
                                    <span className={styles.value}>None</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <span className={styles.label}>Total (with charges)</span>
                        <span className={amountClass}>{formatMoney(getTotalWithCharges(tx))}</span>
                    </div>
                </div>

                <div className={styles.infoActions}>
                    {(onEdit || onDelete) && (
                        <div className={styles.actionRow}>
                            {onEdit && (
                                <button className={styles.editBtn} onClick={() => { onClose(); onEdit(tx); }}>Edit</button>
                            )}
                            {onDelete && (
                                <button className={styles.deleteBtn} onClick={() => onDelete(tx)}>Delete</button>
                            )}
                        </div>
                    )}
                    <button className={styles.closeBtn} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
