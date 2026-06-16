import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useClock } from '../hooks/useClock';

const Nav = memo(function Nav() {
  const time = useClock();

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand">
        MyNews
      </NavLink>
      <div className="nav-links">
        <NavLink to="/dev" className={({ isActive }) => (isActive ? 'on' : '')}>
          Dev
        </NavLink>
        <NavLink to="/us" className={({ isActive }) => (isActive ? 'on' : '')}>
          US
        </NavLink>
        <NavLink to="/kr" className={({ isActive }) => (isActive ? 'on' : '')}>
          KR
        </NavLink>
        <span className="nav-time">{time}</span>
      </div>
    </nav>
  );
});

export default Nav;
