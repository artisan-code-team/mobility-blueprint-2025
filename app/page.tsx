"use client";

import { Author } from "./components/Author";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Author />
      <Footer />
    </>
  );
}
