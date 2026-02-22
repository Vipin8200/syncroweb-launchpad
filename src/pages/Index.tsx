import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThreeBackground from "@/components/ThreeBackground";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiFirebase,
  SiMongodb,
  SiAmazonwebservices,
  SiGithub,
} from "react-icons/si";
import {
  Globe,
  Smartphone,
  Palette,
  Code2,
  Lightbulb,
  Wrench,
} from "lucide-react";

const technologies = [
  { icon: SiReact, name: "React", color: "#61DAFB" },
  { icon: SiNextdotjs, name: "Next.js", color: "#0F172A" },
  { icon: SiTailwindcss, name: "Tailwind", color: "#06B6D4" },
  { icon: SiNodedotjs, name: "Node.js", color: "#339933" },
  { icon: SiFirebase, name: "Firebase", color: "#FFCA28" },
  { icon: SiMongodb, name: "MongoDB", color: "#47A248" },
  { icon: SiAmazonwebservices, name: "AWS", color: "#FF9900" },
  { icon: SiGithub, name: "GitHub", color: "#181717" },
];

const services = [
  { icon: Code2, title: "Custom Software Development", color: "from-blue-500 to-cyan-500" },
  { icon: Globe, title: "Web Development & Web Apps", color: "from-green-500 to-emerald-500" },
  { icon: Smartphone, title: "Mobile App Development", color: "from-purple-500 to-pink-500" },
  { icon: Palette, title: "UI / UX Design", color: "from-orange-500 to-red-500" },
  { icon: Lightbulb, title: "IT Consulting & Digital Strategy", color: "from-indigo-500 to-violet-500" },
  { icon: Wrench, title: "Enterprise Solutions & Support", color: "from-teal-500 to-cyan-500" },
];

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ThreeBackground />
        
        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Custom Software & IT Services
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-heading"
            >
              Transforming Ideas Into
              <br />
              <span className="gradient-text">Powerful Digital Solutions</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-body max-w-2xl mx-auto mb-10"
            >
              Karmel Infotech & Software Solution LLP is a leading IT services partner 
              dedicated to helping businesses thrive in the digital world with custom software, 
              robust web & mobile applications, and comprehensive IT consulting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-hover transition-all px-8 py-6 text-lg glow-primary"
              >
                <Link to="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg group"
              >
                <Link to="/services">
                  <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  View Services
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-5 h-8 rounded-full border-2 border-muted-foreground/50 flex items-start justify-center p-1"
            >
              <div className="w-1 h-2 rounded-full bg-primary" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Services Preview Section */}
      <section className="section-padding bg-alt">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-heading">
              Solutions That <span className="gradient-text">Empower Growth</span>
            </h2>
            <p className="text-body text-lg">
              From concept to deployment, we offer comprehensive digital services 
              tailored to transform your business vision into reality.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group"
              >
                <div className="glass-card h-full p-6 hover-lift relative overflow-hidden">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-heading mb-3">
                    {service.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
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
              Tech Stack
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-heading">
              Powered by <span className="gradient-text">Modern Technology</span>
            </h2>
            <p className="text-body text-lg">
              We leverage cutting-edge technologies to build robust, scalable, 
              and future-proof solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  className="glass-card p-4 flex flex-col items-center gap-3 hover-lift cursor-default"
                >
                  <tech.icon
                    className="w-10 h-10 transition-transform group-hover:scale-110"
                    style={{ color: tech.color }}
                  />
                  <span className="text-xs font-medium text-foreground">{tech.name}</span>
                </motion.div>
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
            className="glass-card p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">
                Ready to Build Your <span className="gradient-text">Digital Solution?</span>
              </h2>
              <p className="text-body text-lg max-w-2xl mx-auto mb-8">
                Let's discuss your project and create digital solutions that drive real business results.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-hover glow-primary"
              >
                <Link to="/contact">
                  Let's Build Together
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

export default Index;
