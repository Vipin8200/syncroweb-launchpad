import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Search,
  PenTool,
  Code2,
  TestTube,
  Rocket,
  HeadphonesIcon,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Requirement Analysis",
    description: "Deep dive into your needs, goals, and vision to create a comprehensive project roadmap.",
  },
  {
    icon: PenTool,
    title: "Planning & Design",
    description: "Strategic planning with wireframes and prototypes that align with your brand identity.",
  },
  {
    icon: Code2,
    title: "Development",
    description: "Agile development with clean code, regular updates, and continuous integration.",
  },
  {
    icon: TestTube,
    title: "Testing",
    description: "Rigorous quality assurance across devices and scenarios to ensure reliability.",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Smooth deployment with performance optimization and go-live support.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support",
    description: "Ongoing maintenance, updates, and dedicated support for continued success.",
  },
];

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="process" className="section-padding relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 block">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            How We <span className="gradient-text">Deliver Excellence</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A structured, transparent approach that keeps you informed and 
            ensures exceptional results at every stage.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-purple transform -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative group"
              >
                {/* Step card */}
                <div className="glass-card p-6 h-full hover-lift text-center lg:pt-16">
                  {/* Step number - positioned on timeline for desktop */}
                  <div className="lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 mb-4 lg:mb-0">
                    <motion.div
                      animate={isInView ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto relative z-10"
                    >
                      <span className="text-white font-bold">{index + 1}</span>
                    </motion.div>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector arrow - mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-accent">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M6 0L12 6L6 12L0 6L6 0Z" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;