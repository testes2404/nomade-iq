// =========================
// Supabase Client
// =========================
const SUPABASE_URL = "https://rzgdbjdxvzksbbwjwunr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Z2RiamR4dnprc2Jid2p3dW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODAzMTEsImV4cCI6MjA3ODk1NjMxMX0.cslxIWp5V-FhufQUZyIGi-6xD4ZfBKJKqFRgwlSnDyM";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Nome da tabela onde você salvou os .txt (ajuste se for diferente)
const TABLE_NAME = "gestao_textos";

// Tabela para salvar mensagens do formulário "Fale Connosco"
const CONTACT_TABLE = "hub_contatos";

// =========================
// MENU MOBILE
// =========================
const menuButtonEl = document.getElementById("menu-button");
if (menuButtonEl) {
  menuButtonEl.addEventListener("click", function () {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.classList.toggle("hidden");
    }
  });
}

// =========================
// MODAL LOGIN / CRIAR CONTA (GERAL)
// =========================
const loginModal = document.getElementById("login-modal");
const loginButtonDesktop = document.getElementById("login-button-desktop");
const loginButtonMobile = document.getElementById("login-button-mobile");

function openLoginModal() {
  if (!loginModal) return;
  loginModal.style.display = "flex";
}

function closeLoginModal() {
  if (!loginModal) return;
  loginModal.style.display = "none";
  const statusEl = document.getElementById("auth-status");
  if (statusEl) statusEl.textContent = "";
}

if (loginButtonDesktop) {
  loginButtonDesktop.addEventListener("click", openLoginModal);
}
if (loginButtonMobile) {
  loginButtonMobile.addEventListener("click", openLoginModal);
}

// será usado também para fechar o modal de leitura
window.addEventListener("click", function (event) {
  if (event.target === loginModal) {
    closeLoginModal();
  }
  if (event.target === leituraModal) {
    closeLeituraModal();
  }
});

