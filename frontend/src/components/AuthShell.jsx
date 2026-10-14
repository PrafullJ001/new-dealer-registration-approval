// the two-column frame shared by the login, forgot-password and set-password pages
export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between gap-8 bg-navy p-8 text-white lg:p-14">
        <div>
          <p className="text-xl font-semibold">Dealer Onboarding Portal</p>
          <p className="text-slate-300">Registration &amp; Approval</p>
        </div>

        <div>
          <h1 className="mb-6 max-w-md text-3xl font-semibold leading-tight">
            Register dealers. Review them. Keep the record.
          </h1>
          <ul className="hidden max-w-md lg:block">
            <li className="border-t border-white/20 py-3 text-slate-300">
              <b className="text-white">Creators</b> register new dealers and follow their status.
            </li>
            <li className="border-t border-white/20 py-3 text-slate-300">
              <b className="text-white">Approvers</b> review each registration and approve or reject it.
            </li>
            <li className="border-t border-white/20 py-3 text-slate-300">
              <b className="text-white">Admins</b> manage users, masters and reports.
            </li>
          </ul>
        </div>

        <p className="max-w-md text-sm text-slate-400">
          Permissions are checked on the server, not only hidden on the screen.
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-line bg-white p-8">{children}</div>
      </section>
    </div>
  );
}