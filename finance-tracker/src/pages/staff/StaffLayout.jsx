import { Outlet } from "react-router-dom";
import StaffSidebar from "./Components/StaffSideBar";
import { useAutoLogout } from "../../components/hooks/useAutoLogout";
import styles from "./staffLayout.module.css";
import "./Components/staffTheme.css";

export default function StaffLayout() {
  // Auto-logout after 15 minutes of inactivity, with 1 minute warning
  useAutoLogout(15, 1);

  return (
    <div className={styles.layout}>
      <StaffSidebar />

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}