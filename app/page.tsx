"use client";

import { Author } from "./components/Author";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Introduction } from "./components/Introdruction";

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <Author />
      <Footer />
    </>
  );
}
