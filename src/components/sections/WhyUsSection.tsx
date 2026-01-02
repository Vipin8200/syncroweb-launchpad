import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Code,
  Layers,
  MessageSquare,
  Clock,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

const reasons = [
  {
    icon: Code,
    title: "Clean Code & Scalable Architecture",
    description:
      "We write maintainable, well-documented code following industry best practices.",
  },
  {
    icon: Layers,
    title: "Modern Tech Stack",
    description:
      "Leveraging cutting-edge technologies to build future-proof solutions.",
  },
  {
    icon: MessageSquare,
    title: "Transparent Communication",
    description:
      "Regular updates and clear communication throughout the development process.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description:
      "Committed to meeting deadlines without compromising on quality.",
  },
  {
    icon: HeartHandshake,
    title: "Long-Term Support",
    description:
      "Ongoing partnership beyond deployment with dedicated maintenance support.",
  },
];

const WhyUsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="why-us" className="section-padding relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-custom relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            What Sets Us <span className="gradient-text">Apart</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We combine technical excellence with genuine partnership to deliver 
            solutions that truly make a difference.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="relative group"
            >
              <div className="glass-card p-8 h-full hover-lift">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-all duration-300">
                    <reason.icon className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
                
                {/* Decorative corner */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;