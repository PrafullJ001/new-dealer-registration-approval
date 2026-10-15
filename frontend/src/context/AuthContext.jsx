// the frame shared by the forgot-password and set-password pages
// same look as the login page: slim navy band, card floating under it, steps along the bottom

// small info shown under the card (display only)
const STEPS = [
  { title: 'Register', text: 'Add a new dealer' },
  { title: 'Review', text: 'Approve or reject' },
  { title: 'Track', text: 'See every status' },
];

export default function AuthShell({ children }) {
  return (
    <div className="auth-scale flex min-h-screen flex-col overflow-x-hidden bg-page">
      {/* top navy part: a slim band, it does not grow with the screen height */}
      <header className="bg-navy px-4 pb-28 pt-10 text-center text-white sm:px-6 md:pb-32 md:pt-14">
        <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">New Dealer Registration And Approval</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">Register, review and approve dealers in one place</p>
      </header>

      {/* card floating over the split */}
      <main className="relative mx-auto mb-10 -mt-20 w-full max-w-md px-4 md:-mt-24 md:max-w-lg">
        <div className="border border-line bg-white p-5 shadow-sm sm:p-6 md:p-8">{children}</div>
      </main>

      {/* three steps under the card, as a strip along the bottom */}
      <footer className="mt-auto border-t border-line bg-white">
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-8 sm:grid-cols-3 md:text-base">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3 text-sm md:text-base">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy text-xs text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-muted">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}