// =========================
// FORM CONTATO (salvar no Supabase)
// =========================
async function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const statusElement = document.getElementById("message-status");

  if (!nameInput || !emailInput || !messageInput || !statusElement) return;

  const nome = (nameInput.value || "").trim();
  const email = (emailInput.value || "").trim();
  const mensagem = (messageInput.value || "").trim();

  // feedback inicial
  statusElement.classList.remove("hidden", "text-green-400", "text-red-400");
  statusElement.classList.add("text-gray-300");
  statusElement.textContent = "Enviando sua mensagem...";

  // validação simples
  if (!nome || !email || !mensagem) {
    statusElement.textContent = "Por favor, preencha nome, e-mail e mensagem.";
    statusElement.classList.remove("text-gray-300");
    statusElement.classList.add("text-red-400");
    return;
  }

  try {
    const { error } = await supabaseClient.from(CONTACT_TABLE).insert([
      {
        nome,
        email,
        mensagem,
        origem: "hub_site", // opcional: de onde veio
        tipo: "pergunta/elogio",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Erro ao salvar contato:", error);
      statusElement.textContent =
        "Não foi possível enviar agora. Tente novamente em instantes.";
      statusElement.classList.remove("text-gray-300");
      statusElement.classList.add("text-red-400");
      return;
    }

    // sucesso
    statusElement.textContent =
      "Mensagem enviada com sucesso! Em breve entraremos em contacto.";
    statusElement.classList.remove("text-gray-300");
    statusElement.classList.add("text-green-400");

    // limpa campos
    nameInput.value = "";
    emailInput.value = "";
    messageInput.value = "";

    setTimeout(() => {
      statusElement.classList.add("hidden");
    }, 5000);
  } catch (err) {
    console.error("Erro inesperado ao salvar contato:", err);
    statusElement.textContent =
      "Ocorreu um erro inesperado. Tente novamente em alguns minutos.";
    statusElement.classList.remove("text-gray-300");
    statusElement.classList.add("text-red-400");
  }
}

// deixa a função acessível ao onsubmit do HTML
window.handleFormSubmit = handleFormSubmit;

// =========================
// NAV CALCULADORAS: abre no clique (mobile/desktop)
// =========================
const calcNav = document.querySelector(".calc-nav");
const calcMainTrigger = document.getElementById("calc-main-trigger");

if (calcNav && calcMainTrigger) {
  calcMainTrigger.addEventListener("click", () => {
    calcNav.classList.toggle("open");
  });
}

// =========================
// Abas Login / Criar Conta (MODAL GERAL)
// =========================
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const modalTitle = document.getElementById("auth-modal-title");

const goToSignup = document.getElementById("go-to-signup");
const goToLogin = document.getElementById("go-to-login");

function showLogin() {
  if (!loginForm || !signupForm || !modalTitle) return;

  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  modalTitle.textContent = "Iniciar Sessão";

  if (tabLogin && tabSignup) {
    tabLogin.classList.add("bg-indigo-600", "text-white", "font-semibold");
    tabLogin.classList.remove("bg-gray-800", "text-gray-300");

    tabSignup.classList.remove("bg-indigo-600", "text-white", "font-semibold");
    tabSignup.classList.add("bg-gray-800", "text-gray-300");
  }
}

function showSignup() {
  if (!loginForm || !signupForm || !modalTitle) return;

  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  modalTitle.textContent = "Criar Conta";

  if (tabLogin && tabSignup) {
    tabSignup.classList.add("bg-indigo-600", "text-white", "font-semibold");
    tabSignup.classList.remove("bg-gray-800", "text-gray-300");

    tabLogin.classList.remove("bg-indigo-600", "text-white", "font-semibold");
    tabLogin.classList.add("bg-gray-800", "text-gray-300");
  }
}

if (tabLogin) tabLogin.addEventListener("click", showLogin);
if (tabSignup) tabSignup.addEventListener("click", showSignup);
if (goToSignup) goToSignup.addEventListener("click", showSignup);
if (goToLogin) goToLogin.addEventListener("click", showLogin);

// estado inicial
showLogin();

// =========================
// Auth: Login (MODAL GERAL)
// =========================
const authStatus = document.getElementById("auth-status");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!authStatus) return;

    authStatus.textContent = "Entrando...";
    authStatus.classList.remove("text-red-400");
    authStatus.classList.add("text-gray-300");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      authStatus.textContent =
        error.message || "Erro ao entrar. Verifique os dados.";
      authStatus.classList.remove("text-gray-300");
      authStatus.classList.add("text-red-400");
    } else {
      authStatus.textContent = "Login realizado com sucesso!";
      authStatus.classList.remove("text-red-400");
      authStatus.classList.add("text-green-400");

      if (email.toLowerCase() === "master@gmail.com") {
        window.location.href = "gestao/gestao.html";
      } else {
        setTimeout(() => {
          closeLoginModal();
        }, 1200);
      }
    }
  });
}

// =========================
// Auth: Criar Conta (MODAL GERAL)
// =========================
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!authStatus) return;

    authStatus.textContent = "Criando conta...";
    authStatus.classList.remove("text-red-400");
    authStatus.classList.add("text-gray-300");

    const nome = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: nome,
          origem: "hub_modal_geral",
        },
      },
    });

    if (error) {
      authStatus.textContent = error.message || "Erro ao criar conta.";
      authStatus.classList.remove("text-gray-300");
      authStatus.classList.add("text-red-400");
    } else {
      authStatus.textContent =
        "Conta criada! Verifique seu e-mail para confirmar.";
      authStatus.classList.remove("text-red-400");
      authStatus.classList.add("text-green-400");
      showLogin();
    }
  });
}

// =========================
// LEITURAS: buscar últimos .txt e montar cards
// =========================
const leiturasGrid = document.getElementById("leituras-grid");
const leiturasLoading = document.getElementById("leituras-loading");

