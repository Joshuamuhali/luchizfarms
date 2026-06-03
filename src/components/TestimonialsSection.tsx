import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Mary M.",
    location: "Kabwe",
    text: "The vegetables from Luchiz Farm are always so fresh! You can really taste the difference. I've never been disappointed.",
    rating: 5,
  },
  {
    name: "Joseph C.",
    location: "Chisamba",
    text: "I ordered chickens for my restaurant and the quality was excellent. Consistent and reliable supply. Highly recommended!",
    rating: 5,
  },
  {
    name: "Grace N.",
    location: "Kabwe",
    text: "Supporting a local Zambian farmer feels great. The pigs were healthy and well-raised. Will definitely order again.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-farm-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-secondary font-semibold uppercase tracking-widest text-sm">What Customers Say</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Happy <span className="text-primary">Customers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-farm-golden text-farm-golden" />
                ))}
              </div>
              <p className="text-muted-foreground italic leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-display font-bold text-foreground">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
