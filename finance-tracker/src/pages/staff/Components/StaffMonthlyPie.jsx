import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { API_URL } from "../../../config";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StaffMonthlyPie({ onDataLoaded }) {
    const token = JSON.parse(localStorage.getItem("user"))?.access_token;
    const [data, setData] = useState(null);

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(
                    `${API_URL}/analytics/staff/monthly?month=${month}&year=${year}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await res.json();

                const income = Number(json.income) || 0;
                const expense = Number(json.expense) || 0;

                const fixed = {
                    income: isNaN(income) ? 0 : income,
                    expense: isNaN(expense) ? 0 : expense,
                };

                setData(fixed);
                onDataLoaded && onDataLoaded(fixed);
            } catch (err) {
                console.error("Monthly data load error:", err);
                setData({ income: 0, expense: 0 });
                onDataLoaded && onDataLoaded({ income: 0, expense: 0 });
            }
        }
        if (token) load();
    }, [token]);

    if (!data) return <p>Loading chart...</p>;

    // Get CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const staffColor = rootStyles.getPropertyValue("--staff-color").trim();
    const staffColorLight = rootStyles.getPropertyValue("--staff-color-light").trim();

    const chartData = {
        labels: ["Income", "Expense"],
        datasets: [
            {
                data: [data.income, data.expense],
                backgroundColor: [staffColor, "#ef4444"],
                hoverBackgroundColor: [staffColorLight, "#dc2626"],
                borderWidth: 0,
            },
        ],
    };

    return (
        <Pie
        
            data={chartData}
            options={{
                plugins: {
                    legend: { position: "bottom" },
                },
            }}
        />
    );
}