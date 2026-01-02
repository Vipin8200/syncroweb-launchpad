import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Users, Award, Zap } from "lucide-react";

const stats = [
  { icon: Target, value: "Vision", label: "Driven Solutions" },
  { icon: Users, value: "Long-term", label: "Partnerships" },
  { icon: Award, value: "Quality", label: "First Approach" },
  { icon: Zap, value: "Scalable", label: "Architecture" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent pointer-events-none" />
      
      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 block">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              We Build <span className="gradient-text">Digital Excellence</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              SyncroWeb Solutions is a vision-driven IT solutions company focused on 
              delivering quality, scalability, and long-term value. We don't just build 
              software — we craft digital ecosystems that grow with your business.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              As an LLP-ready professional brand, we bring process-driven delivery 
              and transparent communication to every project. Our commitment is to 
              create solutions that not only meet today's needs but anticipate 
              tomorrow's challenges.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="glass-card px-5 py-3">
                <span className="text-sm font-medium text-foreground">LLP Registered</span>
              </div>
              <div className="glass-card px-5 py-3">
                <span className="text-sm font-medium text-foreground">Process-Driven</span>
              </div>
              <div className="glass-card px-5 py-3">
                <span className="text-sm font-medium text-foreground">Future-Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Right content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="glass-card p-6 hover-lift group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;