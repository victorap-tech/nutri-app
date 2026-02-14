import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <h1>Nutri App</h1>
      <nav>
        <NavLink to="/">Pacientes</NavLink>
        <NavLink to="/alimentos">Alimentos</NavLink>
      </nav>
    </header>
  );
}
