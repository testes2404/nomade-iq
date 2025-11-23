// ================= SUPABASE CLIENT =================
const SUPABASE_URL = "https://rzgdbjdxvzksbbwjwunr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Z2RiamR4dnprc2Jid2p3dW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODAzMTEsImV4cCI6MjA3ODk1NjMxMX0.cslxIWp5V-FhufQUZyIGi-6xD4ZfBKJKqFRgwlSnDyM";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const MASTER_EMAIL = "master@gmail.com";

// TXT – bucket / tabela
const STORAGE_BUCKET_TXT = "txt-conteudos";
const TABLE_TXT = "txt_conteudos";

// COMISSÁRIO – bucket / tabela exclusiva
const STORAGE_BUCKET_COMISSARIO = "conteudos-comissario";
const TABLE_COMISSARIO = "conteudos_comissario";

// (futuro) – tabela de analytics das calculadoras
// const TABLE_ANALYTICS = "calculadora_logs";

// ================= PROTEÇÃO DE ROTA =================
(async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  if (
    error ||
    !data?.user ||
    (data.user.email || "").toLowerCase() !== MASTER_EMAIL
  ) {
    window.location.href = "../index.html";
  }
})();

// ================= ELEMENTOS DOM – TXT =================
const form = document.getElementById("txt-form");
const titleInput = document.getElementById("txt-title");
const fileInput = document.getElementById("txt-file");
const dropzone = document.getElementById("dropzone");
const fileNameLabel = document.getElementById("file-name");
const uploadStatus = document.getElementById("upload-status");
const btnUpload = document.getElementById("btn-upload");
const btnUploadLabel = document.getElementById("btn-upload-label");
const btnUploadSpinner = document.getElementById("btn-upload-spinner");
const listContainer = document.getElementById("txt-list");
const emptyMsg = document.getElementById("txt-list-empty");
const btnReload = document.getElementById("btn-reload");

// MENU / VIEWS
const btnRedacaoPrincipal = document.getElementById("btn-redacao-principal");
const btnRedacaoComissario = document.getElementById("btn-redacao-comissario");
const btnAnaliseRelatorios = document.getElementById("btn-analise-relatorios");

const viewRedacaoPrincipal = document.getElementById("view-redacao-principal");
const viewRedacaoComissario = document.getElementById("view-redacao-comissario");
const viewAnalise = document.getElementById("view-analise");
const viewPlaceholder = document.getElementById("view-placeholder");

// COMISSÁRIO – elementos
const cmsForm = document.getElementById("cms-form");
const cmsCoverDropzone = document.getElementById("cms-cover-dropzone");
const cmsCoverFileInput = document.getElementById("cms-cover-file");
const cmsCoverName = document.getElementById("cms-cover-name");
const cmsMenuButtons = document.querySelectorAll(".cms-menu-btn");
const cmsMenuTypeInput = document.getElementById("cms-menu-type");
const cmsTitleInput = document.getElementById("cms-title");
const cmsBodyInput = document.getElementById("cms-body");
const cmsBtnSave = document.getElementById("cms-btn-save");
const cmsBtnSaveLabel = document.getElementById("cms-btn-save-label");
const cmsBtnSaveSpinner = document.getElementById("cms-btn-save-spinner");
const cmsStatus = document.getElementById("cms-status");
const cmsListContainer = document.getElementById("cms-list");
const cmsListEmpty = document.getElementById("cms-list-empty");
const cmsBtnReload = document.getElementById("cms-btn-reload");

// ANÁLISES & RELATÓRIOS – elementos
const analyticsFilterTipo = document.getElementById("analytics-filter-tipo");
const analyticsList = document.getElementById("analytics-list");
const analyticsListEmpty = document.getElementById("analytics-list-empty");
const analyticsBtnReload = document.getElementById("analytics-btn-reload");
const analyticsChartPlaceholder = document.getElementById(
  "analytics-chart-placeholder"
);

let selectedFile = null; // TXT
let cmsCoverFile = null; // imagem capa
let selectedMenuType = "antes";

// ================= FUNÇÕES AUXILIARES =================
function setUploading(isUploading) {
  if (!btnUpload) return;
  btnUpload.disabled = isUploading;
  btnUploadSpinner?.classList.toggle("hidden", !isUploading);
  if (btnUploadLabel)
    btnUploadLabel.textContent = isUploading ? "Salvando..." : "Salvar texto";
}

