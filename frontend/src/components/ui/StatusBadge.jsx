const StatusBadge = ({ status, className = "" }) => {
  const getBadgeStyle = (s) => {
    const stat = s?.toUpperCase() || "";
    if (["SUCCESS", "RECOVERED", "APPROVED", "EXECUTED"].includes(stat)) {
      return "badge-success";
    }
    if (["PENDING", "RECOMMENDED", "MANUAL_REVIEW"].includes(stat)) {
      return "badge-warning";
    }
    if (["FAILED", "REJECTED", "ERROR", "NOT_CONFIGURED"].includes(stat)) {
      return "badge-danger";
    }
    return "badge-neutral";
  };

  const badgeClass = getBadgeStyle(status);

  return (
    <span className={`${badgeClass} ${className}`}>
      {status ? status.replace(/_/g, " ") : "UNKNOWN"}
    </span>
  );
};

export default StatusBadge;
