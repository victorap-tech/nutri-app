import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link className="brand" to="/">Nutri App</Link>
        <span className="badge">Solo Nutricionista</span>
      </div>

      <nav className="topbar-nav">
        <Link className={location.pathname === "/" ? "active" : ""} to="/">Pacientes</Link>
        <Link className={location.pathname.startsWith("/alimentos") ? "active" : ""} to="/alimentos">Alimentos</Link>
      </nav>
    </header>
  );
}
