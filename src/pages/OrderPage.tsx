import Navbar from "@/components/Navbar";
import OrderSection from "@/components/OrderSection";
import Footer from "@/components/Footer";

const OrderPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <OrderSection />
      </main>
      <Footer />
    </div>
  );
};

export default OrderPage;
