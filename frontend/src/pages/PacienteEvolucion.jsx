import { NavLink, useParams } from "react-router-dom";

const tabs = [
  {
    to: (id) => `/pacientes/${id}`,
    label: "Ficha",
    end: true,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    to: (id) => `/pacientes/${id}/evolucion`,
    label: "Evolución",
    end: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: (id) => `/pacientes/${id}/plan`,
    label: "Plan",
    end: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    to: (id) => `/pacientes/${id}/laboratorio`,
    label: "Laboratorio",
    end: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0l-3 7m3-7h6m0 0l3 7M9 14H5m10 0h4"/>
      </svg>
    ),
  },
];

export default function TabsPaciente() {
  const { id } = useParams();

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to(id)}
          end={tab.end}
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
