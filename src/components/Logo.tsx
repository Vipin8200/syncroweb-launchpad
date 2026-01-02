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
      {/* Abstract S / Sync Logo */}
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
        
        {/* Abstract interconnected S shape with nodes */}
        <motion.circle
          cx="14"
          cy="14"
          r="5"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        />
        <motion.circle
          cx="28"
          cy="28"
          r="6"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <motion.circle
          cx="42"
          cy="14"
          r="5"
          fill="url(#logoGradient2)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        />
        <motion.circle
          cx="42"
          cy="42"
          r="5"
          fill="url(#logoGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        />
        <motion.circle
          cx="14"
          cy="42"
          r="5"
          fill="url(#logoGradient2)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
        
        {/* Connecting lines - S pattern */}
        <motion.path
          d="M14 19 L14 37"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
        <motion.path
          d="M19 14 L37 14"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        />
        <motion.path
          d="M42 19 L42 37"
          stroke="url(#logoGradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.path
          d="M19 42 L37 42"
          stroke="url(#logoGradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        />
        <motion.path
          d="M18 18 L23 23"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />
        <motion.path
          d="M33 33 L38 38"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} tracking-tight text-foreground`}>
            Syncro<span className="gradient-text">Web</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Solutions
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default Logo;