function setStatus(message, type = "info") {
  if (!uploadStatus) return;
  uploadStatus.textContent = message || "";
  uploadStatus.classList.remove(
    "text-slate-400",
    "text-emerald-400",
    "text-rose-400"
  );
  if (!message) return;
  if (type === "success") uploadStatus.classList.add("text-emerald-400");
  else if (type === "error") uploadStatus.classList.add("text-rose-400");
  else uploadStatus.classList.add("text-slate-400");
}

function cmsSetStatus(message, type = "info") {
  if (!cmsStatus) return;
  cmsStatus.textContent = message || "";
  cmsStatus.classList.remove(
    "text-slate-400",
    "text-emerald-400",
    "text-rose-400"
  );
  if (!message) return;
  if (type === "success") cmsStatus.classList.add("text-emerald-400");
  else if (type === "error") cmsStatus.classList.add("text-rose-400");
  else cmsStatus.classList.add("text-slate-400");
}

function cmsSetUploading(isUploading) {
  if (!cmsBtnSave) return;
  cmsBtnSave.disabled = isUploading;
  cmsBtnSaveSpinner?.classList.toggle("hidden", !isUploading);
  if (cmsBtnSaveLabel)
    cmsBtnSaveLabel.textContent = isUploading
      ? "Salvando..."
      : "Salvar conteúdo";
}

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function formatDate(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// MENU lateral – estado ativo
function setActiveMenu(button) {
  [btnRedacaoPrincipal, btnRedacaoComissario, btnAnaliseRelatorios].forEach(
    (btn) => {
      if (!btn) return;
      btn.classList.remove(
        "border-indigo-500",
        "bg-slate-900",
        "text-indigo-200",
        "border-emerald-500",
        "text-emerald-200"
      );
    }
  );
  if (button) {
    // mantemos apenas o highlight suave; as classes de cor do botão em si já
    // estão no HTML (indigo para TXT/ART, emerald para BI)
    if (button === btnAnaliseRelatorios) {
      button.classList.add("border-emerald-500", "text-emerald-200");
    } else {
      button.classList.add("border-indigo-500", "bg-slate-900", "text-indigo-200");
    }
  }
}

// ================= MENU LATERAL – AÇÃO DOS BOTÕES =================
if (btnRedacaoPrincipal) {
  btnRedacaoPrincipal.addEventListener("click", () => {
    viewPlaceholder?.classList.add("hidden");
    viewRedacaoPrincipal?.classList.remove("hidden");
    viewRedacaoComissario?.classList.add("hidden");
    viewAnalise?.classList.add("hidden");
    setActiveMenu(btnRedacaoPrincipal);
  });
}

if (btnRedacaoComissario) {
  btnRedacaoComissario.addEventListener("click", () => {
    viewPlaceholder?.classList.add("hidden");
    viewRedacaoComissario?.classList.remove("hidden");
    viewRedacaoPrincipal?.classList.add("hidden");
    viewAnalise?.classList.add("hidden");
    setActiveMenu(btnRedacaoComissario);
  });
}

if (btnAnaliseRelatorios) {
  btnAnaliseRelatorios.addEventListener("click", () => {
    viewPlaceholder?.classList.add("hidden");
    viewAnalise?.classList.remove("hidden");
    viewRedacaoPrincipal?.classList.add("hidden");
    viewRedacaoComissario?.classList.add("hidden");
    setActiveMenu(btnAnaliseRelatorios);
    // quando abrir a aba de BI, já puxa os dados (placeholder por enquanto)
    loadAnalytics();
  });
}

// ================= DRAG & DROP – TXT =================
if (dropzone) {
  function openFileDialog() {
    fileInput?.click();
  }

  dropzone.addEventListener("click", openFileDialog);

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      selectedFile = file;
      if (fileNameLabel) {
        fileNameLabel.textContent = `Arquivo selecionado: ${file.name}`;
        fileNameLabel.classList.remove("hidden");
      }
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dropzone-highlight");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dropzone-highlight");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".txt")) {
        setStatus("Envie apenas arquivos .txt", "error");
        return;
      }
      selectedFile = file;
      if (fileNameLabel) {
        fileNameLabel.textContent = `Arquivo selecionado: ${file.name}`;
        fileNameLabel.classList.remove("hidden");
      }
    }
  });
}