async function carregarLeituras() {
  if (!leiturasGrid || !leiturasLoading) return;

  try {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6); // pega os mais recentes

    if (error) {
      console.error(error);
      leiturasLoading.textContent =
        "Não foi possível carregar as leituras agora.";
      return;
    }

    if (!data || data.length === 0) {
      leiturasLoading.textContent =
        "Ainda não temos textos cadastrados. Em breve novidades!";
      return;
    }

    // Remove placeholder
    leiturasLoading.remove();

    data.forEach((item) => {
      const titulo = item.titulo || "Leitura sem título";
      const url = item.file_url || item.arquivo_url || "";
      const createdAt = item.created_at ? new Date(item.created_at) : null;

      const card = document.createElement("article");
      card.className =
        "bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-indigo-600 transition duration-300 transform hover:shadow-2xl hover:shadow-indigo-900/20 flex flex-col justify-between";

      card.innerHTML = `
        <div>
          <h3 class="text-xl font-semibold mb-2 text-white line-clamp-2">${titulo}</h3>
          ${
            createdAt
              ? `<p class="text-xs text-gray-500 mb-3">Publicado em ${createdAt.toLocaleDateString(
                  "pt-BR"
                )}</p>`
              : `<p class="text-xs text-gray-500 mb-3">Data não disponível</p>`
          }
          <p class="text-sm text-gray-400 mb-4">
            Clique em "Ler agora" para abrir o texto completo desta leitura.
          </p>
        </div>
        <button
          class="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition leitura-open-btn"
          data-url="${url}"
          data-titulo="${titulo.replace(/"/g, "&quot;")}"
          ${!url ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ""}
        >
          Ler agora
        </button>
      `;

      leiturasGrid.appendChild(card);
    });

    // Liga eventos dos botões
    document.querySelectorAll(".leitura-open-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        const titulo = btn.getAttribute("data-titulo") || "Leitura";
        if (!url) return;
        abrirLeitura(titulo, url);
      });
    });
  } catch (err) {
    console.error(err);
    leiturasLoading.textContent =
      "Erro inesperado ao carregar as leituras.";
  }
}

// =========================
// Modal de leitura
// =========================
const leituraModal = document.getElementById("leitura-modal");
const leituraTitulo = document.getElementById("leitura-titulo");
const leituraTexto = document.getElementById("leitura-texto");

async function abrirLeitura(titulo, url) {
  if (!leituraModal || !leituraTitulo || !leituraTexto) return;

  leituraTitulo.textContent = titulo;
  leituraTexto.textContent = "Carregando texto...";
  leituraModal.style.display = "flex";

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      leituraTexto.textContent = "Não foi possível carregar este texto.";
      return;
    }
    const txt = await resp.text();
    leituraTexto.textContent = txt;
  } catch (err) {
    console.error(err);
    leituraTexto.textContent = "Erro ao carregar o conteúdo.";
  }
}

function closeLeituraModal() {
  if (!leituraModal) return;
  leituraModal.style.display = "none";
}

// Carrega leituras ao abrir a página
carregarLeituras();

// =====================================================
//  COMUNIDADE — ACESSO PROTEGIDO + MODAL COMPLETO
// =====================================================
const communityModal = document.getElementById("community-modal");
const communityTabLogin = document.getElementById("community-tab-login");
const communityTabSignup = document.getElementById("community-tab-signup");
const communityTabReset = document.getElementById("community-tab-reset");

const communityLoginForm = document.getElementById("community-login-form");
const communitySignupForm = document.getElementById("community-signup-form");
const communityResetForm = document.getElementById("community-reset-form");

const communityStatus = document.getElementById("community-status");

// ----- funçõezinhas de abrir/fechar -----
function openCommunityModal() {
  if (!communityModal) return;
  communityModal.classList.remove("hidden");
  communityModal.classList.add("flex");
}

function closeCommunityModal() {
  if (!communityModal || !communityStatus) return;
  communityModal.classList.add("hidden");
  communityModal.classList.remove("flex");
  communityStatus.textContent = "";
  communityStatus.classList.remove("text-red-400", "text-green-400");
  communityStatus.classList.add("text-gray-300");
}

// deixa global para o botão "X"
window.closeCommunityModal = closeCommunityModal;

