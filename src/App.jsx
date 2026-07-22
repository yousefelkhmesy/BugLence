import { useState } from "react";
import BugAnalyzer from "./pages/BugAnalyzer";
import RequirementAnalyzer from "./pages/RequirementAnalyzer";
import About from "./pages/About";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import { useTheme } from "./hooks/useTheme";
import TestCases from "./pages/TestCases";
import TestData from "./pages/TestData";

export default function App() {
  const [activePage, setActivePage] = useState("requirements");
  const { theme, toggleTheme } = useTheme();

  return (
    <>
    <Header
    theme={theme}
    onToggleTheme={toggleTheme}
    activePage={activePage}
    onPageChange={setActivePage}
    />
      {activePage === "requirements" && <RequirementAnalyzer />}
      {activePage === "bugs" && <BugAnalyzer />}
      {activePage === "test-cases" && <TestCases />}
      {activePage === "test-data" && <TestData />}
      {activePage === "about" && <About />}
    </>
  );
}