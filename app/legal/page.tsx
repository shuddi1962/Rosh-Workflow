import Link from 'next/link'
import { Sparkles, Shield, FileText, Lock, ArrowLeft } from 'lucide-react'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">GrowPilot</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-[#1468F5]">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Legal & Trust Center</h1>
          <p className="text-slate-600">How GrowPilot handles your data, our terms of service, and how we keep your workspace secure.</p>
        </div>

        <section id="privacy" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-3"><Lock className="w-5 h-5 text-[#1468F5]" /><h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2></div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>GrowPilot collects only the data needed to run your workspace: account details, business profile information, leads and campaign content you create, and usage analytics.</p>
            <p>We never sell your data. Lead contact details you upload or scrape remain inside your business workspace and are never shared with other businesses on the platform.</p>
            <p>API keys you store in the admin vault are encrypted at rest (AES-256-GCM) and only ever used server-side. To request export or deletion of your data, contact <a className="text-[#1468F5] underline" href="mailto:info@roshanalinfotech.com">info@roshanalinfotech.com</a>.</p>
          </div>
        </section>

        <section id="terms" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-[#1468F5]" /><h2 className="text-xl font-bold text-slate-900">Terms of Service</h2></div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>Each subscription plan (Starter, Professional, Business, Enterprise) defines included features, team seats, and monthly usage limits. Features outside your plan are locked until you upgrade.</p>
            <p>You are responsible for the content you publish, the contacts you message (including WhatsApp opt-out compliance via the STOP keyword), and keeping your login credentials safe.</p>
            <p>Subscriptions renew monthly and can be cancelled anytime. Abuse, spam, or unlawful use may lead to suspension after notice.</p>
          </div>
        </section>

        <section id="security" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-[#1468F5]" /><h2 className="text-xl font-bold text-slate-900">Security</h2></div>
          <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
            <p>Authentication uses short-lived JWT access tokens (15 minutes) with 7-day refresh tokens. Passwords are hashed with bcrypt (12 rounds).</p>
            <p>Admin routes require the admin role at middleware level, every admin action is written to an audit log, and destructive records use soft archive instead of hard deletion.</p>
            <p>Questions about security? Reach us on WhatsApp at 08109522432 or email <a className="text-[#1468F5] underline" href="mailto:info@roshanalinfotech.com">info@roshanalinfotech.com</a>.</p>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-[#F6F9FD] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Contact</h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Roshanal Infotech Limited — No 18A Rumuola/Rumuadaolu Road, Port Harcourt, Rivers State</p>
            <p>Phone/WhatsApp: 08109522432 | 08033170802 | 08180388018</p>
            <p>Email: <a className="text-[#1468F5] underline" href="mailto:info@roshanalinfotech.com">info@roshanalinfotech.com</a></p>
          </div>
          <div className="flex gap-2 mt-4">
            <a href="https://wa.me/2348109522432" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#10B981] text-white hover:opacity-90">Chat on WhatsApp</a>
            <Link href="/register" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1468F5] text-white hover:opacity-90">Get Started Free</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
