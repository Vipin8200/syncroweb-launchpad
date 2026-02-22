import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ className = "", size = "md", showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Abstract K / Tech Logo */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        
        {/* Abstract K shape with connected nodes */}
        <motion.path
          d="M14 8 L14 48"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        />
        <motion.path
          d="M14 28 L38 10"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.path
          d="M14 28 L38 46"
          stroke="url(#logoGradient2)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        
        {/* Nodes */}
        <motion.circle
          cx="14" cy="8" r="4"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
        <motion.circle
          cx="14" cy="48" r="4"
          fill="url(#logoGradient2)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        />
        <motion.circle
          cx="38" cy="10" r="5"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />
        <motion.circle
          cx="14" cy="28" r="5"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        />
        <motion.circle
          cx="38" cy="46" r="5"
          fill="url(#logoGradient2)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        />
        
        {/* Small accent dots */}
        <motion.circle
          cx="44" cy="28" r="3"
          fill="url(#logoGradient)"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} tracking-tight text-foreground`}>
            Karmel<span className="gradient-text">Infotech</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            & Software Solution LLP
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default Logo;
