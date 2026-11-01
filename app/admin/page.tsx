
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Plus,
  Save,
  Trash2,
  Image as ImageIcon,
  LoaderCircle,
  ChevronUp,
  ChevronDown,
  X,
  Images,
  FileText,
  ListChecks,
  Wrench,
} from "lucide-react";

const ADMIN_ID = "cbf28e89-c41f-48cb-b4aa-b00ef19c42b8";

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

type ProjectDraft = Omit<
  Partial<Project>,
  "technologies" | "features"
> & {
  technologies?: string[] | string;
  features?: string[] | string;
};

const blank: ProjectDraft = {
  title: "",
  description: "",
  long_description: "",
  features: "",
  challenges: "",
  category: "Desenvolvimento web",
  technologies: "",
  image_url: "",
  gallery_images: [],
  live_url: "",
  github_url: "",
  featured: false,
  published: true,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-zinc-100 outline-none transition focus:border-violet-400/60";

const labelClass = "block text-sm text-zinc-300";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [draft, setDraft] = useState<ProjectDraft>({
    ...blank,
    gallery_images: [],
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const isUploading = uploadingImage || uploadingGallery;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id === ADMIN_ID) {
      loadProjects();
    }
  }, [session]);

  async function loadProjects() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProjects((data || []) as Project[]);
    }
  }

  function updateDraft(values: Partial<ProjectDraft>) {
    setDraft((current) => ({
      ...current,
      ...values,
    }));
  }

  function resetDraft() {
    setDraft({
      ...blank,
      gallery_images: [],
    });
    setEditingId(null);
  }

  function validateImage(file: File) {
    if (!file.type.startsWith("image/")) {
      return "Selecione um arquivo de imagem válido.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Cada imagem deve ter no máximo 5 MB.";
    }

    return null;
  }

  async function sendImage(file: File) {
    if (!supabase) {
      throw new Error("Supabase não configurado.");
    }

    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    const filePath = `${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function uploadProjectImage(file: File) {
    if (session?.user?.id !== ADMIN_ID) {
      setMessage("Você não tem permissão para enviar imagens.");
      return;
    }

    const validationError = validateImage(file);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      const imageUrl = await sendImage(file);

      updateDraft({
        image_url: imageUrl,
      });

      setMessage("Capa enviada! Agora salve o projeto.");
    } catch (error) {
      setMessage(
        "Erro ao enviar capa: " +
          (error instanceof Error
            ? error.message
            : "Erro desconhecido")
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadGalleryImages(files: File[]) {
    if (
      !files.length ||
      busy ||
      uploadingGallery ||
      uploadingImage
    ) {
      return;
    }

    if (session?.user?.id !== ADMIN_ID) {
      setMessage("Você não tem permissão para enviar imagens.");
      return;
    }

    for (const file of files) {
      const validationError = validateImage(file);

      if (validationError) {
        setMessage(`${file.name}: ${validationError}`);
        return;
      }
    }

    setUploadingGallery(true);
    setMessage("");

    const uploaded: string[] = [];
    const failures: string[] = [];

    try {
      for (const file of files) {
        try {
          const imageUrl = await sendImage(file);
          uploaded.push(imageUrl);
        } catch (error) {
          failures.push(
            `${file.name}: ${
              error instanceof Error
                ? error.message
                : "Erro desconhecido"
            }`
          );
        }
      }

      if (uploaded.length > 0) {
        setDraft((current) => ({
          ...current,
          gallery_images: [
            ...(current.gallery_images || []),
            ...uploaded,
          ],
        }));
      }

      if (failures.length > 0) {
        setMessage(
          `${uploaded.length} imagem(ns) enviada(s). Falhas: ${failures.join(
            "; "
          )}`
        );
      } else {
        setMessage(
          `${uploaded.length} imagem(ns) enviada(s)! Clique em Salvar projeto.`
        );
      }
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(index: number) {
    setDraft((current) => ({
      ...current,
      gallery_images: (current.gallery_images || []).filter(
        (_, position) => position !== index
      ),
    }));

    setMessage(
      "Imagem removida da galeria. Salve o projeto para confirmar."
    );
  }

  function moveGalleryImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const images = [...(current.gallery_images || [])];
      const target = index + direction;

      if (target < 0 || target >= images.length) {
        return current;
      }

      [images[index], images[target]] = [
        images[target],
        images[index],
      ];

      return {
        ...current,
        gallery_images: images,
      };
    });
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Configure as variáveis do Supabase.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setMessage(
        error
          ? error.message
          : "Login realizado com sucesso."
      );
    } catch {
      setMessage("Não foi possível realizar o login.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault();

    if (
      !supabase ||
      busy ||
      uploadingImage ||
      uploadingGallery
    ) {
      return;
    }

    if (session?.user?.id !== ADMIN_ID) {
      setMessage("Você não tem permissão para salvar projetos.");
      return;
    }

    setBusy(true);
    setMessage("");

    const technologies =
      typeof draft.technologies === "string"
        ? draft.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean)
        : draft.technologies || [];

    const features =
      typeof draft.features === "string"
        ? draft.features
            .split(/\r?\n/)
            .map((feature) => feature.trim())
            .filter(Boolean)
        : draft.features || [];

    const payload = {
      title: draft.title?.trim() || "",
      description: draft.description?.trim() || "",
      long_description: draft.long_description?.trim() || null,
      features,
      challenges: draft.challenges?.trim() || null,
      category: draft.category?.trim() || "Projeto",
      technologies,
      image_url: draft.image_url || null,
      gallery_images: draft.gallery_images || [],
      live_url: draft.live_url || null,
      github_url: draft.github_url || null,
      featured: !!draft.featured,
      published: !!draft.published,
    };

    try {
      const result = editingId
        ? await supabase
            .from("projects")
            .update(payload)
            .eq("id", editingId)
        : await supabase
            .from("projects")
            .insert(payload);

      if (result.error) {
        setMessage(result.error.message);
      } else {
        resetDraft();
        await loadProjects();
        setMessage("Projeto salvo com sucesso.");
      }
    } catch {
      setMessage("Não foi possível salvar o projeto.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(id: string) {
    if (!supabase || busy || isUploading) return;

    if (session?.user?.id !== ADMIN_ID) {
      setMessage("Você não tem permissão para excluir projetos.");
      return;
    }

    if (
      !window.confirm(
        "Tem certeza que deseja excluir este projeto?"
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) {
        setMessage(error.message);
      } else {
        await loadProjects();
        setMessage("Projeto excluído com sucesso.");
      }
    } catch {
      setMessage("Não foi possível excluir o projeto.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setProjects([]);
    resetDraft();
    setMessage("");
  }

  function editProject(project: Project) {
    setDraft({
      ...project,
      technologies: (project.technologies || []).join(", "),
      features: (project.features || []).join("\n"),
      long_description: project.long_description || "",
      challenges: project.challenges || "",
      gallery_images: project.gallery_images || [],
    });

    setEditingId(project.id);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    resetDraft();
    setMessage("");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-violet-200">
        <LoaderCircle className="animate-spin" />
        <span className="ml-3">Carregando...</span>
      </main>
    );
  }

  if (!supabase) {
    return (
      <main className="min-h-screen bg-ink px-5 py-20 text-zinc-100">
        <div className="mx-auto max-w-xl rounded-3xl border border-violet-300/20 bg-panel p-8">
          <h1 className="text-3xl font-semibold">
            Configurar o painel
          </h1>

          <p className="mt-4 text-zinc-400">
            Configure NEXT_PUBLIC_SUPABASE_URL e
            NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>

          <a
            href="/"
            className="mt-6 inline-block text-violet-300"
          >
            Voltar ao portfólio
          </a>
        </div>
      </main>
    );
  }

  if (session && session.user.id !== ADMIN_ID) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-zinc-100">
        <h1 className="text-2xl font-bold">
          Acesso negado
        </h1>

        <p className="mt-3 text-zinc-400">
          Você não tem permissão para acessar esta área.
        </p>

        <button
          type="button"
          onClick={signOut}
          className="mt-6 rounded-xl bg-violet-500 px-5 py-3 font-semibold"
        >
          Sair da conta
        </button>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-12">
        <form
          onSubmit={signIn}
          className="w-full max-w-md rounded-3xl border border-violet-300/20 bg-panel p-8 shadow-neon"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-violet-300"
          >
            <ArrowLeft size={16} />
            Voltar ao portfólio
          </a>

          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <LogIn size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-white">
            Painel administrativo
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Entre com sua conta de administrador para gerenciar
            os projetos do portfólio.
          </p>

          <label className="mt-6 block text-sm text-zinc-300">
            E-mail
          </label>

          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className={inputClass}
          />

          <label className="mt-4 block text-sm text-zinc-300">
            Senha
          </label>

          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className={inputClass}
          />

          {message && (
            <p className="mt-4 text-sm text-rose-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
          >
            {busy ? (
              <LoaderCircle
                className="animate-spin"
                size={18}
              />
            ) : (
              <LogIn size={18} />
            )}
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <a
              href="/"
              className="text-sm text-violet-300"
            >
              ← Ver portfólio
            </a>

            <h1 className="mt-2 text-3xl font-semibold">
              Gerenciar projetos
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Adicione, edite, publique ou remova seus trabalhos.
            </p>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-violet-400/40"
          >
            <LogOut size={16} />
            Sair
          </button>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_1.1fr]">
          <section className="h-fit rounded-2xl border border-violet-300/20 bg-panel p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Plus className="text-violet-300" />
              {editingId ? "Editar projeto" : "Novo projeto"}
            </h2>

            <form
              onSubmit={saveProject}
              className="mt-5 space-y-5"
            >
              <div>
                <label className={labelClass}>
                  Nome do projeto *
                </label>

                <input
                  required
                  value={draft.title || ""}
                  onChange={(event) =>
                    updateDraft({
                      title: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Descrição curta *
                </label>

                <textarea
                  required
                  rows={3}
                  value={draft.description || ""}
                  onChange={(event) =>
                    updateDraft({
                      description: event.target.value,
                    })
                  }
                  placeholder="Um resumo do projeto para o portfólio."
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-xs text-zinc-500">
                  Esse texto será usado como apresentação
                  resumida do projeto.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-400/15 bg-violet-500/5 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-200">
                  <FileText size={17} />
                  Informações detalhadas
                </h3>

                <div className="mt-5">
                  <label className={labelClass}>
                    Descrição detalhada
                  </label>

                  <textarea
                    rows={7}
                    value={draft.long_description || ""}
                    onChange={(event) =>
                      updateDraft({
                        long_description: event.target.value,
                      })
                    }
                    placeholder="Explique o objetivo, o funcionamento, o processo de desenvolvimento e o resultado do projeto."
                    className={`${inputClass} resize-y`}
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Você pode escrever vários parágrafos.
                    Eles serão preservados na página do projeto.
                  </p>
                </div>

                <div className="mt-5">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <ListChecks
                      size={17}
                      className="text-violet-300"
                    />
                    Funcionalidades desenvolvidas
                  </label>

                  <textarea
                    rows={6}
                    value={
                      Array.isArray(draft.features)
                        ? draft.features.join("\n")
                        : draft.features || ""
                    }
                    onChange={(event) =>
                      updateDraft({
                        features: event.target.value,
                      })
                    }
                    placeholder={
                      "Autenticação de usuários\nPainel administrativo\nUpload de imagens\nIntegração com banco de dados"
                    }
                    className={`${inputClass} resize-y`}
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Escreva uma funcionalidade por linha.
                    Cada linha aparecerá como um item separado.
                  </p>
                </div>

                <div className="mt-5">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <Wrench
                      size={17}
                      className="text-violet-300"
                    />
                    Desafios técnicos
                  </label>

                  <textarea
                    rows={6}
                    value={draft.challenges || ""}
                    onChange={(event) =>
                      updateDraft({
                        challenges: event.target.value,
                      })
                    }
                    placeholder="Descreva dificuldades técnicas que você realmente enfrentou e como conseguiu resolvê-las."
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Categoria
                </label>

                <input
                  value={draft.category || ""}
                  onChange={(event) =>
                    updateDraft({
                      category: event.target.value,
                    })
                  }
                  placeholder="Ex.: Desenvolvimento web"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tecnologias (separadas por vírgula)
                </label>

                <input
                  value={
                    Array.isArray(draft.technologies)
                      ? draft.technologies.join(", ")
                      : draft.technologies || ""
                  }
                  onChange={(event) =>
                    updateDraft({
                      technologies: event.target.value,
                    })
                  }
                  placeholder="Next.js, TypeScript, Supabase"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Imagem de capa
                </label>

                <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200 hover:bg-violet-500/20">
                    {uploadingImage ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <ImageIcon size={18} />
                    )}

                    {uploadingImage
                      ? "Enviando imagem..."
                      : "Escolher imagem de capa"}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={busy || isUploading}
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

                        if (file) {
                          uploadProjectImage(file);
                        }

                        event.target.value = "";
                      }}
                    />
                  </label>

                  <p className="mt-2 text-xs text-zinc-500">
                    Imagem principal. Tamanho máximo: 5 MB.
                  </p>

                  <input
                    type="url"
                    value={draft.image_url || ""}
                    onChange={(event) =>
                      updateDraft({
                        image_url: event.target.value,
                      })
                    }
                    placeholder="Ou cole uma URL de imagem..."
                    className={inputClass}
                  />

                  {draft.image_url && (
                    <img
                      src={draft.image_url}
                      alt="Prévia da capa"
                      className="mt-4 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <Images
                    size={17}
                    className="text-violet-300"
                  />
                  Galeria de imagens
                </label>

                <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200 hover:bg-violet-500/20">
                    {uploadingGallery ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Plus size={18} />
                    )}

                    {uploadingGallery
                      ? "Enviando imagens..."
                      : "Adicionar imagens à galeria"}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={busy || isUploading}
                      className="hidden"
                      onChange={(event) => {
                        const files = Array.from(
                          event.target.files || []
                        );

                        if (files.length) {
                          uploadGalleryImages(files);
                        }

                        event.target.value = "";
                      }}
                    />
                  </label>

                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Selecione várias imagens, com até
                    5 MB cada. A capa aparece primeiro
                    no carrossel.
                  </p>

                  {(draft.gallery_images || []).length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {(draft.gallery_images || []).map(
                        (url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950"
                          >
                            <img
                              src={url}
                              alt={`Imagem ${
                                index + 1
                              } da galeria`}
                              className="h-28 w-full object-cover"
                            />

                            <div className="flex items-center justify-between gap-1 px-2 py-2">
                              <span className="text-xs text-zinc-400">
                                #{index + 1}
                              </span>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  disabled={
                                    index === 0 ||
                                    busy ||
                                    isUploading
                                  }
                                  onClick={() =>
                                    moveGalleryImage(index, -1)
                                  }
                                  title="Mover para antes"
                                  aria-label="Mover imagem para antes"
                                  className="rounded-md border border-white/10 p-1 text-zinc-300 disabled:opacity-30"
                                >
                                  <ChevronUp size={16} />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    index ===
                                      (draft.gallery_images ||
                                        []).length -
                                        1 ||
                                    busy ||
                                    isUploading
                                  }
                                  onClick={() =>
                                    moveGalleryImage(index, 1)
                                  }
                                  title="Mover para depois"
                                  aria-label="Mover imagem para depois"
                                  className="rounded-md border border-white/10 p-1 text-zinc-300 disabled:opacity-30"
                                >
                                  <ChevronDown size={16} />
                                </button>

                                <button
                                  type="button"
                                  disabled={busy || isUploading}
                                  onClick={() =>
                                    removeGalleryImage(index)
                                  }
                                  title="Remover da galeria"
                                  aria-label="Remover imagem da galeria"
                                  className="rounded-md border border-rose-400/20 p-1 text-rose-300 disabled:opacity-30"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-center text-xs text-zinc-500">
                      Ainda não há imagens extras
                      neste projeto.
                    </p>
                  )}

                  <p className="mt-3 text-xs text-zinc-500">
                    Clique em Salvar projeto para confirmar
                    as alterações da galeria. Remover uma
                    imagem daqui não apaga seu arquivo
                    do Supabase Storage.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Link do projeto publicado
                </label>

                <input
                  type="url"
                  value={draft.live_url || ""}
                  onChange={(event) =>
                    updateDraft({
                      live_url: event.target.value,
                    })
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Link do GitHub
                </label>

                <input
                  type="url"
                  value={draft.github_url || ""}
                  onChange={(event) =>
                    updateDraft({
                      github_url: event.target.value,
                    })
                  }
                  placeholder="https://github.com/..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap gap-5 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!draft.published}
                    onChange={(event) =>
                      updateDraft({
                        published: event.target.checked,
                      })
                    }
                    className="accent-violet-500"
                  />
                  Publicado
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!draft.featured}
                    onChange={(event) =>
                      updateDraft({
                        featured: event.target.checked,
                      })
                    }
                    className="accent-violet-500"
                  />
                  Destaque
                </label>
              </div>

              {message && (
                <p
                  role="status"
                  className="text-sm text-violet-200"
                >
                  {message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy || isUploading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-semibold hover:bg-violet-400 disabled:opacity-60"
                >
                  {busy ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {busy
                    ? "Salvando..."
                    : "Salvar projeto"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    disabled={busy || isUploading}
                    onClick={cancelEditing}
                    className="rounded-xl border border-white/10 px-4 py-3 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Seus projetos
              </h2>

              <span className="text-sm text-zinc-500">
                {projects.length} cadastrados
              </span>
            </div>

            {projects.length ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-panel p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {project.title}
                          </h3>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] ${
                              project.published
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-amber-400/10 text-amber-200"
                            }`}
                          >
                            {project.published
                              ? "Publicado"
                              : "Rascunho"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
                          {project.description}
                        </p>

                        <p className="mt-3 text-xs text-violet-300">
                          {project.technologies?.join(
                            " · "
                          )}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          {(project.features || []).length}{" "}
                          funcionalidade(s) cadastrada(s)
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`Editar ${project.title}`}
                          onClick={() =>
                            editProject(project)
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-violet-400/50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          aria-label={`Excluir ${project.title}`}
                          onClick={() =>
                            deleteProject(project.id)
                          }
                          disabled={busy || isUploading}
                          className="rounded-lg border border-rose-400/20 p-2 text-rose-300 hover:bg-rose-400/10 disabled:opacity-60"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                Nenhum projeto cadastrado ainda.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
