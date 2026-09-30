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


export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <NewDrops />
      <LifestyleVideo />
      <Footer />
    </>
  );
}