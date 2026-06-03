import { Link } from "react-router-dom";
import {
  UserPlus,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Register with your name, phone, and email so we can track your order.",
    href: "/register",
    cta: "Sign up free",
  },
  {
    icon: ShoppingCart,
    title: "Browse & place order",
    description: "Choose fresh vegetables and meat, set quantities, and place your order online.",
    href: "/order",
    cta: "Shop produce",
  },
  {
    icon: Package,
    title: "Send for packaging",
    description: "From your order page, tap Send for packaging so we start preparing.",
    href: "/account/orders",
    cta: "My orders",
    requiresAuth: true,
  },
  {
    icon: CreditCard,
    title: "Pay when ready",
    description: "We confirm your total, then you pay by mobile money to our payment number.",
    href: "/account/orders",
    cta: "View orders",
    requiresAuth: true,
  },
  {
    icon: Truck,
    title: "Delivery or pickup",
    description: "We deliver to Kabwe and beyond, or you can pick up from Chisamba.",
    href: "/contact",
    cta: "Contact us",
  },
];

const HowToOrderSection = () => {
  const { user } = useAuth();

  return (
    <section id="how-to-order" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-farm-golden font-semibold uppercase tracking-widest text-sm">
            Your journey
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold">How to order</h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            From sign-up to delivery — everything happens in a few clear steps on the website.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const linkTo =
              step.requiresAuth && !user ? "/login" : step.href;
            return (
              <div
                key={step.title}
                className="bg-primary-foreground/5 rounded-2xl p-6 border border-primary-foreground/10 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-farm-golden/20 flex items-center justify-center text-farm-golden font-bold">
                    {i + 1}
                  </div>
                  <Icon className="w-6 h-6 text-farm-golden" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{step.title}</h3>
                <p className="text-primary-foreground/70 text-sm flex-1 mb-4">
                  {step.description}
                </p>
                <Link
                  to={linkTo}
                  className="text-sm font-semibold text-farm-golden hover:underline"
                >
                  {step.requiresAuth && !user ? "Sign in first →" : `${step.cta} →`}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/order" : "/register"}
            className="inline-flex items-center gap-2 bg-farm-golden text-farm-golden-foreground font-bold px-10 py-4 rounded-lg text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            {user ? "Start shopping" : "Create account & shop"}
          </Link>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 border-2 border-primary-foreground/30 px-8 py-4 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Browse as guest
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowToOrderSection;
