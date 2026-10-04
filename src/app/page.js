import Link from "next/link";
import {
  FiRefreshCw,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import Hero from "../components/home/Hero";
import CategoryShowcase from "../components/home/CategoryShowcase";
import NewDrops from "../components/home/NewDrops";
import LifestyleVideo from "@/components/home/LifestyleVideo";
import Footer from "@/components/layout/Footer";
import HomePromoBanners from "@/components/home/HomePromoBanners";
import ShopByBudget from "@/components/home/ShopByBudget";
import SmallAnimatedpromo from "@/components/home/SmallAnimatedPromo";


export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <SmallAnimatedpromo
        href="/category/all"
        title="Limited-time fashion offer"
      />
      <HomePromoBanners />
      <NewDrops />
      <ShopByBudget />
      <LifestyleVideo />
      <Footer />
    </>
  );
}