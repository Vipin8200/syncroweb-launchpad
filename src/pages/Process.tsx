import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  PenTool,
  Code2,
  TestTube,
  Rocket,
  HeadphonesIcon,
  ArrowRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Requirement Analysis",
    description:
      "We begin with a deep dive into your business needs, goals, and vision. Through detailed discussions and research, we create a comprehensive project roadmap that aligns with your objectives.",
    details: [
      "Stakeholder interviews",
      "Market research",
      "Technical feasibility analysis",
      "Project scope definition",
    ],
  },
  {
    icon: PenTool,
    title: "Planning & Design",
    description:
      "Our design team creates intuitive wireframes and high-fidelity prototypes that align with your brand identity. We iterate based on your feedback until the design is perfect.",
    details: [
      "Information architecture",
      "Wireframing & prototyping",
      "Visual design",
      "Design system creation",
    ],
  },
  {
    icon: Code2,
    title: "Development",
    description:
      "Using agile methodology, we build your solution with clean, maintainable code. Regular updates and demos keep you informed throughout the development process.",
    details: [
      "Sprint planning",
      "Code reviews",
      "Continuous integration",
      "Regular progress demos",
    ],
  },
  {
    icon: TestTube,
    title: "Testing",
    description:
      "Rigorous quality assurance across devices, browsers, and scenarios ensures your product is reliable, secure, and performs flawlessly under all conditions.",
    details: [
      "Unit & integration testing",
      "Performance testing",
      "Security audits",
      "User acceptance testing",
    ],
  },
  {
    icon: Rocket,
    title: "Launch",
    description:
      "We handle the deployment process with care, ensuring a smooth go-live experience. Post-launch optimization ensures your product performs at its best.",
    details: [
      "Deployment preparation",
      "Performance optimization",
      "Go-live support",
      "Post-launch monitoring",
    ],
  },
  {
    icon: HeadphonesIcon,
    title: "Support",
    description:
      "Our partnership doesn't end at launch. We provide ongoing maintenance, updates, and dedicated support to ensure your continued success.",
    details: [
      "24/7 monitoring",
      "Regular updates",
      "Performance reports",
      "Dedicated support team",
    ],
  },
];

const Process = () => {
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
              Our Process
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-heading">
              How We <span className="gradient-text">Deliver Excellence</span>
            </h1>
            <p className="text-body text-lg md:text-xl">
              A structured, transparent approach that keeps you informed and 
              ensures exceptional results at every stage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan to-primary" />

            <div className="space-y-12 lg:space-y-0">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                    index % 2 === 0 ? "" : "lg:direction-rtl"
                  }`}
                >
                  <div
                    className={`${
                      index % 2 === 0 ? "lg:text-right lg:pr-16" : "lg:order-2 lg:pl-16"
                    }`}
                  >
                    <div
                      className={`glass-card p-8 hover-lift ${
                        index % 2 === 0 ? "" : "lg:order-2"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-5 ${
                          index % 2 === 0 ? "lg:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-7 h-7 text-primary" />
                        </div>
                        <div className={index % 2 === 0 ? "lg:text-right" : ""}>
                          <div className="text-sm font-medium text-primary mb-1">
                            Step {index + 1}
                          </div>
                          <h3 className="text-2xl font-bold text-heading mb-3">
                            {step.title}
                          </h3>
                          <p className="text-body mb-4">{step.description}</p>
                          <ul className={`space-y-2 ${index % 2 === 0 ? "lg:text-right" : ""}`}>
                            {step.details.map((detail) => (
                              <li
                                key={detail}
                                className="text-sm text-muted-foreground"
                              >
                                • {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline node */}
                  <div
                    className={`hidden lg:flex items-center justify-center ${
                      index % 2 === 0 ? "" : "lg:order-1"
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center shadow-lg"
                    >
                      <span className="text-xl font-bold text-white">{index + 1}</span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
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
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto mb-8">
              Let's discuss your project and bring your vision to life with our proven process.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-hover glow-primary"
            >
              <Link to="/contact">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Process;