
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Rocket,
  Sun,
  Target,
  X,
} from "lucide-react";

import "./portfolio.css";
import "./experience.css";

type Theme = "dark" | "light";

type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[] | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
};

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  fork: boolean;
  archived: boolean;
};

type Particle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
};

const githubUser =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim() ||
  "thiagolfa07";

const githubUrl =
  `https://github.com/${githubUser}`;

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  "thiagolfa2005@outlook.com";

const linkedinUrl =
  process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || "";

const cvUrl =
  process.env.NEXT_PUBLIC_CV_URL?.trim() || "";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    ""
  ) || "";

const navigation = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Projetos", href: "#projetos" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Contato", href: "#contato" },
];

const skills = [
  { name: "Next.js", symbol: "N", color: "#ffffff" },
  { name: "TypeScript", symbol: "TS", color: "#38bdf8" },
  { name: "JavaScript", symbol: "JS", color: "#facc15" },
  { name: "React", symbol: "⚛", color: "#67e8f9" },
  { name: "Node.js", symbol: "⬡", color: "#84cc16" },
  { name: "Supabase", symbol: "S", color: "#34d399" },
  { name: "PostgreSQL", symbol: "DB", color: "#93c5fd" },
  { name: "Tailwind CSS", symbol: "~", color: "#22d3ee" },
  { name: "Python", symbol: "Py", color: "#facc15" },
  { name: "Git / GitHub", symbol: "</>", color: "#fb923c" },
];

function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ==========================================
   LOGO GEOMÉTRICA
   ========================================== */

function BrandMark({ size = 43 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 144 144"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="brand-top"
          x1="12"
          y1="8"
          x2="126"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7c3aed" />
          <stop offset=".52" stopColor="#a855f7" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>

        <linearGradient
          id="brand-front"
          x1="25"
          y1="38"
          x2="105"
          y2="126"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6d28d9" />
          <stop offset=".55" stopColor="#a21caf" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
      </defs>

      <path
        d="M10 35 35 13h99l-24 22H10Z"
        fill="url(#brand-top)"
      />

      <path
        d="M10 35h100v21H80v55l-29 24V56H10V35Z"
        fill="url(#brand-front)"
      />

      <path
        d="M110 35 134 13v21l-24 22V35Z"
        fill="#7e22ce"
      />

      <path
        d="M80 56h30L80 78V56Z"
        fill="#c026d3"
      />
    </svg>
  );
}

function Brand() {
  return (
    <span className="pf-brand">
      <span className="pf-brand-symbol">
        <BrandMark size={39} />
      </span>

      <span className="pf-brand-name">
        Thiago<span>.dev</span>
      </span>
    </span>
  );
}

/* ==========================================
   PARTÍCULAS INTERATIVAS
   ========================================== */

