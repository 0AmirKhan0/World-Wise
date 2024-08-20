import Logo from "./Logo";
import AppNav from "./AppNav";
import styles from "./Sidebar.module.css";
import CopyrightFooter from "./CopyrightFooter";
import { Outlet } from "react-router-dom";

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo />
      <AppNav />
      <Outlet />
      <CopyrightFooter />
    </div>
  );
}

export default Sidebar;
