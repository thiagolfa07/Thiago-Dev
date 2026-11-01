
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  Globe,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  Images,
  CheckCircle2,
  Wrench,
  Code2,
} from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  features: string[] | null;
  challenges: string | null;
  category: string;
  technologies: string[];
  image_url: string | null;
  gallery_images: string[] | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
};

function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProject() {
      setLoading(true);
      setNotFound(false);

      if (!supabase || !slug) {
        if (active) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true);

      if (!active) return;

      const found = !error
        ? (data || []).find(
            (item) => createSlug(item.title) === slug
          )
        : null;

      setProject(found ? (found as Project) : null);
      setNotFound(!found);
      setActiveIndex(0);
      setLightboxOpen(false);
      setLoading(false);
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [slug]);

  const images = useMemo(() => {
    const urls = [
      project?.image_url,
      ...(project?.gallery_images || []),
    ]
      .filter(
        (url): url is string =>
          typeof url === "string" &&
          url.trim().length > 0
      )
      .map((url) => url.trim());

    return Array.from(new Set(urls));
  }, [project]);

  function previousImage() {
    if (!images.length) return;

    setActiveIndex(
      (index) =>
        (index - 1 + images.length) % images.length
    );
  }

  function nextImage() {
    if (!images.length) return;

    setActiveIndex(
      (index) => (index + 1) % images.length
    );
  }

  useEffect(() => {
    if (!lightboxOpen || !images.length) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex(
          (index) => (index + 1) % images.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex(
          (index) =>
            (index - 1 + images.length) % images.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, images.length]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-violet-300">
        <LoaderCircle
          className="animate-spin"
          size={30}
        />
        <span className="ml-3">
          Carregando projeto...
        </span>
      </main>
    );
  }

  if (notFound || !project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center text-zinc-100">
        <h1 className="text-4xl font-bold">
          Projeto não encontrado
        </h1>

        <p className="mt-3 text-zinc-400">
          Esse projeto não existe ou não está publicado.
        </p>

        <Link
          href="/#projetos"
          className="mt-7 rounded-xl bg-violet-500 px-5 py-3 font-semibold"
        >
          Voltar aos projetos
        </Link>
      </main>
    );
  }

  const features = project.features || [];

  const detailedDescription =
    project.long_description?.trim() ||
    project.description;

  const hasChallenges =
    !!project.challenges?.trim();

  return (
    <main className="min-h-screen bg-ink text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 md:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
        >
          Thiago
          <span className="text-violet-400">
            .dev
          </span>
        </Link>

        <Link
          href="/#projetos"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300"
        >
          <ArrowLeft size={16} />
          Voltar ao portfólio
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8">
        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs text-violet-200">
          {project.category}
        </span>

        <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {project.title}
          <span className="text-violet-400">
            .
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
          {project.description}
        </p>

        {images.length > 0 && (
          <section
            className="mt-12"
            aria-label={`Galeria de imagens do projeto ${project.title}`}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel">
              <button
                type="button"
                onClick={() =>
                  setLightboxOpen(true)
                }
                aria-label="Ampliar imagem"
                className="group block w-full cursor-zoom-in"
              >
                <img
                  src={images[activeIndex]}
                  alt={`${project.title} — imagem ${
                    activeIndex + 1
                  } de ${images.length}`}
                  className="max-h-[600px] min-h-[240px] w-full object-contain transition duration-300 group-hover:scale-[1.01] sm:min-h-[360px]"
                />
              </button>

              <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3 py-2 text-xs text-zinc-200 backdrop-blur">
                <Images size={14} />
                {activeIndex + 1} / {images.length}
              </span>

              <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/65 p-2 text-zinc-200 backdrop-blur">
                <Expand size={16} />
              </span>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Imagem anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/75 p-2 text-white transition hover:bg-violet-600 sm:left-5 sm:p-3"
                  >
                    <ChevronLeft size={23} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Próxima imagem"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/75 p-2 text-white transition hover:bg-violet-600 sm:right-5 sm:p-3"
                  >
                    <ChevronRight size={23} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Ver imagem ${
                      index + 1
                    }`}
                    aria-pressed={
                      index === activeIndex
                    }
                    className={`h-20 w-28 flex-none overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                      index === activeIndex
                        ? "border-violet-400"
                        : "border-white/10 opacity-65 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Miniatura ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-zinc-500">
              Toque na imagem para ampliar.
            </p>
          </section>
        )}

        <div className="mt-14 grid gap-10 md:grid-cols-[1fr_300px]">
          <div>
            <section>
              <h2 className="text-2xl font-semibold">
                Sobre o projeto
              </h2>

              <div className="mt-5 border-l-2 border-violet-500/40 pl-5">
                <p className="whitespace-pre-line text-base leading-8 text-zinc-400">
                  {detailedDescription}
                </p>
              </div>
            </section>

            {features.length > 0 && (
              <section className="mt-14">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <CheckCircle2
                      size={21}
                      className="text-violet-300"
                    />
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Funcionalidades desenvolvidas
                  </h2>
                </div>

                <div className="mt-6 grid gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-panel px-5 py-4"
                    >
                      <CheckCircle2
                        size={19}
                        className="mt-1 shrink-0 text-violet-400"
                      />

                      <p className="text-sm leading-7 text-zinc-300 sm:text-base">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-14">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <Code2
                    size={21}
                    className="text-violet-300"
                  />
                </div>

                <h2 className="text-2xl font-semibold">
                  Tecnologias utilizadas
                </h2>
              </div>

              {project.technologies?.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-sm text-violet-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-zinc-500">
                  Tecnologias ainda não cadastradas.
                </p>
              )}
            </section>

            {hasChallenges && (
              <section className="mt-14">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Wrench
                      size={21}
                      className="text-violet-300"
                    />
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Desafios técnicos
                  </h2>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-panel p-6">
                  <p className="whitespace-pre-line text-base leading-8 text-zinc-400">
                    {project.challenges}
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-panel p-6 md:sticky md:top-6">
            <h2 className="text-lg font-semibold">
              Acesse o projeto
            </h2>

            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold transition hover:bg-violet-400"
              >
                <Globe size={17} />
                Acessar projeto
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Link do projeto ainda não disponível.
              </p>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:border-violet-400/40"
              >
                <Github size={17} />
                Ver código no GitHub
                <ArrowUpRight size={16} />
              </a>
            )}

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Categoria
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {project.category}
              </p>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Imagens
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {images.length}{" "}
                {images.length === 1
                  ? "imagem"
                  : "imagens"}
              </p>
            </div>

            {features.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Funcionalidades
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {features.length} cadastradas
                </p>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-2 text-sm text-violet-300 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Explorar outros projetos
          </Link>
        </div>
      </section>

      {lightboxOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada de ${project.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-3 py-14 sm:px-12"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar imagem"
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-zinc-900 p-3 text-white hover:bg-violet-600"
          >
            <X size={23} />
          </button>

          <img
            src={images[activeIndex]}
            alt={`${project.title} — imagem ampliada ${
              activeIndex + 1
            }`}
            className="max-h-full max-w-full object-contain"
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                aria-label="Imagem anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/90 p-2 text-white hover:bg-violet-600 sm:left-6 sm:p-3"
              >
                <ChevronLeft size={25} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                aria-label="Próxima imagem"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/90 p-2 text-white hover:bg-violet-600 sm:right-6 sm:p-3"
              >
                <ChevronRight size={25} />
              </button>

              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </main>
  );
}
