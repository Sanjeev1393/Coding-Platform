const variantStyles = {
  success: {
    container: "border-green-200 bg-green-50",
    title: "text-green-700",
    message: "text-slate-500",
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    title: "text-amber-800",
    message: "text-amber-700",
  },
  error: {
    container: "border-red-200 bg-red-50",
    title: "text-red-700",
    message: "text-red-600",
  },
  info: {
    container: "border-blue-200 bg-blue-50",
    title: "text-blue-700",
    message: "text-blue-600",
  },
};

function StatusBanner({ variant = "info", title, message, children }) {
  const styles = variantStyles[variant] || variantStyles.info;

  return (
    <div className={`mt-4 rounded-md border p-4 ${styles.container}`}>
      {title && <p className={`font-semibold ${styles.title}`}>{title}</p>}
      {message && <p className={`mt-1 text-sm ${styles.message}`}>{message}</p>}
      {children}
    </div>
  );
}

export default StatusBanner;