function ParticleBackground({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const ctx = context;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let animationFrame = 0;
    let previousTime = 0;

    const pointer = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const isLight = theme === "light";

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);

      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;

      ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      const count =
        width < 640 ? 23 : width < 1100 ? 38 : 60;

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.7 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
      }));
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function draw(time: number) {
      if (
        !reduceMotion &&
        previousTime &&
        time - previousTime < 32
      ) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      previousTime = time;

      ctx.clearRect(0, 0, width, height);

      const color = isLight
        ? "126, 34, 206"
        : "180, 89, 255";

      particles.forEach((particle) => {
        if (!reduceMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -10) {
            particle.x = width + 10;
          }

          if (particle.x > width + 10) {
            particle.x = -10;
          }

          if (particle.y < -10) {
            particle.y = height + 10;
          }

          if (particle.y > height + 10) {
            particle.y = -10;
          }
        }

        let drawX = particle.x;
        let drawY = particle.y;

        if (pointer.active && !reduceMotion) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0 && distance < 175) {
            const influence = 1 - distance / 175;

            drawX += (dx / distance) * influence * 15;
            drawY += (dy / distance) * influence * 15;
          }
        }

        ctx.beginPath();
        ctx.arc(
          drawX,
          drawY,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(${color}, ${
          isLight ? 0.48 : 0.73
        })`;

        ctx.shadowBlur = isLight ? 6 : 13;
        ctx.shadowColor = `rgba(${color}, 0.8)`;
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      for (let i = 0; i < particles.length; i++) {
        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const a = particles[i];
          const b = particles[j];

          const distance = Math.hypot(
            a.x - b.x,
            a.y - b.y
          );

          if (distance < 125) {
            const opacity =
              (1 - distance / 125) *
              (isLight ? 0.08 : 0.15);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            ctx.strokeStyle =
              `rgba(${color}, ${opacity})`;

            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    }

    resize();

    window.addEventListener("resize", resize);
    window.addEventListener(
      "pointermove",
      onPointerMove,
      { passive: true }
    );

    document.addEventListener(
      "pointerleave",
      onPointerLeave
    );

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      document.removeEventListener(
        "pointerleave",
        onPointerLeave
      );
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pf-particle-canvas"
      aria-hidden="true"
    />
  );
}

/* ==========================================
   EFEITO 3D DOS CARDS
   ========================================== */

function handleTilt(
  event: ReactPointerEvent<HTMLElement>
) {
  if (event.pointerType !== "mouse") return;

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) / rect.width;

  const y =
    (event.clientY - rect.top) / rect.height;

  const rotateY = (x - 0.5) * 10;
  const rotateX = (0.5 - y) * 10;

  card.style.setProperty(
    "--tilt-x",
    `${rotateX.toFixed(2)}deg`
  );

  card.style.setProperty(
    "--tilt-y",
    `${rotateY.toFixed(2)}deg`
  );

  card.style.setProperty(
    "--shine-x",
    `${x * 100}%`
  );

  card.style.setProperty(
    "--shine-y",
    `${y * 100}%`
  );
}

function resetTilt(
  event: ReactPointerEvent<HTMLElement>
) {
  const card = event.currentTarget;

  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
}

/* ==========================================
   CENTRAL DE CONTATO PROFISSIONAL
   ========================================== */

function ContactHub() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(
        contactEmail
      );

      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <section
      id="contato"
      className="pf-contact-hub-section"
    >
      <div className="pf-container">
        <div className="pf-contact-hub pf-reveal">
          <div
            className="pf-contact-hub-glow"
            aria-hidden="true"
          />

          <div className="pf-contact-hub-header">
            <div>
              <span className="pf-small-overline">
                CONEXÕES PROFISSIONAIS
              </span>

              <h2 className="pf-contact-hub-title">
                Vamos construir algo{" "}
                <span>juntos?</span>
              </h2>

              <p className="pf-contact-hub-intro">
                Estou em busca de oportunidades
                de estágio em Tecnologia da Informação,
                aprendizado e colaboração em projetos.
                Escolha um canal para entrar em contato.
              </p>
            </div>

            <div className="pf-contact-availability">
              <span className="pf-availability-dot" />
              Aberto a oportunidades de estágio
            </div>
          </div>

          <div className="pf-contact-grid">
            <div className="pf-contact-card pf-email-card">
              <div className="pf-contact-icon">
                <Mail size={23} />
              </div>

              <div className="pf-contact-card-body">
                <span className="pf-contact-kicker">
                  E-MAIL PROFISSIONAL
                </span>

                <h3>Envie uma mensagem</h3>

                <p className="pf-contact-email">
                  {contactEmail}
                </p>

                <div className="pf-contact-card-actions">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="pf-contact-action"
                  >
                    Enviar e-mail
                    <ArrowUpRight size={16} />
                  </a>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="pf-contact-copy"
                    aria-label="Copiar endereço de e-mail"
                  >
                    {copied ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}

                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>

                {copyError && (
                  <p
                    role="status"
                    className="pf-contact-copy-error"
                  >
                    Não foi possível copiar automaticamente.
                    Selecione o e-mail acima.
                  </p>
                )}
              </div>
            </div>

            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pf-contact-card pf-contact-link-card"
            >
              <div className="pf-contact-icon">
                <Github size={23} />
              </div>

              <div className="pf-contact-card-body">
                <span className="pf-contact-kicker">
                  CÓDIGO E PROJETOS
                </span>

                <h3>GitHub</h3>

                <p>
                  Explore meus repositórios,
                  estudos e projetos públicos.
                </p>

                <span className="pf-contact-action">
                  Acessar perfil
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </a>

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-contact-card pf-contact-link-card"
              >
                <div className="pf-contact-icon">
                  <Linkedin size={23} />
                </div>

                <div className="pf-contact-card-body">
                  <span className="pf-contact-kicker">
                    REDE PROFISSIONAL
                  </span>

                  <h3>LinkedIn</h3>

                  <p>
                    Conheça minha trajetória
                    e conexões profissionais.
                  </p>

                  <span className="pf-contact-action">
                    Ver LinkedIn
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>
            )}

            {cvUrl && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-contact-card pf-contact-link-card"
              >
                <div className="pf-contact-icon">
                  <FileText size={23} />
                </div>

                <div className="pf-contact-card-body">
                  <span className="pf-contact-kicker">
                    APRESENTAÇÃO PROFISSIONAL
                  </span>

                  <h3>Meu currículo</h3>

                  <p>
                    Formação, conhecimentos
                    técnicos e projetos.
                  </p>

                  <span className="pf-contact-action">
                    Visualizar PDF
                    <Download size={16} />
                  </span>
                </div>
              </a>
            )}

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-contact-card pf-contact-link-card"
              >
                <div className="pf-contact-icon">
                  <MessageCircle size={23} />
                </div>

                <div className="pf-contact-card-body">
                  <span className="pf-contact-kicker">
                    CONTATO DIRETO
                  </span>

                  <h3>WhatsApp</h3>

                  <p>
                    Inicie uma conversa
                    sobre oportunidades.
                  </p>

                  <span className="pf-contact-action">
                    Conversar
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>
            )}
          </div>

          <div className="pf-contact-hub-footer">
            <span className="pf-contact-hub-signature">
              <span className="pf-availability-dot" />
              Thiago Ferraz
            </span>

            <span>
              Desenvolvimento Web • Ciência da Computação
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================
   PÁGINA INICIAL
   ========================================== */

export default function HomePage() {
  const siteRef = useRef<HTMLElement>(null);

  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] =
    useState(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] =
    useState(true);

  const [projectsError, setProjectsError] =
    useState(false);

  const [showAllProjects, setShowAllProjects] =
    useState(false);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "thiagodev-theme"
      );

      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      // O tema continua funcionando sem armazenamento.
    }
  }, []);

  function toggleTheme() {
    const next =
      theme === "dark" ? "light" : "dark";

    setTheme(next);

    try {
      localStorage.setItem(
        "thiagodev-theme",
        next
      );
    } catch {
      // Preferência temporária.
    }
  }

  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;

    function onPointerMove(event: PointerEvent) {
      site?.style.setProperty(
        "--pointer-x",
        `${event.clientX}px`
      );

      site?.style.setProperty(
        "--pointer-y",
        `${event.clientY}px`
      );
    }

    site.addEventListener(
      "pointermove",
      onPointerMove,
      { passive: true }
    );

    return () => {
      site.removeEventListener(
        "pointermove",
        onPointerMove
      );
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    function updateScroll() {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight -
          window.innerHeight;

        setScrollProgress(
          max > 0
            ? Math.max(
                0,
                Math.min(
                  100,
                  (window.scrollY / max) * 100
                )
              )
            : 0
        );

        frame = 0;
      });
    }

    updateScroll();

    window.addEventListener(
      "scroll",
      updateScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateScroll
      );

      window.removeEventListener(
        "resize",
        updateScroll
      );

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const root = siteRef.current;
    if (!root) return;

    const elements =
      root.querySelectorAll<HTMLElement>(
        ".pf-reveal"
      );

    if (
      !("IntersectionObserver" in window) ||
      matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach((element) => {
        element.classList.add("pf-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "pf-visible"
            );

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    root.classList.add("pf-ready");

    return () => {
      observer.disconnect();
    };
  }, [projectsLoading, showAllProjects]);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      if (!supabase) {
        if (active) {
          setProjectsError(true);
          setProjectsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order(
          "created_at",
          { ascending: false }
        );

      if (!active) return;

      setProjects((data || []) as Project[]);
      setProjectsError(!!error);
      setProjectsLoading(false);
    }

    async function loadRepos() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(
            githubUser
          )}/repos?sort=updated&per_page=12`
        );

        if (!response.ok) return;

        const data: GitHubRepo[] =
          await response.json();

        if (active && Array.isArray(data)) {
          setRepos(
            data
              .filter(
                (repo) =>
                  !repo.fork && !repo.archived
              )
              .slice(0, 3)
          );
        }
      } catch {
        // O site permanece funcional.
      }
    }

    loadProjects();
    loadRepos();

    return () => {
      active = false;
    };
  }, []);

  const orderedProjects = useMemo(() => {
    return [
      ...projects.filter(
        (project) => project.featured
      ),
      ...projects.filter(
        (project) => !project.featured
      ),
    ];
  }, [projects]);

  const visibleProjects = showAllProjects
    ? orderedProjects
    : orderedProjects.slice(0, 3);

  return (
    <main
      ref={siteRef}
      className="pf-site"
      data-theme={theme}
    >
      <div
        className="pf-progress"
        style={{
          width: `${scrollProgress}%`,
        }}
      />

      <ParticleBackground theme={theme} />

      <div
        className="pf-pointer-light"
        aria-hidden="true"
      />

      <div
        className="pf-background-grid"
        aria-hidden="true"
      />

      {/* CABEÇALHO */}

      <header className="pf-header">
        <div className="pf-container pf-header-inner">
          <Link
            href="#inicio"
            aria-label="Thiago.dev — início"
          >
            <Brand />
          </Link>

          <nav
            className="pf-desktop-nav"
            aria-label="Navegação principal"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pf-header-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="pf-theme-button"
              aria-label={
                theme === "dark"
                  ? "Ativar modo claro"
                  : "Ativar modo escuro"
              }
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}

              <span className="pf-theme-label">
                {theme === "dark"
                  ? "Claro"
                  : "Escuro"}
              </span>
            </button>

            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pf-btn pf-btn-outline pf-github-header"
            >
              <Github size={17} />
              GitHub
            </a>

            <a
              href={cvUrl || "#experiencia"}
              target={
                cvUrl ? "_blank" : undefined
              }
              rel={
                cvUrl
                  ? "noopener noreferrer"
                  : undefined
              }
              className="pf-btn pf-btn-primary pf-cv-header"
            >
              {cvUrl ? (
                <Download size={17} />
              ) : (
                <GraduationCap size={17} />
              )}

              {cvUrl
                ? "Currículo"
                : "Trajetória"}
            </a>

            <button
              type="button"
              className="pf-menu-button"
              aria-expanded={menuOpen}
              aria-label={
                menuOpen
                  ? "Fechar menu"
                  : "Abrir menu"
              }
              onClick={() =>
                setMenuOpen((current) => !current)
              }
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className="pf-mobile-nav"
            aria-label="Menu móvel"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* APRESENTAÇÃO */}

      <section
        className="pf-hero pf-hero-neon"
        id="inicio"
      >
        <div
          className="pf-neon-floor"
          aria-hidden="true"
        />

        <div
          className="pf-neon-horizon"
          aria-hidden="true"
        />

        <svg
          className="pf-neon-waves"
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="wave-color"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0"
                stopColor="#7c3aed"
                stopOpacity="0"
              />
              <stop
                offset=".45"
                stopColor="#d946ef"
                stopOpacity=".8"
              />
              <stop
                offset="1"
                stopColor="#a855f7"
                stopOpacity=".1"
              />
            </linearGradient>
          </defs>

          <path
            d="M-50 300 C250 80 430 440 760 210 S1190 120 1490 250"
            stroke="url(#wave-color)"
            strokeWidth="2"
            fill="none"
          />

          <path
            d="M-50 340 C280 130 490 440 800 250 S1210 160 1490 290"
            stroke="url(#wave-color)"
            strokeWidth="1.4"
            fill="none"
          />

          <path
            d="M-50 370 C200 190 490 430 840 290 S1260 220 1490 340"
            stroke="url(#wave-color)"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        <div className="pf-orb pf-orb-one" />
        <div className="pf-orb pf-orb-two" />

        <div className="pf-container pf-hero-grid">
          <div className="pf-hero-copy pf-reveal">
            <p className="pf-eyebrow">
              OLÁ, EU SOU O
            </p>

            <h1 className="pf-hero-title">
              <span className="pf-gradient-text">
                Thiago
              </span>
            </h1>

            <h2 className="pf-hero-subtitle">
              Desenvolvedor Web em formação
            </h2>

            <p className="pf-hero-description">
              Estudante de Ciência da Computação
              na UNG. Transformo ideias em
              aplicações web e construo projetos
              reais enquanto evoluo como
              desenvolvedor.
            </p>

            <div className="pf-hero-buttons">
              <a
                href="#projetos"
                className="pf-btn pf-btn-primary pf-btn-large"
              >
                <Rocket size={18} />
                Ver projetos
              </a>

              <a
                href="#sobre"
                className="pf-btn pf-btn-outline pf-btn-large"
              >
                Conhecer mais
                <ArrowDown size={18} />
              </a>
            </div>

            <div className="pf-socials">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github size={19} />
              </a>

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={19} />
                </a>
              )}

              <a
                href={`mailto:${contactEmail}`}
                aria-label="E-mail"
              >
                <Mail size={19} />
              </a>
            </div>
          </div>

          <div className="pf-terminal-wrap pf-reveal">
            <div className="pf-terminal-glow" />

            <div className="pf-terminal">
              <div className="pf-terminal-top">
                <span className="pf-dot pf-red" />
                <span className="pf-dot pf-yellow" />
                <span className="pf-dot pf-green" />

                <span className="pf-terminal-filename">
                  thiago.dev
                </span>

                <span className="pf-terminal-status">
                  ● online
                </span>
              </div>

              <div className="pf-terminal-code">
                <div>
                  <span className="pf-line-no">
                    01
                  </span>
                  <span className="pf-purple">
                    const
                  </span>
                  {" dev = {"}
                </div>

                <div>
                  <span className="pf-line-no">
                    02
                  </span>
                  {"  nome: "}
                  <span className="pf-green-text">
                    "Thiago Ferraz"
                  </span>
                  ,
                </div>

                <div>
                  <span className="pf-line-no">
                    03
                  </span>
                  {"  area: "}
                  <span className="pf-green-text">
                    "Desenvolvimento Web"
                  </span>
                  ,
                </div>

                <div>
                  <span className="pf-line-no">
                    04
                  </span>
                  {"  foco: ["}
                  <span className="pf-green-text">
                    "Next.js"
                  </span>
                  ,{" "}
                  <span className="pf-green-text">
                    "TypeScript"
                  </span>
                  {"],"}
                </div>

                <div>
                  <span className="pf-line-no">
                    05
                  </span>
                  {"  objetivo: "}
                  <span className="pf-green-text">
                    "Criar soluções úteis"
                  </span>
                  ,
                </div>

                <div>
                  <span className="pf-line-no">
                    06
                  </span>
                  {"};"}
                </div>

                <div className="pf-code-last">
                  <span className="pf-line-no">
                    07
                  </span>
                  <span className="pf-blue">
                    console
                  </span>
                  .
                  <span className="pf-yellow-text">
                    log
                  </span>
                  (
                  <span className="pf-pink">
                    "Bem-vindo!"
                  </span>
                  );
                  <span className="pf-caret" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE MIM */}

      <section
        className="pf-section pf-section-alt"
        id="sobre"
      >
        <div className="pf-container pf-about-grid">
          <div className="pf-about-art pf-reveal">
            <div className="pf-about-halo" />

            <div className="pf-about-logo">
              <BrandMark size={185} />
            </div>

            <span className="pf-about-art-caption">
              IDENTIDADE • TECNOLOGIA • CRIAÇÃO
            </span>
          </div>

          <div className="pf-reveal">
            <span className="pf-section-line" />

            <h2 className="pf-section-title">
              Sobre mim
            </h2>

            <p className="pf-section-description">
              Sou estudante de Ciência da
              Computação na UNG e desenvolvo
              projetos que conectam aprendizado
              e prática. Tenho interesse em
              desenvolvimento web, inteligência
              artificial e ciência de dados,
              buscando evoluir tecnicamente
              a cada desafio.
            </p>
          </div>

          <div className="pf-about-facts pf-reveal">
            <div className="pf-fact">
              <div className="pf-fact-icon">
                <GraduationCap size={22} />
              </div>

              <div>
                <strong>
                  Ciência da Computação
                </strong>
                <p>UNG — em andamento</p>
              </div>
            </div>

            <div className="pf-fact">
              <div className="pf-fact-icon">
                <Target size={22} />
              </div>

              <div>
                <strong>Foco atual</strong>
                <p>
                  Desenvolvimento web e projetos reais
                </p>
              </div>
            </div>

            <div className="pf-fact">
              <div className="pf-fact-icon">
                <Layers3 size={22} />
              </div>

              <div>
                <strong>Objetivo</strong>
                <p>
                  Construir minha carreira em tecnologia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HABILIDADES */}

      <section
        className="pf-section"
        id="habilidades"
      >
        <div className="pf-container">
          <div className="pf-reveal">
            <span className="pf-section-line" />

            <h2 className="pf-section-title">
              Minhas habilidades
            </h2>

            <p className="pf-section-description">
              Tecnologias e ferramentas
              que estudo e utilizo nos meus projetos.
            </p>
          </div>

          <div className="pf-skills-grid">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="pf-skill-card pf-reveal pf-tilt-card"
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
              >
                <span
                  className="pf-skill-symbol"
                  style={{
                    color: skill.color,
                  }}
                >
                  {skill.symbol}
                </span>

                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJETOS DO SUPABASE */}

      <section
        className="pf-section pf-section-projects"
        id="projetos"
      >
        <div className="pf-container">
          <div className="pf-section-heading pf-reveal">
            <div>
              <span className="pf-section-line" />

              <p className="pf-small-overline">
                TRABALHOS SELECIONADOS
              </p>

              <h2 className="pf-section-title">
                Projetos em destaque
                <span className="pf-accent">
                  .
                </span>
              </h2>

              <p className="pf-section-description">
                Projetos acadêmicos, aplicações web
                e ideias que saíram do papel.
              </p>
            </div>

            {orderedProjects.length > 3 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllProjects(
                    (current) => !current
                  )
                }
                className="pf-text-button"
              >
                {showAllProjects
                  ? "Mostrar destaques"
                  : "Ver todos os projetos"}

                <ArrowRight size={17} />
              </button>
            )}
          </div>

          {projectsLoading ? (
            <div className="pf-empty">
              Carregando projetos...
            </div>
          ) : projectsError ? (
            <div className="pf-empty">
              Não foi possível carregar os projetos.
              Verifique o Supabase.
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="pf-empty">
              Os projetos publicados aparecerão aqui
              quando forem cadastrados no painel.
            </div>
          ) : (
            <div className="pf-projects-grid">
              {visibleProjects.map((project) => (
                <article
                  key={project.id}
                  className="pf-project-card pf-reveal pf-tilt-card"
                  onPointerMove={handleTilt}
                  onPointerLeave={resetTilt}
                >
                  <Link
                    href={`/projetos/${createSlug(
                      project.title
                    )}`}
                    className="pf-project-image"
                  >
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={`Imagem do projeto ${project.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="pf-project-placeholder">
                        <Code2 size={56} />
                      </div>
                    )}

                    <span className="pf-project-image-shine" />
                  </Link>

                  <div className="pf-project-content">
                    <div className="pf-project-top">
                      <Link
                        href={`/projetos/${createSlug(
                          project.title
                        )}`}
                      >
                        <h3>{project.title}</h3>
                      </Link>

                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir ${project.title}`}
                        >
                          <ArrowUpRight size={20} />
                        </a>
                      )}
                    </div>

                    <p className="pf-project-description">
                      {project.description}
                    </p>

                    <div className="pf-tags">
                      {(project.technologies || [])
                        .slice(0, 3)
                        .map((tech) => (
                          <span key={tech}>
                            {tech}
                          </span>
                        ))}
                    </div>

                    <Link
                      href={`/projetos/${createSlug(
                        project.title
                      )}`}
                      className="pf-project-details"
                    >
                      Ver detalhes
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GITHUB */}

      <section className="pf-section pf-section-alt">
        <div className="pf-container">
          <div className="pf-section-heading pf-reveal">
            <div>
              <span className="pf-section-line" />

              <h2 className="pf-section-title">
                Código no GitHub
              </h2>

              <p className="pf-section-description">
                Alguns repositórios públicos e estudos
                que compartilho.
              </p>
            </div>

            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pf-text-button"
            >
              Ver meu perfil
              <ExternalLink size={16} />
            </a>
          </div>

          {repos.length > 0 && (
            <div className="pf-repos-grid">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-repo pf-reveal"
                >
                  <div className="pf-repo-top">
                    <Github size={21} />
                    <ArrowUpRight size={18} />
                  </div>

                  <h3>{repo.name}</h3>

                  <p>
                    {repo.description ||
                      "Repositório público no GitHub."}
                  </p>

                  {repo.language && (
                    <span className="pf-repo-language">
                      {repo.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EXPERIÊNCIA E FORMAÇÃO */}

      <section className="pf-section">
        <div className="pf-container">
          <div
            id="experiencia"
            className="pf-reveal"
          >
            <span className="pf-section-line" />

            <h2 className="pf-section-title">
              Experiência e formação
            </h2>

            <div className="pf-timeline">
              <div className="pf-timeline-item">
                <div className="pf-fact-icon">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <h3>
                    Ciência da Computação — UNG
                  </h3>
                  <p>
                    Em andamento · Início em 2026
                  </p>
                </div>
              </div>

              <div className="pf-timeline-item">
                <div className="pf-fact-icon">
                  <BriefcaseBusiness size={23} />
                </div>

                <div>
                  <h3>
                    Projetos pessoais e acadêmicos
                  </h3>

                  <p>
                    Aplicações web e experiências
                    práticas de desenvolvimento.
                  </p>
                </div>
              </div>

              <div className="pf-timeline-item">
                <div className="pf-fact-icon">
                  <BookOpen size={23} />
                </div>

                <div>
                  <h3>
                    Aprendizado contínuo
                  </h3>

                  <p>
                    Programação, redes, Python
                    e fundamentos de tecnologia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CENTRAL DE CONTATO */}

      <ContactHub />

      {/* RODAPÉ */}

      <footer className="pf-footer">
        <div className="pf-container pf-footer-inner">
          <Link href="#inicio">
            <Brand />
          </Link>

          <p>
            Desenvolvido com curiosidade,
            estudo e código.
          </p>

          <Link href="/admin">
            Área administrativa
          </Link>
        </div>
      </footer>

      {scrollProgress > 25 && (
        <a
          href="#inicio"
          className="pf-back-top"
          aria-label="Voltar ao início"
        >
          <ArrowUpRight size={19} />
        </a>
      )}
    </main>
  );
}
