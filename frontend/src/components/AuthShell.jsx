// the two-column frame shared by the forgot-password and set-password pages
export default function AuthShell({ children }) {
  return (
    <div className="auth-scale flex min-h-screen flex-col overflow-x-hidden md:grid md:grid-cols-2">
      <section className="flex flex-col justify-between gap-6 bg-navy px-6 py-8 text-white md:gap-8 md:p-10 lg:p-14">
        <div>
          <p className="text-xl font-semibold">New Dealer Registration And Approval</p>
        </div>

        <div>
          <h1 className="max-w-md text-2xl font-semibold leading-tight md:mb-6 md:text-3xl lg:text-4xl">
            Register dealers. Review them. Keep the record.
          </h1>
          <ul className="hidden max-w-md md:block">
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

      <section className="flex flex-1 items-start justify-center p-4 md:items-center md:p-8">
        <div className="w-full max-w-md border border-line bg-white p-6 shadow-sm md:max-w-lg md:p-10 lg:max-w-md lg:p-8">
          {children}
        </div>
      </section>
    </div>
  );
}