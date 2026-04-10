import { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES } from "./categories";
import styles from "./AddExpenseModal.module.css";

export default function AddExpenseModal({ open, onClose, onSubmit, editData }) {
    const [showChargesModal, setShowChargesModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const [form, setForm] = useState({
        expense: "",
        category: "",
        date: "",
        amount: "",
        description: "",

        // ⭐ Additional charges
        tax: "",
        serviceFee: "",
        discount: "",
        otherCharge: "",

        // ⭐ Recurring
        isRecurring: false,
        recurringType: "",
        recurringEndDate: ""
    });

    const [errors, setErrors] = useState({}); // ⭐ validation errors

    useEffect(() => {
        if (editData) {
            setForm({
                id: editData.id,
                type: editData.type || "expense",
                expense: editData.expense || "",
                category: editData.category || "",
                date: editData.date || "",
                amount: editData.amount || "",
                description: editData.description || "",
                userId: editData.userId || editData.user?.id,

                tax: editData.tax || "",
                serviceFee: editData.serviceFee || "",
                discount: editData.discount || "",
                otherCharge: editData.otherCharge || "",

                isRecurring: editData.isRecurring || false,
                recurringType: editData.recurringType || "",
                recurringEndDate: editData.recurringEndDate || ""
            });
        } else {
            setForm({
                expense: "",
                category: "",
                date: "",
                amount: "",
                description: "",
                tax: "",
                serviceFee: "",
                discount: "",
                otherCharge: "",
                isRecurring: false,
                recurringType: "",
                recurringEndDate: "",
                userId: user?.id || null
            });
        }


        setErrors({}); // reset errors when modal opens
    }, [editData, open]);
    useEffect(() => {
        if (!open) {
            setForm({
                expense: "",
                category: "",
                date: "",
                amount: "",
                description: "",
                tax: "",
                serviceFee: "",
                discount: "",
                otherCharge: "",
                isRecurring: false,
                recurringType: "",
                recurringEndDate: "",
                userId: user?.id || null
            });
            setErrors({});
        }
    }, [open]);

    if (!open) return null;

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // clear error on typing
    }

    // ⭐ VALIDATION LOGIC
    function validate() {
        const newErrors = {};

        if (!form.expense.trim()) newErrors.expense = "Expense name is required";
        if (!form.category) newErrors.category = "Please select a category";
        if (!form.date) newErrors.date = "Date is required";
        if (!form.amount || Number(form.amount) <= 0)
            newErrors.amount = "Amount must be greater than 0";

        return newErrors;
    }

    function handleAdd() {
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // ❌ stop submission
        }
        onSubmit({
            id: form.id,
            type: "expense",
            expense: form.expense,
            category: form.category,
            date: form.date,
            amount: Number(form.amount),
            description: form.description,
            userId: form.userId,

            // ⭐ Additional charges
            tax: Number(form.tax) || null,
            serviceFee: Number(form.serviceFee) || null,
            discount: Number(form.discount) || null,
            otherCharge: Number(form.otherCharge) || null,

            // ⭐ Recurring
            isRecurring: form.isRecurring,
            recurringType: form.recurringType || null,
            recurringEndDate: form.recurringEndDate || null
        });

        onClose();
    }

    return (
        <>
            <div className="page-transition">
                <div className={styles.expensemodalOverlay}>
                    <div className={styles.modal}>

                        <h2>{editData ? "Edit Expense" : "Add Expense"}</h2>

                        {/* EXPENSE */}
                        <div className={styles.modalSection}>
                            <label>Expense</label>
                            <input
                                name="expense"
                                value={form.expense}
                                onChange={handleChange}
                                placeholder="e.g. Lunch"
                            />
                            {errors.expense && <p className={styles.errorText}>{errors.expense}</p>}
                        </div>

                        {/* CATEGORY */}
                        <div className={styles.modalSection}>
                            <label>Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="">Select category</option>

                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className={styles.errorText}>{errors.category}</p>}
                        </div>

                        {/* DATE */}
                        <div className={styles.modalSection}>
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                            />
                            {errors.date && <p className={styles.errorText}>{errors.date}</p>}
                        </div>

                        {/* AMOUNT */}
                        <div className={styles.modalSection}>
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                            {errors.amount && <p className={styles.errorText}>{errors.amount}</p>}
                        </div>

                        {/* DESCRIPTION */}
                        <div className={styles.modalSection}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>

                        {/* ADDITIONAL CHARGES */}
                        <div className={styles.modalSection}>
                            <button
                                type="button"
                                className={styles.subModalBtn}
                                onClick={() => setShowChargesModal(true)}
                            >
                                + Additional Charges
                            </button>
                        </div>

                        {/* RECURRING */}
                        <div className={styles.modalSection}>
                            <button
                                type="button"
                                className={styles.subModalBtn}
                                onClick={() => setShowRecurringModal(true)}
                            >
                                + Recurring Options
                            </button>
                        </div>


                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                            <button className={styles.addBtn} onClick={handleAdd}>
                                {editData ? "Save Changes" : "Add Expense"}
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {showChargesModal && (
                <div className={styles.subModalOverlay}>
                    <div className={styles.subModal}>
                        <h3>Additional Charges</h3>

                        <div className={styles.modalSection}>
                            <label>Tax</label>
                            <input type="number" name="tax" value={form.tax} onChange={handleChange} />
                        </div>

                        <div className={styles.modalSection}>
                            <label>Service Fee</label>
                            <input type="number" name="serviceFee" value={form.serviceFee} onChange={handleChange} />
                        </div>

                        <div className={styles.modalSection}>
                            <label>Discount</label>
                            <input type="number" name="discount" value={form.discount} onChange={handleChange} />
                        </div>

                        <div className={styles.modalSection}>
                            <label>Other Charge</label>
                            <input type="number" name="otherCharge" value={form.otherCharge} onChange={handleChange} />
                        </div>

                        <div className={styles.subModalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowChargesModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRecurringModal && (
                <div className={styles.subModalOverlay}>
                    <div className={styles.subModal}>
                        <h3>Recurring Options</h3>

                        <div className={styles.modalSection}>
                            <label>Recurring Type</label>
                            <select
                                name="recurringType"
                                value={form.recurringType}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setForm({
                                        ...form,
                                        recurringType: value,
                                        isRecurring: value !== ""   // ⭐ auto-enable recurring
                                    });
                                }}
                            >
                                <option value="">Select frequency</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <div className={styles.modalSection}>
                            <label>End Date (optional)</label>
                            <input
                                type="date"
                                name="recurringEndDate"
                                value={form.recurringEndDate}
                                onChange={(e) => {
                                    setForm({
                                        ...form,
                                        recurringEndDate: e.target.value,
                                        isRecurring: true   // ⭐ selecting an end date means recurring is ON
                                    });
                                }}
                            />
                        </div>

                        <div className={styles.subModalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowRecurringModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
}