import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Globe,
  Smartphone,
  Palette,
  Code2,
  Database,
  ShoppingCart,
  Wrench,
  ArrowRight,
  Check,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description:
      "High-performance, responsive websites built with modern technologies for optimal user experience.",
    features: [
      "Responsive Design",
      "SEO Optimized",
      "Fast Loading",
      "Cross-browser Compatible",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile applications that deliver seamless experiences across devices.",
    features: [
      "iOS & Android",
      "Cross-platform",
      "Push Notifications",
      "Offline Support",
    ],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "User-centered design that combines aesthetics with functionality for intuitive interfaces.",
    features: [
      "User Research",
      "Wireframing",
      "Prototyping",
      "Usability Testing",
    ],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Code2,
    title: "Custom Software Development",
    description:
      "Tailored software solutions designed to address your unique business challenges.",
    features: [
      "Custom Solutions",
      "API Integration",
      "Scalable Architecture",
      "Documentation",
    ],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Database,
    title: "ERP / CRM Solutions",
    description:
      "Enterprise resource planning and customer relationship management systems for streamlined operations.",
    features: [
      "Process Automation",
      "Data Analytics",
      "Custom Workflows",
      "Integration Ready",
    ],
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Development",
    description:
      "Scalable online stores with secure payment integration and inventory management.",
    features: [
      "Payment Gateway",
      "Inventory Management",
      "Order Tracking",
      "Multi-vendor Support",
    ],
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Wrench,
    title: "Maintenance & Support",
    description:
      "Ongoing technical support and maintenance to keep your systems running smoothly.",
    features: [
      "24/7 Monitoring",
      "Bug Fixes",
      "Security Updates",
      "Performance Optimization",
    ],
    color: "from-teal-500 to-cyan-500",
  },
];

const Services = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-heading">
              Solutions That <span className="gradient-text">Empower Growth</span>
            </h1>
            <p className="text-body text-lg md:text-xl">
              From concept to deployment, we offer comprehensive digital services 
              tailored to transform your business vision into reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <div className="space-y-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="glass-card p-8 md:p-10 hover-lift">
                  <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-5 mb-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-heading mb-2">
                            {service.title}
                          </h3>
                          <p className="text-body text-lg">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                        Key Features
                      </h4>
                      <ul className="space-y-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-body text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">
                Need a <span className="gradient-text">Custom Solution?</span>
              </h2>
              <p className="text-body text-lg max-w-2xl mx-auto mb-8">
                We're here to help with projects of any complexity. 
                Let's discuss your specific requirements.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-hover glow-primary"
              >
                <Link to="/contact">
                  Request a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Services;