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
            const res = await fetch(
                `${API_URL}/analytics/staff/monthly?month=${month}&year=${year}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const json = await res.json();

            const fixed = {
                income: Number(json.income),
                expense: Number(json.expense),
            };

            setData(fixed);
            onDataLoaded && onDataLoaded(fixed);
        }
        load();
    }, []);

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