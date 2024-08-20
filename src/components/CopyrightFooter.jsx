import styles from "./CopyrightFooter.module.css";
function CopyrightFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        &copy; Copyright {new Date().getFullYear()} by WorldWise Inc.
      </p>
    </footer>
  );
}

export default CopyrightFooter;
