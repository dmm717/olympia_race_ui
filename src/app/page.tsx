"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Dialectic Particles System
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    
    const mouse = { x: -100, y: -100 };

    let particles: Particle[] = [];
    const particleCount = 45;
    const shapes = ["gear", "star", "triangle"];
    let animationFrameId: number;

    class Particle {
      x!: number;
      y!: number;
      size!: number;
      speedY!: number;
      rotation!: number;
      rotSpeed!: number;
      shape!: string;
      color!: string;
      opacity!: number;
      vx!: number;
      vy!: number;

      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.size = Math.random() * 12 + 6;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
        this.color = Math.random() > 0.7 ? "#a51c30" : "#e9c176";
        this.opacity = Math.random() * 0.3 + 0.1;
        this.vx = 0;
        this.vy = 0;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();

        if (this.shape === "triangle") {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
        } else if (this.shape === "star") {
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(
              Math.cos((i * 72 * Math.PI) / 180) * this.size,
              Math.sin((i * 72 * Math.PI) / 180) * this.size
            );
            ctx.lineTo(
              Math.cos(((i * 72 + 36) * Math.PI) / 180) * (this.size / 2),
              Math.sin(((i * 72 + 36) * Math.PI) / 180) * (this.size / 2)
            );
          }
        } else {
          // Gear-ish hex
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(
              Math.cos((i * Math.PI) / 3) * this.size,
              Math.sin((i * Math.PI) / 3) * this.size
            );
          }
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      update() {
        // Mouse interaction (move away)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const forceLimit = 150;

        if (dist < forceLimit) {
          const angle = Math.atan2(dy, dx);
          const force = (forceLimit - dist) / forceLimit;
          this.vx += Math.cos(angle) * force * 1.5;
          this.vy += Math.sin(angle) * force * 1.5;
        }

        this.x += this.vx;
        this.y -= this.speedY - this.vy;
        this.rotation += this.rotSpeed;

        // Friction
        this.vx *= 0.95;
        this.vy *= 0.95;

        if (this.y < -50) {
          this.init();
        }
      }
    }

    function initParticles() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Skip heavy animation if reduced motion is preferred
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Scroll Reveal Logic
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el, index) => {
      // Add a small delay for grid items
      if (el.classList.contains("glass-card")) {
        (el as HTMLElement).style.transitionDelay = `${(index % 4) * 0.1}s`;
      }
      revealObserver.observe(el);
    });

    return () => {
      elements.forEach((el) => {
        revealObserver.unobserve(el);
      });
    };
  }, []);

  return (
    <>
      <canvas id="particles-canvas" ref={canvasRef}></canvas>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_0_20px_rgba(178,39,56,0.2)]">
        <div className="flex justify-between items-center px-margin-mobile md:px-gutter max-w-container-max mx-auto h-20">
          <div className="font-display-lg text-headline-lg tracking-tighter text-primary dark:text-primary cursor-pointer">
            OLYMPIA CÁCH MẠNG
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="font-label-caps text-label-caps text-primary border-b-2 border-primary pb-1" href="#">Khởi động</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Vượt chướng ngại vật</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Tăng tốc</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Về đích</a>
            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Bảng xếp hạng</a>
          </nav>
          <Link href="/game">
            <button className="bg-primary-container text-on-primary-container px-6 py-3 font-label-caps text-label-caps hover:scale-95 transition-all duration-150 revolutionary-glow">
              GIA NHẬP ĐỈNH CAO
            </button>
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[125vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 light-sweep-container !absolute">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Olympia Revolutionary Hero"
              className="w-full h-full object-cover opacity-70 hero-float"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Gyc3l7jg6NSLuHGgQ4HevxGLXN5aanHuUcHSMV4XjRuq8G1oLftXhRneaoaIHgGLDHF9ScnGXb_qpec5byDhYDCEQJBl6WSXTTqrRVAP0c8hyXpqyZCZSnKLsjF8GzZDOroqgZMUHnDdrAV0yNmQuuo9zfSTyAgqSXpM8P3d7amcAuba6RSGwsDU1VfqDM-Yz5FoWSV78fVhjI2xvu6slLUFsrEbM67FwN-8w7qmx2oz-tCcP19xLgDXFuBkvVp1rjdRaMrWg8c"
              fetchPriority="high"
              decoding="async"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-background/50"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
          
          {/* Centered Content */}
          <div className="relative z-10 text-center px-margin-mobile w-full max-w-4xl mx-auto flex flex-col items-center pt-20">
            <h1 className="font-display-lg text-headline-lg md:text-display-lg hero-title mb-6 leading-[1.1] opacity-0 uppercase">
              <span className="text-white">DIALECTIC SUMMIT:</span><br />
              <span className="text-primary">HÀNH TRÌNH TƯ TƯỞNG</span>
            </h1>

            <p
              className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto opacity-0"
              style={{ animation: "fadeSlideUp 0.8s 0.6s forwards" }}
            >
              Nơi tri thức và bản lĩnh cách mạng hội tụ. Bạn đã sẵn sàng chinh phục đỉnh cao trí tuệ cùng những nhà tư tưởng lỗi lạc nhất?
            </p>

            <div
              className="flex flex-col md:flex-row gap-6 justify-center items-center opacity-0 w-full"
              style={{ animation: "fadeSlideUp 0.8s 0.8s forwards" }}
            >
              <Link href="/game" className="w-full md:w-auto">
                <button className="min-h-[56px] px-10 bg-primary-container text-secondary font-label-caps text-label-caps hover:shadow-[0_0_40px_rgba(165,28,48,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group w-full uppercase">
                  GIA NHẬP CUỘC ĐUA
                  <span className="material-symbols-outlined group-hover:rotate-12 transition-transform text-[20px]">bolt</span>
                </button>
              </Link>
              <button className="min-h-[56px] px-10 border-2 border-secondary text-secondary font-label-caps text-label-caps hover:bg-secondary/10 transition-all duration-300 w-full md:w-auto uppercase">
                XEM LỊCH THI ĐẤU
              </button>
            </div>
          </div>
        </section>

        {/* Rules Section */}
        <section className="py-section-gap px-margin-mobile md:px-gutter max-w-container-max mx-auto reveal-on-scroll">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="font-headline-xl text-headline-xl text-primary mb-4 uppercase">THỂ LỆ CUỘC THI</h2>
              <div className="h-1 w-24 bg-secondary mb-6"></div>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Cấu trúc 4 vòng thi được thiết kế để thử thách mọi khía cạnh của tư duy lý luận và kiến thức thực tiễn.
              </p>
            </div>
            <div className="flex items-center gap-4 text-secondary">
              <span className="material-symbols-outlined scale-150" data-weight="fill">
                verified_user
              </span>
              <span className="font-label-caps text-label-caps">QUY TRÌNH CHUẨN OLYMPIA</span>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Round 1 */}
            <div className="glass-card group p-8 flex flex-col h-full reveal-on-scroll">
              <div className="mb-8 flex justify-between items-start">
                <span className="text-secondary font-display-lg opacity-20 group-hover:opacity-100 transition-opacity">
                  01
                </span>
                <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  play_circle
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-surface uppercase">
                VÒNG 1:<br />
                KHỞI ĐỘNG
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                Chia làm 2 lượt: <strong className="text-on-surface">Cá nhân</strong> (6 câu, 3 giây/câu) và{" "}
                <strong className="text-on-surface">Chung</strong> (12 câu, giành quyền trả lời). Đúng +10đ, Sai lượt
                chung -5đ.
              </p>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 text-secondary font-label-caps text-label-caps">
                Tốc độ &amp; Phản xạ
              </div>
            </div>

            {/* Round 2 */}
            <div className="glass-card group p-8 flex flex-col h-full reveal-on-scroll">
              <div className="mb-8 flex justify-between items-start">
                <span className="text-secondary font-display-lg opacity-20 group-hover:opacity-100 transition-opacity">
                  02
                </span>
                <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  extension
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-surface uppercase">
                VÒNG 2:<br />
                VƯỢT CHƯỚNG NGẠI VẬT
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                Giải mã từ khóa ẩn sau 4 hàng ngang. Trả lời đúng từ khóa sớm nhận tới{" "}
                <strong className="text-on-surface">60đ</strong>. Sai từ khóa bị loại khỏi vòng đấu.
              </p>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 text-secondary font-label-caps text-label-caps">
                Logic &amp; Suy luận
              </div>
            </div>

            {/* Round 3 */}
            <div className="glass-card group p-8 flex flex-col h-full reveal-on-scroll">
              <div className="mb-8 flex justify-between items-start">
                <span className="text-secondary font-display-lg opacity-20 group-hover:opacity-100 transition-opacity">
                  03
                </span>
                <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  speed
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-surface uppercase">
                VÒNG 3:<br />
                TĂNG TỐC
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                4 câu hỏi hình ảnh/video với thời gian 20-30 giây. Điểm số{" "}
                <strong className="text-on-surface">40-30-20-10</strong> dựa trên tốc độ chốt đáp án đúng.
              </p>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 text-secondary font-label-caps text-label-caps">
                Chính xác &amp; Quyết đoán
              </div>
            </div>

            {/* Round 4 */}
            <div className="glass-card group p-8 flex flex-col h-full border-primary/30 reveal-on-scroll">
              <div className="mb-8 flex justify-between items-start">
                <span className="text-secondary font-display-lg opacity-20 group-hover:opacity-100 transition-opacity">
                  04
                </span>
                <span
                  className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-full star-shine group-hover:bg-primary group-hover:text-on-primary transition-all duration-300"
                  data-weight="fill"
                >
                  grade
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-surface uppercase">
                VÒNG 4:<br />
                VỀ ĐÍCH
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                Thứ tự theo điểm số. Chọn gói 20đ hoặc 30đ. <strong className="text-on-surface">Ngôi sao hy vọng</strong>{" "}
                nhân đôi điểm. Cướp điểm linh hoạt.
              </p>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 text-secondary font-label-caps text-label-caps">
                Bản lĩnh &amp; Chiến thuật
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Leaderboard Preview */}
        <section className="py-section-gap bg-surface-container-low reveal-on-scroll">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mb-8">BẢNG VÀNG CÁCH MẠNG</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-background border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-default group">
                  <span className="font-display-lg text-headline-lg text-secondary group-hover:scale-110 transition-transform">
                    01
                  </span>
                  <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-label-caps text-label-caps text-on-surface">NGUYỄN VĂN A</div>
                    <div className="text-body-md text-on-surface-variant">Chi bộ 04 - ĐH KHXH&amp;NV</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display-lg text-headline-lg text-primary">320</div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Điểm số</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-background/50 border border-outline-variant/30 opacity-70 hover:opacity-100 transition-all duration-300">
                  <span className="font-display-lg text-headline-lg text-on-surface-variant">02</span>
                  <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-label-caps text-label-caps text-on-surface">TRẦN THỊ B</div>
                    <div className="text-body-md text-on-surface-variant">Khoa Luật - ĐH Quốc Gia</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display-lg text-headline-lg text-on-surface-variant">285</div>
                  </div>
                </div>
              </div>
              <button className="mt-8 text-secondary font-label-caps text-label-caps hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group">
                XEM TẤT CẢ <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
              </button>
            </div>
            <div className="relative group">
              <div className="aspect-square glass-card rounded-full p-12 flex flex-col items-center justify-center text-center">
                <span
                  className="material-symbols-outlined text-[80px] text-secondary mb-6 group-hover:scale-110 transition-transform duration-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
                <h3 className="font-headline-xl text-headline-lg mb-4">VINH QUANG ĐANG CHỜ</h3>
                <p className="font-body-md text-on-surface-variant mb-8">
                  Tổng giá trị giải thưởng lên đến 100.000.000 VNĐ cùng cơ hội thực tập tại các viện nghiên cứu hàng đầu.
                </p>
                <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>
              </div>
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 border-8 border-primary/20 rounded-full animate-ping"></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