// ----- tabs internas -----
function showCommunityLogin() {
  if (!communityLoginForm || !communitySignupForm || !communityResetForm) return;
  communityLoginForm.classList.remove("hidden");
  communitySignupForm.classList.add("hidden");
  communityResetForm.classList.add("hidden");

  if (communityTabLogin && communityTabSignup && communityTabReset) {
    communityTabLogin.classList.add("bg-indigo-600", "text-white");
    communityTabLogin.classList.remove("bg-gray-800", "text-gray-300");

    communityTabSignup.classList.remove("bg-indigo-600", "text-white");
    communityTabSignup.classList.add("bg-gray-800", "text-gray-300");

    communityTabReset.classList.remove("bg-indigo-600", "text-white");
    communityTabReset.classList.add("bg-gray-800", "text-gray-300");
  }
}

function showCommunitySignup() {
  if (!communityLoginForm || !communitySignupForm || !communityResetForm) return;
  communityLoginForm.classList.add("hidden");
  communitySignupForm.classList.remove("hidden");
  communityResetForm.classList.add("hidden");

  if (communityTabLogin && communityTabSignup && communityTabReset) {
    communityTabSignup.classList.add("bg-indigo-600", "text-white");
    communityTabSignup.classList.remove("bg-gray-800", "text-gray-300");

    communityTabLogin.classList.remove("bg-indigo-600", "text-white");
    communityTabLogin.classList.add("bg-gray-800", "text-gray-300");

    communityTabReset.classList.remove("bg-indigo-600", "text-white");
    communityTabReset.classList.add("bg-gray-800", "text-gray-300");
  }
}

function showCommunityReset() {
  if (!communityLoginForm || !communitySignupForm || !communityResetForm) return;
  communityLoginForm.classList.add("hidden");
  communitySignupForm.classList.add("hidden");
  communityResetForm.classList.remove("hidden");

  if (communityTabLogin && communityTabSignup && communityTabReset) {
    communityTabReset.classList.add("bg-indigo-600", "text-white");
    communityTabReset.classList.remove("bg-gray-800", "text-gray-300");

    communityTabLogin.classList.remove("bg-indigo-600", "text-white");
    communityTabLogin.classList.add("bg-gray-800", "text-gray-300");

    communityTabSignup.classList.remove("bg-indigo-600", "text-white");
    communityTabSignup.classList.add("bg-gray-800", "text-gray-300");
  }
}

if (communityTabLogin) communityTabLogin.addEventListener("click", showCommunityLogin);
if (communityTabSignup) communityTabSignup.addEventListener("click", showCommunitySignup);
if (communityTabReset) communityTabReset.addEventListener("click", showCommunityReset);

// estado inicial do modal de comunidade
showCommunityLogin();

// ----- Acesso ao clicar em "Comunidade" no header -----
async function openCommunityAccess(event) {
  if (event) event.preventDefault();

  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      console.warn("Erro ao verificar sessão:", error);
    }

    if (data && data.user) {
      // Já está logado → vai direto pra comunidade
      window.location.href = "comunidade/comunidade.html";
      return;
    }

    // Não logado → abre modal de comunidade (tab login)
    showCommunityLogin();
    openCommunityModal();
  } catch (err) {
    console.error("Erro ao checar login para comunidade:", err);
    showCommunityLogin();
    openCommunityModal();
  }
}

// deixa global para os links com onclick no HTML
window.openCommunityAccess = openCommunityAccess;

// ----- Login da Comunidade -----
if (communityLoginForm && communityStatus) {
  communityLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailEl = document.getElementById("community-login-email");
    const passEl = document.getElementById("community-login-password");
    if (!emailEl || !passEl) return;

    const email = emailEl.value.trim();
    const password = passEl.value;

    communityStatus.textContent = "Entrando na comunidade...";
    communityStatus.classList.remove("text-red-400", "text-green-400");
    communityStatus.classList.add("text-gray-300");

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      communityStatus.textContent =
        error.message || "Não foi possível entrar. Verifique os dados.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-red-400");
      return;
    }

    // opcional: salvar email localmente
    localStorage.setItem("hub_user_email", email);

    communityStatus.textContent = "Login realizado! Redirecionando...";
    communityStatus.classList.remove("text-gray-300");
    communityStatus.classList.add("text-green-400");

    setTimeout(() => {
      window.location.href = "comunidade/comunidade.html";
    }, 1000);
  });
}

