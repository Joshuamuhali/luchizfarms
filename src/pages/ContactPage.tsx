import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