// ================= SUBMIT (UPLOAD TXT) =================
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = (titleInput?.value || "").trim();
  if (!title) {
    setStatus("Informe um título para o texto.", "error");
    return;
  }
  if (!selectedFile) {
    setStatus("Selecione ou arraste um arquivo .txt.", "error");
    return;
  }
  if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
    setStatus("O arquivo precisa estar no formato .txt.", "error");
    return;
  }

  setUploading(true);
  setStatus("Enviando arquivo para o Supabase Storage...");

  try {
    const now = new Date();
    const datePrefix = `${now.getFullYear()}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const ts = now.toISOString().replace(/[:.]/g, "-");
    const safeTitle = slugify(title) || "texto";
    const path = `${datePrefix}/${ts}-${safeTitle}.txt`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(STORAGE_BUCKET_TXT)
      .upload(path, selectedFile, {
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error(uploadError);
      throw new Error(uploadError.message || "Erro ao enviar arquivo para o Storage.");
    }

    setStatus("Arquivo enviado. Gravando registro...", "info");

    const { error: insertError } = await supabaseClient.from(TABLE_TXT).insert({
      title,
      path: uploadData.path,
    });

    if (insertError) {
      console.error(insertError);
      throw new Error(insertError.message || "Erro ao salvar informações na tabela.");
    }

    setStatus("Texto salvo com sucesso!", "success");

    form.reset();
    selectedFile = null;
    if (fileNameLabel) {
      fileNameLabel.textContent = "";
      fileNameLabel.classList.add("hidden");
    }

    await loadTxtList();
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Erro ao salvar texto.", "error");
  } finally {
    setUploading(false);
  }
});

// ================= LISTAGEM TXT (MAIS NOVOS PRIMEIRO) =================
async function loadTxtList() {
  if (!listContainer) return;

  listContainer.innerHTML = "";
  emptyMsg && emptyMsg.remove?.();

  const loadingRow = document.createElement("p");
  loadingRow.className = "text-xs text-slate-500";
  loadingRow.textContent = "Carregando textos...";
  listContainer.appendChild(loadingRow);

  const { data, error } = await supabaseClient
    .from(TABLE_TXT)
    .select("*")
    .order("created_at", { ascending: false });

  listContainer.innerHTML = "";

  if (error) {
    console.error(error);
    const errEl = document.createElement("p");
    errEl.className = "text-xs text-rose-400";
    errEl.textContent = "Erro ao carregar lista de textos.";
    listContainer.appendChild(errEl);
    return;
  }

  if (!data || data.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-xs text-slate-500";
    empty.textContent = "Nenhum texto enviado ainda.";
    listContainer.appendChild(empty);
    return;
  }

  data.forEach((row) => {
    const item = document.createElement("div");
    item.className =
      "flex items-start justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2.5";

    const textWrap = document.createElement("div");
    textWrap.className = "flex-1 min-w-0";

    const titleEl = document.createElement("p");
    titleEl.className = "text-sm font-medium text-slate-50 truncate";
    titleEl.textContent = row.title || "(Sem título)";

    const metaEl = document.createElement("p");
    metaEl.className = "text-[11px] text-slate-400 mt-0.5";
    metaEl.textContent = formatDate(row.created_at) || "";

    textWrap.appendChild(titleEl);
    textWrap.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "flex items-center gap-1";

    const openBtn = document.createElement("a");
    openBtn.className =
      "inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white transition";
    openBtn.textContent = "Abrir";

    const publicUrl = supabaseClient.storage.from(STORAGE_BUCKET_TXT)
      .getPublicUrl(row.path).data.publicUrl;

    openBtn.href = publicUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noreferrer";

    actions.appendChild(openBtn);

    item.appendChild(textWrap);
    item.appendChild(actions);

    listContainer.appendChild(item);
  });
}

btnReload?.addEventListener("click", loadTxtList);

// ================= COMISSÁRIO – COVER DRAG & DROP =================
if (cmsCoverDropzone) {
  cmsCoverDropzone.addEventListener("click", () => {
    cmsCoverFileInput?.click();
  });

  cmsCoverFileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      cmsCoverFile = file;
      if (cmsCoverName) {
        cmsCoverName.textContent = `Arquivo selecionado: ${file.name}`;
        cmsCoverName.classList.remove("hidden");
      }
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    cmsCoverDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      cmsCoverDropzone.classList.add("dropzone-highlight");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    cmsCoverDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      cmsCoverDropzone.classList.remove("dropzone-highlight");
    });
  });

  cmsCoverDropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        cmsSetStatus("Envie apenas imagens (JPG, PNG, WEBP).", "error");
        return;
      }
      cmsCoverFile = file;
      if (cmsCoverName) {
        cmsCoverName.textContent = `Arquivo selecionado: ${file.name}`;
        cmsCoverName.classList.remove("hidden");
      }
    }
  });
}

// ================= COMISSÁRIO – SELETOR DE MENU =================
cmsMenuButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.getAttribute("data-value") || "antes";
    selectedMenuType = value;
    if (cmsMenuTypeInput) cmsMenuTypeInput.value = value;

    cmsMenuButtons.forEach((b) => {
      b.classList.remove(
        "bg-indigo-600",
        "text-white",
        "shadow",
        "shadow-indigo-900/40"
      );
      b.classList.remove("border-indigo-500", "text-indigo-200");
      if (!b.classList.contains("bg-slate-900")) {
        b.classList.add("bg-slate-900");
      }
    });

    btn.classList.add(
      "bg-indigo-600",
      "text-white",
      "shadow",
      "shadow-indigo-900/40"
    );
  });
});

// ================= COMISSÁRIO – SUBMIT =================
cmsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = (cmsTitleInput?.value || "").trim();
  const body = (cmsBodyInput?.value || "").trim();
  const menuType = selectedMenuType;

  if (!cmsCoverFile) {
    cmsSetStatus("Selecione uma imagem de capa.", "error");
    return;
  }
  if (!title) {
    cmsSetStatus("Informe o título do artigo.", "error");
    return;
  }
  if (!body) {
    cmsSetStatus("Escreva o texto do artigo.", "error");
    return;
  }

  cmsSetUploading(true);
  cmsSetStatus("Enviando capa e salvando conteúdo...");

  try {
    const now = new Date();
    const datePrefix = `${now.getFullYear()}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const ts = now.toISOString().replace(/[:.]/g, "-");
    const safeTitle = slugify(title) || "artigo";
    const ext = (cmsCoverFile.name.split(".").pop() || "jpg").toLowerCase();
    const path = `covers/${datePrefix}/${ts}-${safeTitle}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(STORAGE_BUCKET_COMISSARIO)
      .upload(path, cmsCoverFile, {
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error(uploadError);
      throw new Error(uploadError.message || "Erro ao enviar capa para o Storage.");
    }

    const { error: insertError } = await supabaseClient
      .from(TABLE_COMISSARIO)
      .insert({
        menu_type: menuType,
        title,
        body,
        cover_path: uploadData.path,
      });

    if (insertError) {
      console.error(insertError);
      throw new Error(
        insertError.message || "Erro ao salvar conteúdo na tabela exclusiva."
      );
    }

    cmsSetStatus("Conteúdo salvo com sucesso!", "success");

    cmsForm.reset();
    cmsCoverFile = null;
    if (cmsCoverName) {
      cmsCoverName.textContent = "";
      cmsCoverName.classList.add("hidden");
    }

    // volta seletor para o primeiro
    selectedMenuType = "antes";
    if (cmsMenuTypeInput) cmsMenuTypeInput.value = "antes";

    cmsMenuButtons.forEach((b, idx) => {
      b.classList.remove(
        "bg-indigo-600",
        "text-white",
        "shadow",
        "shadow-indigo-900/40"
      );
      if (idx === 0) {
        b.classList.add(
          "bg-indigo-600",
          "text-white",
          "shadow",
          "shadow-indigo-900/40"
        );
      } else {
        b.classList.add("bg-slate-900");
      }
    });

    await loadComissarioList();
  } catch (err) {
    console.error(err);
    cmsSetStatus(err.message || "Erro ao salvar conteúdo.", "error");
  } finally {
    cmsSetUploading(false);
  }
});

// ================= COMISSÁRIO – LISTAGEM =================
async function loadComissarioList() {
  if (!cmsListContainer) return;

  cmsListContainer.innerHTML = "";
  cmsListEmpty && cmsListEmpty.remove?.();

  const loadingRow = document.createElement("p");
  loadingRow.className = "text-xs text-slate-500";
  loadingRow.textContent = "Carregando conteúdos...";
  cmsListContainer.appendChild(loadingRow);

  const { data, error } = await supabaseClient
    .from(TABLE_COMISSARIO)
    .select("*")
    .order("created_at", { ascending: false });

  cmsListContainer.innerHTML = "";

  if (error) {
    console.error(error);
    const errEl = document.createElement("p");
    errEl.className = "text-xs text-rose-400";
    errEl.textContent = "Erro ao carregar lista de conteúdos.";
    cmsListContainer.appendChild(errEl);
    return;
  }

  if (!data || data.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-xs text-slate-500";
    empty.textContent = "Nenhum conteúdo cadastrado ainda.";
    cmsListContainer.appendChild(empty);
    return;
  }

  const menuLabels = {
    antes: "O que saber antes de qualquer coisa?",
    certificacao: "O que estudar para a certificação?",
    depois: "O que saber depois da certificação?",
    entrevista: "Como passar na entrevista?",
  };

  data.forEach((row) => {
    const item = document.createElement("div");
    item.className =
      "flex items-start justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2.5";

    const textWrap = document.createElement("div");
    textWrap.className = "flex-1 min-w-0";

    const label = document.createElement("span");
    label.className =
      "inline-flex items-center rounded-full bg-slate-800 text-[10px] text-indigo-300 px-2 py-0.5 mb-1 border border-indigo-500/30";
    label.textContent =
      menuLabels[row.menu_type] || row.menu_type || "Sem categoria";

    const titleEl = document.createElement("p");
    titleEl.className = "text-sm font-medium text-slate-50 truncate";
    titleEl.textContent = row.title || "(Sem título)";

    const metaEl = document.createElement("p");
    metaEl.className = "text-[11px] text-slate-400 mt-0.5";
    metaEl.textContent = formatDate(row.created_at) || "";

    textWrap.appendChild(label);
    textWrap.appendChild(titleEl);
    textWrap.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "flex flex-col items-end gap-1";

    if (row.cover_path) {
      const publicUrl = supabaseClient.storage
        .from(STORAGE_BUCKET_COMISSARIO)
        .getPublicUrl(row.cover_path).data.publicUrl;

      const openCoverBtn = document.createElement("a");
      openCoverBtn.className =
        "inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-800 hover:text-white transition";
      openCoverBtn.textContent = "Ver capa";
      openCoverBtn.href = publicUrl;
      openCoverBtn.target = "_blank";
      openCoverBtn.rel = "noreferrer";
      actions.appendChild(openCoverBtn);
    }

    item.appendChild(textWrap);
    item.appendChild(actions);

    cmsListContainer.appendChild(item);
  });
}

cmsBtnReload?.addEventListener("click", loadComissarioList);

// ================= ANÁLISES & RELATÓRIOS – LISTAGEM / PLACEHOLDER =================
async function loadAnalytics() {
  if (!analyticsList) return;

  analyticsList.innerHTML = "";
  analyticsListEmpty && analyticsListEmpty.remove?.();

  // Por enquanto, só um aviso de que a integração será feita depois:
  const info = document.createElement("p");
  info.className = "text-xs text-slate-500";
  info.textContent =
    "Integração de BI pendente. Aqui vão aparecer os registros das calculadoras (destino, tipo, data).";
  analyticsList.appendChild(info);

  if (analyticsChartPlaceholder) {
    analyticsChartPlaceholder.textContent =
      "Gráfico de uso das calculadoras será exibido aqui (Chart.js + dados do Supabase).";
  }
}

analyticsBtnReload?.addEventListener("click", loadAnalytics);
analyticsFilterTipo?.addEventListener("change", loadAnalytics);

// Carrega listas ao abrir a página
loadTxtList();
loadComissarioList();
// view de BI só carrega quando for aberta pela primeira vez
