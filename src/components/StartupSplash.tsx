import { useEffect } from "react";
import { motion } from "motion/react";
import logoImage from "../assets/Logo2.png";

interface StartupSplashProps {
  onComplete: () => void;
}

export function StartupSplash({ onComplete }: StartupSplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
          className="mb-8 inline-block"
        >
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl bg-card p-3">
            <img src={logoImage} alt="EtherX Excel" className="w-full h-full object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl mb-3">ETHERX EXCEL</h1>
          <p className="text-muted-foreground text-xl">
            SECURE, SMART & SEAMLESS
          </p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 1, duration: 1.5 }}
          className="h-1 rounded-full mx-auto mt-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ['-200%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
