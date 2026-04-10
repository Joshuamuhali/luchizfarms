import Navbar from "@/components/Navbar";
import HowToOrderSection from "@/components/HowToOrderSection";
import Footer from "@/components/Footer";

const HowToOrderPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HowToOrderSection />
      </main>
      <Footer />
    </div>
  );
};

export default HowToOrderPage;
