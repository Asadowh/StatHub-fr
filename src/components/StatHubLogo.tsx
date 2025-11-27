import { NavLink } from "react-router-dom";

interface StatHubLogoProps {
  className?: string;
  size?: number;
}

export const StatHubLogo = ({ className = "", size = 40 }: StatHubLogoProps) => {
  return (
    <NavLink to="/" className={`flex items-center hover:opacity-80 transition-opacity ${className}`}>
      <img 
        src="/stathub-logo.png" 
        alt="StatHub Logo" 
        width={size} 
        height={size}
        className="object-contain"
      />
    </NavLink>
  );
};
