import { useEffect, useState, useContext } from "react";
import { API_URL } from "../../../../config";
import { CurrencyContext } from "../../../../context/CurrencyContext";
import styles from "./SystemSettingsPage.module.css";

export default function SystemSettingsPage() {
  const { setActiveCurrency: setGlobalCurrency } = useContext(CurrencyContext);
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryType, setEditingCategoryType] = useState("expense");
  const [showInactive, setShowInactive] = useState(false);

  // Currency states
  const [currencies, setCurrencies] = useState([]);
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("");
  const [newCurrencyRate, setNewCurrencyRate] = useState("1");
  const [editingCurrencyId, setEditingCurrencyId] = useState(null);
  const [editingCurrencyCode, setEditingCurrencyCode] = useState("");
  const [editingCurrencyName, setEditingCurrencyName] = useState("");
  const [editingCurrencySymbol, setEditingCurrencySymbol] = useState("");
  const [editingCurrencyRate, setEditingCurrencyRate] = useState("1");
  const [activeCurrencyId, setActiveCurrencyId] = useState(null);


  // Load current app name
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    fetch(`${API_URL}/system-settings/app-name`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAppName(data.value);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading app name:", err);
        console.log("API_URL =", API_URL);
        setLoading(false);
      });
  }, []);

  // Load system info
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    fetch(`${API_URL}/system-settings/system-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSystemInfo(data))
      .catch((err) => console.error("Error loading system info:", err));
  }, []);

  // Save new app name
  const save = async () => {
    setSaving(true);

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    await fetch(`${API_URL}/system-settings/app-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value: appName }),
    });

    setSaving(false);
  };

  const loadCategories = async (inactive = showInactive) => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const url = inactive
        ? `${API_URL}/transactions/categories?includeInactive=true`
        : `${API_URL}/transactions/categories`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleShowInactive = () => {
    const next = !showInactive;
    setShowInactive(next);
    loadCategories(next);
  };

  const reactivateCategory = async (id) => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return;

      const res = await fetch(`${API_URL}/transactions/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: cat.name, type: cat.type }),
      });

      if (!res.ok) throw new Error("Failed to reactivate category");

      await loadCategories();
    } catch (err) {
      console.error("Reactivate category failed:", err);
      alert("Failed to reactivate category");
    }
  };

  // Load currencies
  const loadCurrencies = async () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/currencies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const currenciesList = Array.isArray(data) ? data : [];
      setCurrencies(currenciesList);

      // Find active currency
      const active = currenciesList.find((c) => c.isActive);
      if (active) {
        setActiveCurrencyId(active.id);
      }
    } catch (err) {
      console.error("Error loading currencies:", err);
      setCurrencies([]);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/transactions/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type: newCategoryType }),
      });

      if (!res.ok) throw new Error("Failed to add category");

      setNewCategoryName("");
      await loadCategories();
    } catch (err) {
      console.error("Add category failed:", err);
      alert("Failed to add category");
    }
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryType(category.type);
  };

  const saveCategoryEdit = async () => {
    const name = editingCategoryName.trim();
    if (!editingCategoryId || !name) return;

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/transactions/categories/${editingCategoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type: editingCategoryType }),
      });

      if (!res.ok) throw new Error("Failed to update category");

      setEditingCategoryId(null);
      setEditingCategoryName("");
      await loadCategories();
    } catch (err) {
      console.error("Update category failed:", err);
      alert("Failed to update category");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/transactions/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete category");

      if (editingCategoryId === id) {
        setEditingCategoryId(null);
        setEditingCategoryName("");
      }

      await loadCategories();
    } catch (err) {
      console.error("Delete category failed:", err);
      alert("Failed to delete category");
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const hasInactive = categories.some((c) => c.isActive === 0);

  // Currency management functions
  const addCurrency = async () => {
    const code = newCurrencyCode.trim();
    const name = newCurrencyName.trim();
    const symbol = newCurrencySymbol.trim();
    const rate = parseFloat(newCurrencyRate) || 1;

    if (!code || !name || !symbol) {
      alert("Please fill in all currency fields");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/currencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, name, symbol, exchangeRate: rate }),
      });

      if (!res.ok) throw new Error("Failed to add currency");

      setNewCurrencyCode("");
      setNewCurrencyName("");
      setNewCurrencySymbol("");
      setNewCurrencyRate("1");
      await loadCurrencies();
    } catch (err) {
      console.error("Add currency failed:", err);
      alert("Failed to add currency");
    }
  };

  const startEditCurrency = (currency) => {
    setEditingCurrencyId(currency.id);
    setEditingCurrencyCode(currency.code);
    setEditingCurrencyName(currency.name);
    setEditingCurrencySymbol(currency.symbol);
    setEditingCurrencyRate(currency.exchangeRate.toString());
  };

  const saveCurrencyEdit = async () => {
    if (!editingCurrencyId) return;

    const name = editingCurrencyName.trim();
    const symbol = editingCurrencySymbol.trim();
    const rate = parseFloat(editingCurrencyRate) || 1;

    if (!name || !symbol) {
      alert("Please fill in all fields");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/currencies/${editingCurrencyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, symbol, exchangeRate: rate }),
      });

      if (!res.ok) throw new Error("Failed to update currency");

      setEditingCurrencyId(null);
      setEditingCurrencyCode("");
      setEditingCurrencyName("");
      setEditingCurrencySymbol("");
      setEditingCurrencyRate("1");
      await loadCurrencies();
    } catch (err) {
      console.error("Update currency failed:", err);
      alert("Failed to update currency");
    }
  };

  const setActiveCurrency = async (id) => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/currencies/${id}/activate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to set active currency");

      const updatedCurrency = await res.json();
      setActiveCurrencyId(id);
      setGlobalCurrency(updatedCurrency);
      await loadCurrencies();
    } catch (err) {
      console.error("Set active currency failed:", err);
      alert("Failed to set active currency");
    }
  };

  const deleteCurrency = async (id) => {
    if (!confirm("Delete this currency?")) return;

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    try {
      const res = await fetch(`${API_URL}/currencies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete currency");

      if (editingCurrencyId === id) {
        setEditingCurrencyId(null);
        setEditingCurrencyCode("");
        setEditingCurrencyName("");
        setEditingCurrencySymbol("");
        setEditingCurrencyRate("1");
      }

      await loadCurrencies();
    } catch (err) {
      console.error("Delete currency failed:", err);
      alert("Failed to delete currency");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
    <h2 className={styles.title}>System Settings</h2>
    <div className={styles.container}>
      

      <div className={styles.section}>
        <label className={styles.label}>App Name</label>
        <input
          className={styles.input}
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />

        <button className={styles.saveButton} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {/* SYSTEM INFO PANEL */}
      <div className={styles.section}>
        <h3 className={styles.subTitle}>System Information</h3>

        {!systemInfo ? (
          <p>Loading system info...</p>
        ) : (
          <>
            <div className={styles.infoRow}>
              <label>App Version</label>
              <p>{systemInfo.version}</p>
            </div>

            <div className={styles.infoRow}>
              <label>Server Uptime</label>
              <p>{Math.floor(systemInfo.uptime)} seconds</p>
            </div>

            <div className={styles.infoRow}>
              <label>Database Status</label>
              <p>{systemInfo.database}</p>
            </div>

            <div className={styles.infoRow}>
              <label>Environment</label>
              <p>{systemInfo.environment}</p>
            </div>
          </>
        )}
      </div>
      {/* BACKUP & RESTORE SECTION */}
      <div className={styles.section}>
        <h3 className={styles.subTitle}>Backup & Restore</h3>

        {/* BACKUP BUTTON */}
        <button
          className={styles.saveButton}
          onClick={async () => {
            try {
              const stored = JSON.parse(localStorage.getItem("user"));
              const token = stored?.access_token;

              const res = await fetch(`${API_URL}/system-settings/backup/export`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = "backup.json";
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Backup failed:", err);
              alert("Backup failed");
            }
          }}
        >
          Download Backup
        </button>

        {/* RESTORE BUTTON + HIDDEN INPUT */}
        <input
          type="file"
          id="restoreFile"
          accept=".json"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const stored = JSON.parse(localStorage.getItem("user"));
            const token = stored?.access_token;

            const formData = new FormData();
            formData.append("file", file);

            try {
              const res = await fetch(`${API_URL}/system-settings/backup/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              });

              const data = await res.json();
              alert(data.message || "Restore complete");
            } catch (err) {
              console.error("Restore failed:", err);
              alert("Restore failed");
            }
          }}
        />

        <button
          className={styles.saveButton}
          onClick={() => document.getElementById("restoreFile").click()}
        >
          Upload Backup
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.subTitle}>Categories</h3>

        <div className={styles.toggleRow}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={toggleShowInactive}
            />
            Show inactive categories
          </label>
        </div>

        <div className={styles.categoryCreateRow}>
          <input
            className={styles.input}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
          />

          <select
            className={styles.input}
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <button className={styles.saveButton} onClick={addCategory}>Add</button>
        </div>

        <div className={styles.categoryListWrapper}>
          <div className={styles.categoryColumns}>
            <div>
              <h4 className={styles.categoryTypeTitle}>Expense</h4>
              {expenseCategories.map((cat) => (
                <div key={cat.id} className={`${styles.categoryRow} ${cat.isActive === 0 ? styles.inactiveRow : ''}`}>
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        className={styles.categoryEditInput}
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                      />
                      <select
                        className={styles.categoryTypeSelect}
                        value={editingCategoryType}
                        onChange={(e) => setEditingCategoryType(e.target.value)}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <button className={styles.smallButton} onClick={saveCategoryEdit}>Save</button>
                      <button
                        className={styles.smallButtonMuted}
                        onClick={() => {
                          setEditingCategoryId(null);
                          setEditingCategoryName("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{cat.name} {cat.isActive === 0 && <span className={styles.inactiveBadge}>Inactive</span>}</span>
                      <div className={styles.categoryActions}>
                        {cat.isActive === 0 ? (
                          <button className={styles.smallButton} onClick={() => reactivateCategory(cat.id)}>
                            Reactivate
                          </button>
                        ) : (
                          <>
                            <button className={styles.smallButton} onClick={() => startEditCategory(cat)}>
                              Edit
                            </button>
                            <button className={styles.deleteButton} onClick={() => deleteCategory(cat.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h4 className={styles.categoryTypeTitle}>Income</h4>
              {incomeCategories.map((cat) => (
                <div key={cat.id} className={`${styles.categoryRow} ${cat.isActive === 0 ? styles.inactiveRow : ''}`}>
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        className={styles.categoryEditInput}
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                      />
                      <select
                        className={styles.categoryTypeSelect}
                        value={editingCategoryType}
                        onChange={(e) => setEditingCategoryType(e.target.value)}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <button className={styles.smallButton} onClick={saveCategoryEdit}>Save</button>
                      <button
                        className={styles.smallButtonMuted}
                        onClick={() => {
                          setEditingCategoryId(null);
                          setEditingCategoryName("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{cat.name} {cat.isActive === 0 && <span className={styles.inactiveBadge}>Inactive</span>}</span>
                      <div className={styles.categoryActions}>
                        {cat.isActive === 0 ? (
                          <button className={styles.smallButton} onClick={() => reactivateCategory(cat.id)}>
                            Reactivate
                          </button>
                        ) : (
                          <>
                            <button className={styles.smallButton} onClick={() => startEditCategory(cat)}>
                              Edit
                            </button>
                            <button className={styles.deleteButton} onClick={() => deleteCategory(cat.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CURRENCY MANAGEMENT SECTION */}
      <div className={styles.section}>
        <h3 className={styles.subTitle}>Currencies</h3>

        <div className={styles.categoryCreateRow}>
          <input
            className={styles.input}
            value={newCurrencyCode}
            onChange={(e) => setNewCurrencyCode(e.target.value)}
            placeholder="Code (USD)"
            style={{ maxWidth: "80px" }}
          />

          <input
            className={styles.input}
            value={newCurrencyName}
            onChange={(e) => setNewCurrencyName(e.target.value)}
            placeholder="Name (US Dollar)"
            style={{ flex: 1, minWidth: "120px" }}
          />

          <input
            className={styles.input}
            value={newCurrencySymbol}
            onChange={(e) => setNewCurrencySymbol(e.target.value)}
            placeholder="Symbol ($)"
            style={{ maxWidth: "60px" }}
          />

          <input
            type="number"
            className={styles.input}
            value={newCurrencyRate}
            onChange={(e) => setNewCurrencyRate(e.target.value)}
            placeholder="Rate"
            step="0.01"
            style={{ maxWidth: "80px" }}
          />

          <button className={styles.saveButton} onClick={addCurrency}>Add</button>
        </div>

        <div className={styles.categoryListWrapper}>
          {currencies.length === 0 ? (
            <p style={{ color: "#6b7280", margin: "10px 0" }}>No currencies found</p>
          ) : (
            <div>
              {currencies.map((currency) => (
                <div key={currency.id} className={styles.categoryRow}>
                  {editingCurrencyId === currency.id ? (
                    <>
                      <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                        <input
                          className={styles.categoryEditInput}
                          value={editingCurrencyCode}
                          disabled
                          style={{ maxWidth: "80px", backgroundColor: "#e5e7eb" }}
                        />
                        <input
                          className={styles.categoryEditInput}
                          value={editingCurrencyName}
                          onChange={(e) => setEditingCurrencyName(e.target.value)}
                          style={{ flex: 1, minWidth: "100px" }}
                        />
                        <input
                          className={styles.categoryEditInput}
                          value={editingCurrencySymbol}
                          onChange={(e) => setEditingCurrencySymbol(e.target.value)}
                          style={{ maxWidth: "60px" }}
                        />
                        <input
                          type="number"
                          className={styles.categoryEditInput}
                          value={editingCurrencyRate}
                          onChange={(e) => setEditingCurrencyRate(e.target.value)}
                          step="0.01"
                          style={{ maxWidth: "80px" }}
                        />
                      </div>
                      <button className={styles.smallButton} onClick={saveCurrencyEdit}>Save</button>
                      <button
                        className={styles.smallButtonMuted}
                        onClick={() => {
                          setEditingCurrencyId(null);
                          setEditingCurrencyCode("");
                          setEditingCurrencyName("");
                          setEditingCurrencySymbol("");
                          setEditingCurrencyRate("1");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                        <span style={{ fontWeight: "600", minWidth: "50px" }}>{currency.code}</span>
                        <span>{currency.name}</span>
                        <span style={{ color: "#6b7280" }}>({currency.symbol})</span>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Rate: {currency.exchangeRate}</span>
                        {currency.isActive && (
                          <span style={{
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>Active</span>
                        )}
                      </div>
                      <div className={styles.categoryActions}>
                        {!currency.isActive && (
                          <button className={styles.smallButton} onClick={() => setActiveCurrency(currency.id)}>
                            Activate
                          </button>
                        )}
                        <button className={styles.smallButton} onClick={() => startEditCurrency(currency)}>
                          Edit
                        </button>
                        <button 
                          className={styles.deleteButton} 
                          onClick={() => deleteCurrency(currency.id)}
                          disabled={currency.isActive}
                          style={{ opacity: currency.isActive ? 0.5 : 1, cursor: currency.isActive ? "not-allowed" : "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    </>
    

  );
}