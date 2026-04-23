import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import styles from "./AddIncomeModal.module.css";
import { API_URL } from "../config";
import { CurrencyContext } from "../context/CurrencyContext";

const DEFAULT_INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Bonus",
    "Gift",
    "Refund",
    "Other",
];

export default function AddIncomeModal({ open, onClose, onSubmit, editData }) {
    const { activeCurrency } = useContext(CurrencyContext);
    const [showChargesModal, setShowChargesModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);

    const [form, setForm] = useState({
        source: "",
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
        recurringEndDate: "",
        nextDueDate: ""
    });

    const [errors, setErrors] = useState({});
    const [categoryOptions, setCategoryOptions] = useState(DEFAULT_INCOME_CATEGORIES);

    useEffect(() => {
        if (!open) return;

        async function loadCategories() {
            try {
                const res = await fetch(`${API_URL}/transactions/categories?type=income`);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const names = data
                        .map((item) => item?.name)
                        .filter(Boolean);

                    setCategoryOptions(names.length > 0 ? names : DEFAULT_INCOME_CATEGORIES);
                } else {
                    setCategoryOptions(DEFAULT_INCOME_CATEGORIES);
                }
            } catch {
                setCategoryOptions(DEFAULT_INCOME_CATEGORIES);
            }
        }

        loadCategories();
    }, [open]);

    // ⭐ Prefill when editing
    useEffect(() => {
        if (editData) {
            setForm({
                source: editData.source || "",
                category: editData.category || "",
                date: editData.date || "",
                amount: editData.amount || "",
                description: editData.description || "",

                tax: editData.tax || "",
                serviceFee: editData.serviceFee || "",
                discount: editData.discount || "",
                otherCharge: editData.otherCharge || "",

                isRecurring: editData.isRecurring === 1,
                recurringType: editData.recurringType || "",
                recurringEndDate: editData.recurringEndDate || "",
                nextDueDate: editData.nextDueDate || ""
            });
        } else {
            setForm({
                source: "",
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
                nextDueDate: ""
            });
        }

        setErrors({});
    }, [editData, open]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = scrollbarWidth + 'px';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0px';
        };
    }, [open]);

    if (!open) return null;

    function sanitize(value) {
        return value
            .replace(/<script.*?>.*?<\/script>/gi, "")
            .replace(/[<>]/g, "")
            .trim();
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: sanitize(value)
        }));

        setErrors(prev => ({ ...prev, [name]: "" }));
    }

    function validate() {
        const newErrors = {};

        if (!form.source.trim()) newErrors.source = "Income title is required";
        if (!form.category) newErrors.category = "Category is required";
        if (!form.date) newErrors.date = "Date is required";
        if (!form.amount || Number(form.amount) <= 0)
            newErrors.amount = "Amount must be greater than 0";

        if (form.description.length > 200)
            newErrors.description = "Description must be under 200 characters";

        return newErrors;
    }

    function handleSubmit(e) {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const data = {
            id: editData?.id,
            source: form.source,
            category: form.category,
            date: form.date,
            amount: Number(form.amount),
            description: form.description,
            type: "income",

            // ⭐ Additional charges
            tax: Number(form.tax) || null,
            serviceFee: Number(form.serviceFee) || null,
            discount: Number(form.discount) || null,
            otherCharge: Number(form.otherCharge) || null,

            // ⭐ Recurring
            isRecurring: form.isRecurring ? 1 : 0,
            recurringType: form.recurringType || null,
            recurringEndDate: form.recurringEndDate || null
        };

        onSubmit(data);
        onClose();
    }

    return createPortal(
        <div className={styles.incomemodalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2>{editData ? "Edit Income" : "Add Income"}</h2>

                <form onSubmit={handleSubmit}>

                    {/* INCOME */}
                    <div className={styles.modalSection}>
                        <label>Income Title</label>
                        <input
                            name="source"
                            type="text"
                            value={form.source}
                            onChange={handleChange}
                            placeholder="e.g. Salary"
                        />
                        {errors.source && <p className={styles.errorText}>{errors.source}</p>}
                    </div>

                    <div className={styles.modalSection}>
                        <label>Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                        >
                            <option value="">Select category</option>
                            {categoryOptions.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className={styles.errorText}>{errors.category}</p>}
                    </div>

                    {/* DATE */}
                    <div className={styles.modalSection}>
                        <label>Date</label>
                        <input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                        />
                        {errors.date && <p className={styles.errorText}>{errors.date}</p>}
                    </div>

                    {/* AMOUNT */}
                    <div className={styles.modalSection}>
                        <label>Amount ({activeCurrency?.symbol})</label>
                        <input
                            name="amount"
                            type="number"
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
                            placeholder="Optional notes about this income"
                        />
                        {errors.description && (
                            <p className={styles.errorText}>{errors.description}</p>
                        )}
                    </div>

                    {/* TWO BUTTONS */}
                    <div className={styles.rowTwoButtons}>
                        <button
                            type="button"
                            className={styles.subModalBtn}
                            onClick={() => setShowChargesModal(true)}
                        >
                            + Additional Amounts
                        </button>

                        <button
                            type="button"
                            className={styles.subModalBtn}
                            onClick={() => setShowRecurringModal(true)}
                        >
                            + Recurring Options
                        </button>
                    </div>

                    {/* ACTIONS */}
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button type="submit" className={styles.addBtn}>
                            {editData ? "Save Changes" : "Add Income"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ADDITIONAL AMOUNTS MODAL */}
            {showChargesModal && (
                <div className={styles.subModalOverlay} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.subModal}>
                        <h3>Additional Amounts</h3>

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
                            <label>Other Charges</label>
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

            {/* RECURRING MODAL */}
            {showRecurringModal && (
                <div className={styles.subModalOverlay} onClick={(e) => e.stopPropagation()}>
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
                                        isRecurring: value !== ""
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
                            <label>Next Due Date</label>
                            <input
                                type="date"
                                name="nextDueDate"
                                value={form.nextDueDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nextDueDate: e.target.value,
                                        isRecurring: true
                                    })
                                }
                            />
                        </div>

                        <div className={styles.modalSection}>
                            <label>End Date (optional)</label>
                            <input
                                type="date"
                                name="recurringEndDate"
                                value={form.recurringEndDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        recurringEndDate: e.target.value,
                                        isRecurring: true
                                    })
                                }
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
        </div>,
        document.body
    );
}