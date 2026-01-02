import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Globe,
  Smartphone,
  Palette,
  Code2,
  Database,
  ShoppingCart,
  Wrench,
} from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description:
      "High-performance, responsive websites built with modern technologies for optimal user experience.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile applications that deliver seamless experiences across devices.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "User-centered design that combines aesthetics with functionality for intuitive interfaces.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Code2,
    title: "Custom Software Development",
    description:
      "Tailored software solutions designed to address your unique business challenges.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Database,
    title: "ERP / CRM Solutions",
    description:
      "Enterprise resource planning and customer relationship management systems for streamlined operations.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Development",
    description:
      "Scalable online stores with secure payment integration and inventory management.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Wrench,
    title: "Maintenance & Support",
    description:
      "Ongoing technical support and maintenance to keep your systems running smoothly.",
    color: "from-teal-500 to-cyan-500",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="services" className="section-padding relative">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider mb-4 block">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Solutions That <span className="gradient-text">Empower Growth</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From concept to deployment, we offer comprehensive digital services 
            tailored to transform your business vision into reality.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              className="group"
            >
              <div className="glass-card h-full p-6 hover-lift relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:gradient-text transition-all">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;