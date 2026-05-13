'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import FadeIn from '@/components/FadeIn';
import { getImageUrl } from '@/config/images';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <main className="min-h-full px-10 py-14 max-w-[1400px] mx-auto">
      <FadeIn delay={0}>
        <h1 className="font-heading text-[15px] font-normal tracking-tight text-[#111111] mb-16">
          About
        </h1>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        {/* Left Text Content */}
        <motion.div
          className="flex-1 flex flex-col gap-7 text-[13px] text-[#888888] leading-[2] font-light max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={itemVariants}>
            我是 HUI ZZZI，一名热爱记录生活与城市的摄影师。我的镜头主要聚焦在北京的街头巷尾、古建筑与自然风光之间。
          </motion.p>

          <motion.p variants={itemVariants}>
            从CBD的日落天际线到故宫的雪夜星轨，从颐和园的晚霞到雅拉雪山的日照金山，我试图捕捉那些稍纵即逝却令人心动的瞬间。摄影对我而言，不仅是记录，更是一种观察世界的方式。
          </motion.p>

          <motion.p variants={itemVariants}>
            除了静态影像，我也热衷于制作视频短片，记录北京四季更迭中的城市之美。无论是圆明园的秋意、北海公园的夕阳，还是天坛新年的祈福时刻，这些画面都承载着我对这座城市深厚的情感。
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-12 mt-8 pt-10 border-t border-[#f0f0f0]">
            <motion.div variants={itemVariants} className="flex-1">
              <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-6">
                Contact
              </h2>
              <div className="flex flex-col gap-3 text-[13px] text-[#888888]">
                <a
                  href="mailto:hello@huizzzi.com"
                  className="group w-fit hover:text-[#111111] transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-0 group-hover:w-3 h-px bg-[#111111] transition-all duration-300" />
                  hello@huizzzi.com
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-fit hover:text-[#111111] transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-0 group-hover:w-3 h-px bg-[#111111] transition-all duration-300" />
                  Instagram
                </a>
                <a
                  href="https://xiaohongshu.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-fit hover:text-[#111111] transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="w-0 group-hover:w-3 h-px bg-[#111111] transition-all duration-300" />
                  小红书
                </a>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
              <h2 className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em] mb-6">
                Gear
              </h2>
              <ul className="flex flex-col gap-2.5 text-[13px] text-[#888888] font-light">
                <li className="flex items-center gap-3">
                  <span className="w-[3px] h-[3px] rounded-full bg-[#cccccc]" />
                  Sony / Canon 相机系统
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-[3px] h-[3px] rounded-full bg-[#cccccc]" />
                  多款定焦与变焦镜头
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-[3px] h-[3px] rounded-full bg-[#cccccc]" />
                  三脚架、滤镜等配件
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Portrait Image */}
        <FadeIn delay={0.4} direction="left" className="flex-1 w-full max-w-[600px] mt-10 lg:mt-0">
          <div className="relative w-full aspect-[4/5] bg-[#f9f9f9] overflow-hidden p-2 border border-[#f0f0f0] shadow-sm group">
            <div className="absolute inset-0 border border-[#e8e8e8] m-2 pointer-events-none z-10" />
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={getImageUrl('/huizzzi.png')}
                alt="Portrait of HUI ZZZI"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                unoptimized
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-baseline px-1">
            <span className="font-mono text-[9px] text-[#cccccc] tracking-[0.2em] uppercase">Portrait</span>
            <span className="font-mono text-[9px] text-[#cccccc] tracking-[0.1em]">2026</span>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