// ----- Redefinição de senha da Comunidade -----
if (communityResetForm && communityStatus) {
  communityResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailEl = document.getElementById("community-reset-email");
    if (!emailEl) return;

    const email = emailEl.value.trim();
    if (!email) return;

    communityStatus.textContent = "Enviando link de redefinição...";
    communityStatus.classList.remove("text-red-400", "text-green-400");
    communityStatus.classList.add("text-gray-300");

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) {
      communityStatus.textContent =
        error.message || "Não foi possível enviar o link.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-red-400");
    } else {
      communityStatus.textContent =
        "Se o e-mail existir na base, enviaremos o link de redefinição.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-green-400");
    }
  });
}

// ----- Criar conta da Comunidade (com perguntas + termos) -----
if (communitySignupForm && communityStatus) {
  communitySignupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameEl = document.getElementById("community-signup-name");
    const emailEl = document.getElementById("community-signup-email");
    const passEl = document.getElementById("community-signup-password");
    const passConfEl = document.getElementById(
      "community-signup-password-confirm"
    );

    const countryEl = document.getElementById("community-country");
    const stateEl = document.getElementById("community-state");
    const cityEl = document.getElementById("community-city");
    const cepEl = document.getElementById("community-cep");

    const qp1 = document.getElementById("qp1");
    const qp2 = document.getElementById("qp2");
    const qp3 = document.getElementById("qp3");
    const qp4 = document.getElementById("qp4");
    const qp5 = document.getElementById("qp5");

    const qv1 = document.getElementById("qv1");
    const qv2 = document.getElementById("qv2");
    const qv3 = document.getElementById("qv3");
    const qv4 = document.getElementById("qv4");
    const qv5 = document.getElementById("qv5");

    const acceptTermsEl = document.getElementById("community-accept-terms");

    if (
      !nameEl ||
      !emailEl ||
      !passEl ||
      !passConfEl ||
      !countryEl ||
      !stateEl ||
      !cityEl ||
      !cepEl ||
      !qp1 ||
      !qp2 ||
      !qp3 ||
      !qp4 ||
      !qp5 ||
      !qv1 ||
      !qv2 ||
      !qv3 ||
      !qv4 ||
      !qv5 ||
      !acceptTermsEl
    ) {
      return;
    }

    communityStatus.textContent = "Criando sua conta...";
    communityStatus.classList.remove("text-red-400", "text-green-400");
    communityStatus.classList.add("text-gray-300");

    const nome = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passEl.value;
    const passwordConfirm = passConfEl.value;

    if (password !== passwordConfirm) {
      communityStatus.textContent = "As senhas não coincidem.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-red-400");
      return;
    }

    if (!acceptTermsEl.checked) {
      communityStatus.textContent =
        "Você precisa aceitar os termos para criar a conta.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-red-400");
      return;
    }

    const profileData = {
      nome,
      origem: "comunidade",
      pais: countryEl.value.trim(),
      estado: stateEl.value.trim(),
      cidade: cityEl.value.trim(),
      cep: cepEl.value.trim(),
      perguntas_pessoais: {
        qp1: qp1.value.trim(),
        qp2: qp2.value.trim(),
        qp3: qp3.value.trim(),
        qp4: qp4.value.trim(),
        qp5: qp5.value.trim(),
      },
      perguntas_viagem: {
        qv1: qv1.value.trim(),
        qv2: qv2.value.trim(),
        qv3: qv3.value.trim(),
        qv4: qv4.value.trim(),
        qv5: qv5.value.trim(),
      },
      aceitou_termos: true,
      termos_versao: "1.0",
      termos_aceitos_em: new Date().toISOString(),
    };

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: profileData,
      },
    });

    if (error) {
      communityStatus.textContent =
        error.message || "Erro ao criar conta na comunidade.";
      communityStatus.classList.remove("text-gray-300");
      communityStatus.classList.add("text-red-400");
      return;
    }

    communityStatus.textContent =
      "Conta criada! Verifique seu e-mail para confirmar e depois faça login.";
    communityStatus.classList.remove("text-gray-300");
    communityStatus.classList.add("text-green-400");

    // Opcional: já mudar para aba de login
    showCommunityLogin();
  });
}
