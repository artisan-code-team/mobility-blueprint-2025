"use client";

import { Author } from "./components/Author";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Introduction } from "./components/Introdruction";
import { NavBar } from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <Author />
      <Footer />
    </>
  );
}
