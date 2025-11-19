import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <div className="app">
      <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
        <h2>Bharat Resume Builder</h2>
        <nav style={{ marginTop: "0.5rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>
            Home
          </Link>
          <Link to="/builder">Create Resume</Link>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<ResumeBuilder />} />
          <Route path="/profile/:resumeId" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
