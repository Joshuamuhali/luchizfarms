import Navbar from "@/components/Navbar";
import FarmGallerySection from "@/components/FarmGallerySection";
import Footer from "@/components/Footer";

const GalleryPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <FarmGallerySection />
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;
