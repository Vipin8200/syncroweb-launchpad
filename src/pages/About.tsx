import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Users, Award, Zap, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Target, value: "Vision", label: "Driven Solutions" },
  { icon: Users, value: "Long-term", label: "Partnerships" },
  { icon: Award, value: "Quality", label: "First Approach" },
  { icon: Zap, value: "Scalable", label: "Architecture" },
];

const values = [
  {
    title: "Innovation First",
    description: "We embrace cutting-edge technologies and creative solutions to solve complex challenges.",
  },
  {
    title: "Client Partnership",
    description: "We build lasting relationships based on trust, transparency, and mutual success.",
  },
  {
    title: "Quality Obsessed",
    description: "Every line of code we write reflects our commitment to excellence and best practices.",
  },
  {
    title: "Future Ready",
    description: "We design solutions that scale and adapt to evolving business needs.",
  },
];

const About = () => {
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
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-heading">
              We Build <span className="gradient-text">Digital Excellence</span>
            </h1>
            <p className="text-body text-lg md:text-xl">
              SyncroWeb Solutions is a vision-driven IT solutions company focused on 
              delivering quality, scalability, and long-term value to modern businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-heading">
                Our Story
              </h2>
              <p className="text-body text-lg mb-6 leading-relaxed">
                Founded with a vision to bridge the gap between innovative technology 
                and business success, SyncroWeb Solutions has grown into a trusted 
                partner for startups and enterprises alike.
              </p>
              <p className="text-body text-lg mb-8 leading-relaxed">
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

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="glass-card p-6 hover-lift group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-heading mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-body">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-heading">
              What <span className="gradient-text">Drives Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-8 hover-lift"
              >
                <h3 className="text-xl font-semibold text-heading mb-3">
                  {value.title}
                </h3>
                <p className="text-body">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">
              Ready to Work <span className="gradient-text">Together?</span>
            </h2>
            <p className="text-body text-lg max-w-2xl mx-auto mb-8">
              Let's discuss how we can help transform your digital presence.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-hover glow-primary"
            >
              <Link to="/contact">
                Get In Touch
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

export default About;