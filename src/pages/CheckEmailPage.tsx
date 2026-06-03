import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LOGO_URL } from "@/lib/constants";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";

const CheckEmailPage = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
        <div className="max-w-md w-full text-center space-y-8">

          {/* Logo */}
          <img
            src={LOGO_URL}
            alt="Luchiz Farm"
            className="w-20 h-20 object-contain rounded-2xl mx-auto shadow-md"
          />

          {/* Icon */}
          <div className="w-20 h-20 bg-farm-leaf/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-farm-leaf" />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Look out for a confirmation link we sent
              {email ? (
                <> to <span className="font-semibold text-foreground">{email}</span></>
              ) : " to your email address"}.
            </p>
            <p className="text-muted-foreground">
              Click the link in that email to confirm your registration, then come back here to sign in.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-farm-card rounded-2xl border border-border p-6 text-left space-y-4">
            {[
              { step: "1", text: "Open your email inbox" },
              { step: "2", text: 'Find the email from Luchiz Farm (check Spam too)' },
              { step: "3", text: "Click the confirmation link" },
              { step: "4", text: "Come back and sign in" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-farm-leaf text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {step}
                </div>
                <span className="text-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-farm-leaf text-white font-semibold px-6 py-3 rounded-xl hover:bg-farm-forest transition-all"
            >
              Go to sign in
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center gap-2 border border-border text-muted-foreground px-6 py-3 rounded-xl hover:border-farm-leaf hover:text-farm-leaf transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Used a wrong email? Register again
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckEmailPage;
