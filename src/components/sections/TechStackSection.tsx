import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const technologies = {
  frontend: [
    { name: "React", color: "#61DAFB" },
    { name: "Next.js", color: "#ffffff" },
    { name: "Tailwind", color: "#06B6D4" },
  ],
  backend: [
    { name: "Node.js", color: "#339933" },
    { name: "Firebase", color: "#FFCA28" },
  ],
  database: [
    { name: "Firestore", color: "#FFCA28" },
    { name: "MongoDB", color: "#47A248" },
  ],
  cloud: [
    { name: "AWS", color: "#FF9900" },
    { name: "GitHub", color: "#ffffff" },
  ],
};

const TechIcon = ({ name, color, delay }: { name: string; color: string; delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: delay * 2 }}
        className="glass-card p-6 flex flex-col items-center gap-3 hover-lift cursor-default"
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {name.charAt(0)}
        </div>
        <span className="text-sm font-medium text-foreground">{name}</span>
      </motion.div>
    </motion.div>
  );
};

const TechStackSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const allTech = [
    ...technologies.frontend,
    ...technologies.backend,
    ...technologies.database,
    ...technologies.cloud,
  ];

  return (
    <section id="tech-stack" className="section-padding relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent pointer-events-none" />

      <div className="container-custom relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 block">
            Tech Stack
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Powered by <span className="gradient-text">Modern Technology</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We leverage cutting-edge technologies to build robust, scalable, 
            and future-proof solutions for our clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {allTech.map((tech, index) => (
            <TechIcon
              key={tech.name}
              name={tech.name}
              color={tech.color}
              delay={isInView ? 0.1 + index * 0.08 : 0}
            />
          ))}
        </div>

        {/* Category labels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          {["Frontend", "Backend", "Database", "Cloud & DevOps"].map((category) => (
            <span
              key={category}
              className="px-4 py-2 rounded-full bg-secondary/50 text-sm font-medium text-muted-foreground"
            >
              {category}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;