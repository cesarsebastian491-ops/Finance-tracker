import { Outlet } from "react-router-dom";
import StaffSidebar from "./Components/StaffSideBar";
import styles from "./staffLayout.module.css";
import "./Components/staffTheme.css";

export default function StaffLayout() {
  return (
    <div className={styles.layout}>
      <StaffSidebar />

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}