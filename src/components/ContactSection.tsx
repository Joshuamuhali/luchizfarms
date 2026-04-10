import { useState } from "react";
import { Phone, MapPin, Mail, Send, Circle, Heart, Bird, Carrot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", product: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Luchiz Farm! My name is ${form.name}. Phone: ${form.phone}. Interested in: ${form.product}. Message: ${form.message}`;
    window.open(`https://wa.me/260979654602?text=${encodeURIComponent(text)}`, "_blank");
    toast({ title: "Redirecting to WhatsApp", description: "Your inquiry is being sent via WhatsApp." });
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Get In Touch</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Contact <span className="text-primary">Us</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Phone / WhatsApp</h3>
                <a href="tel:+260979654602" className="text-muted-foreground hover:text-primary transition-colors">+260 979 654 602</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Location</h3>
                <p className="text-muted-foreground">Farm: Chisamba, Central Province</p>
                <p className="text-muted-foreground">Base: Kabwe</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Inquiries</h3>
                <p className="text-muted-foreground">Reach us via WhatsApp for fastest response</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Product Interest</option>
              <option value="Pigs"><Circle className="w-4 h-4 inline mr-2" /> Pigs</option>
              <option value="Sheep"><Heart className="w-4 h-4 inline mr-2" /> Sheep</option>
              <option value="Broiler Chickens"><Bird className="w-4 h-4 inline mr-2" /> Broiler Chickens</option>
              <option value="Vegetables"><Carrot className="w-4 h-4 inline mr-2" /> Assorted Vegetables</option>
              <option value="Multiple">Multiple Products</option>
            </select>
            <textarea
              placeholder="Your Message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all"
            >
              <Send className="w-4 h-4" />
              Send via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
