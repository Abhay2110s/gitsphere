import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { HexagonShape } from '../common/Hexagon';
import {
  ProjectManagementCard,
  TaskManagementCard,
  CodeCollaborationCard,
  CodeReviewCard,
  ContributionTrackingCard,
} from './FeatureCardContent';

export default function HorizontalFeatures() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  // Hook into vertical scroll progress through the 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Transform scroll progress (0 to 1) into horizontal translation (0% to -80%)
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-80%']);

  // Parallax translation for subtle background floating hexagons
  const bgX = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);

  // Keep track of current slide index (0 to 4) for the HUD counter
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(4, Math.max(0, Math.round(latest * 4)));
    setActiveStep(idx);
  });


  const scrollToCard = (index) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + (index / 4) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <section
      id="features-cards"
      ref={containerRef}
      className="relative h-[450vh] sm:h-[500vh] bg-[#000000] text-white"
    >
      {/* 
        STICKY FULL-SCREEN VIEWPORT CONTAINER
        pt-20 sm:pt-22 lg:pt-[82px] guarantees that the cards start completely BELOW 
        the floating navbar (which is positioned at top-4 sm:top-5 with ~54px height).
        pb-2 sm:pb-3 ensures the bottom bar and the card's bottom border are 100% visible
        with zero bottom cutoff on all screen heights.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-20 sm:pt-22 lg:pt-[82px] pb-2 sm:pb-3">

        {/* SUBTLE GEOMETRIC FLOATING HEXAGONS BACKGROUND (Moving via Scroll Parallax) */}
        <motion.div
          style={{ x: bgX }}
          className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 w-[200vw]"
        >
          <div className="absolute top-[12%] left-[10%] opacity-20">
            <HexagonShape size={260} fill="none" stroke="#333333" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[55%] left-[25%] opacity-15">
            <HexagonShape size={180} fill="none" stroke="#222222" strokeWidth={1} />
          </div>
          <div className="absolute top-[8%] left-[55%] opacity-25">
            <HexagonShape size={320} fill="none" stroke="#333333" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[60%] left-[80%] opacity-15">
            <HexagonShape size={220} fill="none" stroke="#222222" strokeWidth={1} />
          </div>
          <div className="absolute top-[18%] left-[115%] opacity-20">
            <HexagonShape size={280} fill="none" stroke="#333333" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[50%] left-[145%] opacity-20">
            <HexagonShape size={200} fill="none" stroke="#222222" strokeWidth={1} />
          </div>
          <div className="absolute top-[15%] left-[175%] opacity-25">
            <HexagonShape size={300} fill="none" stroke="#333333" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* HORIZONTAL CARDS TRACK (500vw width, 5 cards of 100vw each) */}
        <motion.div
          style={{ x }}
          className="flex flex-1 w-[500vw] relative z-20 items-center min-h-0"
        >
          {/* CARD 01: PROJECT MANAGEMENT */}
          <ProjectManagementCard />

          {/* CARD 02: TASK MANAGEMENT */}
          <TaskManagementCard />

          {/* CARD 03: CODE COLLABORATION */}
          <CodeCollaborationCard />

          {/* CARD 04: CODE REVIEW */}
          <CodeReviewCard />

          {/* CARD 05: CONTRIBUTION TRACKING */}
          <ContributionTrackingCard />
        </motion.div>

      </div>
    </section>
  );
}
