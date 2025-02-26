"use client";

import { Author } from "./components/Author";
import { BackLine } from "./components/BackLine";
import { Footer } from "./components/Footer";
import { FrontLine } from "./components/FrontLine";
import { Hero } from "./components/Hero";
import { InnerLines } from "./components/InnerLine";
import { Introduction } from "./components/Introdruction";
import { LateralLines } from "./components/LateralLine";
import { NavBar } from "./components/Navbar";
import { SpiralLine } from "./components/SpiralLine";

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <LateralLines />
      <InnerLines />
      <FrontLine />
      <BackLine />
      <SpiralLine />
      <Author />
      <Footer />
    </>
  );
}
