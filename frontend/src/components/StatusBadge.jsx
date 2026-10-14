const styles = {
  PENDING: 'border-warn bg-warn-bg text-warn',
  APPROVED: 'border-ok bg-ok-bg text-ok',
  REJECTED: 'border-bad bg-bad-bg text-bad',
};

export default function StatusBadge({ status }) {
  const label = status[0] + status.slice(1).toLowerCase();
  return (
    <span className={`inline-block border px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {label}
    </span>
  );
}