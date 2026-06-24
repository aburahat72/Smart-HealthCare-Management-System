const statusStyles = {
  pending: 'badge-pending',
  accepted: 'badge-upcoming',
  upcoming: 'badge-upcoming',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  rejected: 'badge-cancelled',
};

export default function StatusBadge({ status }) {
  const labels = {
    pending: 'Pending',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    accepted: 'Upcoming',
  };
  const label = labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1);
  return <span className={statusStyles[status] || 'badge-pending'}>{label}</span>;
}
