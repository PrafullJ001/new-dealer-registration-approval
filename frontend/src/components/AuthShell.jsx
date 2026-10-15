// the frame shared by the forgot-password and set-password pages
// same look as the login page: slim navy band, card floating under it, steps right below

// small info shown under the card (display only)
const STEPS = [
  { title: 'Register', text: 'Add a new dealer' },
  { title: 'Review', text: 'Approve or reject' },
  { title: 'Track', text: 'See every status' },
];

export default function AuthShell({ children }) {
  return (
    <div className="auth-scale flex min-h-screen flex-col overflow-x-hidden bg-page">
      {/* slim navy band */}
      <header className="bg-navy px-4 pb-20 pt-6 text-center text-white sm:px-6 md:pb-24 md:pt-8">
        <h1 className="text-xl font-semibold sm:text-2xl md:text-3xl">New Dealer Registration And Approval</h1>
        <p className="mt-1 text-sm text-slate-300">Register, review and approve dealers in one place</p>
      </header>

      {/* card floating over the band */}
      <main className="relative mx-auto -mt-14 w-full max-w-md px-4 md:-mt-16 md:max-w-lg">
        <div className="border border-line bg-white p-5 shadow-sm sm:p-6 md:p-6">{children}</div>
      </main>

      {/* steps: always 3 in a row. phone = number on top, bigger screens = number beside text */}
      <section className="mx-auto mb-6 mt-5 grid w-full max-w-3xl grid-cols-3 gap-2 px-3 sm:gap-4 sm:px-6">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-start sm:justify-center sm:gap-3 sm:text-left"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-sm text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-base font-medium sm:text-lg">{s.title}</p>
              <p className="text-sm leading-snug text-muted sm:text-base">{s.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}