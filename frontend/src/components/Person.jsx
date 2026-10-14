const ROLE_NAME = { ADMIN: 'Admin', APPROVER: 'Approver', CREATOR: 'Creator' };

// shows a person's name with their role, used wherever a user is named
export default function Person({ user }) {
  if (!user) return <span className="text-muted">-</span>;
  return (
    <span>
      {user.name} <span className="text-muted">({ROLE_NAME[user.role]})</span>
    </span>
  );
}