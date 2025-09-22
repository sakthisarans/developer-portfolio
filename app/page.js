"use client";
import { useEffect, useState } from "react";
import { personalData } from "@/utils/data/personal-data";
import AboutSection from "./components/homepage/about";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HeroSection from "./components/homepage/hero-section";
import Projects from "./components/homepage/projects";
import Skills from "./components/homepage/skills";
import Github from "./components/homepage/github";
import Chatbot from "./components/homepage/bot";

import { PacmanLoader } from "react-spinners";

export default function Home() {
  const [blogs, setBlogs] = useState(null);
  const [github, setGithub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const blogRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/content/blog`);
        const blogData = await blogRes.json();
        const filteredBlogs = blogData.filter((item) => item?.cover_image).sort(() => Math.random() - 0.5);
        setBlogs(filteredBlogs);

        const githubRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/content/github/pinned`);
        const githubData = await githubRes.json();
        setGithub(githubData);
      } catch (error) {
        // handle error (optional)
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  if (loading || !blogs || !github) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PacmanLoader color="#a78bfa" size={40} />
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      <Chatbot />
      <HeroSection />
      <AboutSection />
      <Experience />
      <Skills />
      <Projects />
      <Education />
      <Github github={github} git={personalData.github} />
      <Blog blogs={blogs} />
      <ContactSection />
    </div>
  );
};