import { Phone, MessageCircle, Truck } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/260979654602";

const steps = [
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Call or WhatsApp Us",
    description: "Reach us on +260 979 654 602 to discuss your order.",
  },
  {
    icon: <Phone className="w-8 h-8" />,
    title: "Select Your Products",
    description: "Choose from pigs, sheep, broiler chickens, or fresh vegetables.",
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Delivery or Pickup",
    description: "Arrange delivery to Kabwe or pick up from our Chisamba farm.",
  },
];

const HowToOrderSection = () => {
  return (
    <section id="how-to-order" className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-farm-golden font-semibold uppercase tracking-widest text-sm">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            How to Order
          </h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Getting fresh farm produce from Luchiz Farm is easy. Just follow these three steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto text-farm-golden">
                {step.icon}
              </div>
              <div className="text-farm-golden font-display text-4xl font-bold">{i + 1}</div>
              <h3 className="text-xl font-display font-bold">{step.title}</h3>
              <p className="text-primary-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-farm-golden text-farm-golden-foreground font-bold px-10 py-4 rounded-lg text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Order Now on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowToOrderSection;
