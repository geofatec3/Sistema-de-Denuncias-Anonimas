const STORAGE_KEY = "denuncia_segura_denuncias_v1";
const SESSION_KEY = "denuncia_segura_sessao";

const STATUS = ["Pendente", "Em análise", "Encaminhada", "Arquivada"];

const $ = (selector) => document.querySelector(selector);

function getDenuncias() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDenuncias(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function gerarProtocolo() {
  const data = new Date();
  const ano = data.getFullYear();
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";

  for (let i = 0; i < 6; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return `DS-${ano}-${codigo}`;
}

function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatarData(dataISO) {
  if (!dataISO) return "Não informada";

  const [ano, mes, dia] = dataISO.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(iso) {
  const data = new Date(iso);

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function mostrarToast(mensagem) {
  const toast = $("#toast");

  toast.textContent = mensagem;
  toast.classList.add("show");

  clearTimeout(mostrarToast.timer);

  mostrarToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function trocarView(view) {
  document.querySelectorAll(".view").forEach((el) => {
    el.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach((el) => {
    el.classList.remove("active");
  });

  $(`#view-${view}`).classList.add("active");

  document
    .querySelector(`.nav-btn[data-view="${view}"]`)
    .classList.add("active");

  if (view === "delegacia") {
    atualizarTelaDelegacia();
  }
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    trocarView(btn.dataset.view);
  });
});

$("#descricao").addEventListener("input", (event) => {
  $("#char-count").textContent = event.target.value.length;
});

$("#denuncia-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const anexo = $("#anexo").files[0];

  const denuncia = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),

    protocolo: gerarProtocolo(),

    categoria: $("#categoria").value,

    local: $("#local").value.trim(),

    dataOcorrencia: $("#data").value,

    descricao: $("#descricao").value.trim(),

    anexo: anexo ? anexo.name : "",

    status: "Pendente",

    criadaEm: new Date().toISOString(),

    atualizadaEm: new Date().toISOString()
  };

  const denuncias = getDenuncias();

  denuncias.unshift(denuncia);

  saveDenuncias(denuncias);

  event.target.reset();

  $("#char-count").textContent = "0";

  $("#consulta-resultado").classList.remove("hidden");

  $("#consulta-resultado").innerHTML = `
    <div class="protocol">
      ${escapar(denuncia.protocolo)}
    </div>

    <p>
      <strong>Denúncia registrada com sucesso.</strong><br>
      Guarde este protocolo para acompanhar o andamento.
      Ele não identifica você.
    </p>
  `;

  $("#protocolo").value = denuncia.protocolo;

  mostrarToast("Denúncia registrada com sucesso.");
});

$("#consulta-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const protocolo = $("#protocolo")
    .value
    .trim()
    .toUpperCase();

  const denuncia = getDenuncias().find(
    (item) => item.protocolo === protocolo
  );

  const resultado = $("#consulta-resultado");

  resultado.classList.remove("hidden");

  if (!denuncia) {
    resultado.innerHTML = `
      <strong>Protocolo não encontrado.</strong>

      <p>
        Confira o número informado e tente novamente.
      </p>
    `;

    return;
  }

  resultado.innerHTML = `
    <div class="protocol">
      ${escapar(denuncia.protocolo)}
    </div>

    <p>
      <strong>Status atual:</strong>
      ${escapar(denuncia.status)}
      <br>

      <strong>Categoria:</strong>
      ${escapar(denuncia.categoria)}
      <br>

      <strong>Última atualização:</strong>
      ${formatarDataHora(denuncia.atualizadaEm)}
    </p>
  `;
});

function estaLogado() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const usuario = $("#usuario").value.trim();

  const senha = $("#senha").value;

  /*
    LOGIN DE DEMONSTRAÇÃO.

    Usuário:
    policial

    Senha:
    123456
  */

  if (usuario === "policial" && senha === "123456") {
    sessionStorage.setItem(SESSION_KEY, "true");

    $("#login-error").classList.add("hidden");

    atualizarTelaDelegacia();

    mostrarToast("Login realizado.");
  } else {
    $("#login-error").classList.remove("hidden");
  }
});

$("#logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);

  atualizarTelaDelegacia();

  mostrarToast("Sessão encerrada.");
});

function atualizarTelaDelegacia() {
  const logado = estaLogado();

  $("#login-panel").classList.toggle(
    "hidden",
    logado
  );

  $("#delegacia-panel").classList.toggle(
    "hidden",
    !logado
  );

  if (logado) {
    renderizarDenuncias();

    atualizarEstatisticas();
  }
}

function atualizarEstatisticas() {
  const denuncias = getDenuncias();

  $("#stat-total").textContent =
    denuncias.length;

  $("#stat-pendente").textContent =
    denuncias.filter(
      (d) => d.status === "Pendente"
    ).length;

  $("#stat-analise").textContent =
    denuncias.filter(
      (d) => d.status === "Em análise"
    ).length;

  $("#stat-encaminhada").textContent =
    denuncias.filter(
      (d) => d.status === "Encaminhada"
    ).length;
}

function classeStatus(status) {
  return {
    "Pendente": "pendente",
    "Em análise": "analise",
    "Encaminhada": "encaminhada",
    "Arquivada": "arquivada"
  }[status] || "";
}

function renderizarDenuncias() {
  const lista = $("#denuncias-lista");

  const vazio = $("#empty-state");

  let denuncias = getDenuncias();

  const filtro =
    $("#filtro-status").value;

  const busca =
    $("#busca").value
      .trim()
      .toLowerCase();

  if (filtro !== "todos") {
    denuncias = denuncias.filter(
      (d) => d.status === filtro
    );
  }

  if (busca) {
    denuncias = denuncias.filter((d) =>
      [
        d.protocolo,
        d.categoria,
        d.local,
        d.descricao
      ]
        .some((valor) =>
          String(valor)
            .toLowerCase()
            .includes(busca)
        )
    );
  }

  if (!denuncias.length) {
    lista.innerHTML = "";

    vazio.classList.remove("hidden");

    return;
  }

  vazio.classList.add("hidden");

  lista.innerHTML = denuncias
    .map((d) => `
      <article class="denuncia-item">

        <div>

          <h3>
            ${escapar(d.categoria)}

            <span class="badge ${classeStatus(d.status)}">
              ${escapar(d.status)}
            </span>
          </h3>

          <div class="meta">

            <span class="protocol-mini">
              ${escapar(d.protocolo)}
            </span>

            <span>•</span>

            <span>
              ${escapar(d.local)}
            </span>

            <span>•</span>

            <span>
              Recebida em
              ${formatarDataHora(d.criadaEm)}
            </span>

          </div>

        </div>

        <div class="item-actions">

          <select
            class="status-select"
            data-id="${escapar(d.id)}"
            aria-label="Alterar status"
          >

            ${STATUS
              .map(
                (status) => `
                  <option
                    ${status === d.status ? "selected" : ""}
                  >
                    ${status}
                  </option>
                `
              )
              .join("")}

          </select>

          <button
            type="button"
            data-details="${escapar(d.id)}"
          >
            Ver detalhes
          </button>

        </div>

      </article>
    `)
    .join("");

  lista
    .querySelectorAll(".status-select")
    .forEach((select) => {

      select.addEventListener(
        "change",
        () => {
          alterarStatus(
            select.dataset.id,
            select.value
          );
        }
      );

    });

  lista
    .querySelectorAll("[data-details]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {
          abrirDetalhes(
            button.dataset.details
          );
        }
      );

    });
}

function alterarStatus(id, novoStatus) {
  const denuncias = getDenuncias();

  const index = denuncias.findIndex(
    (d) => d.id === id
  );

  if (index === -1) {
    return;
  }

  denuncias[index].status =
    novoStatus;

  denuncias[index].atualizadaEm =
    new Date().toISOString();

  saveDenuncias(denuncias);

  renderizarDenuncias();

  atualizarEstatisticas();

  mostrarToast(
    `Status atualizado para "${novoStatus}".`
  );
}

function abrirDetalhes(id) {
  const denuncia = getDenuncias().find(
    (d) => d.id === id
  );

  if (!denuncia) {
    return;
  }

  $("#modal-title").textContent =
    denuncia.protocolo;

  $("#modal-body").innerHTML = `
    <div class="detail-grid">

      <div class="detail-box">
        <small>Status</small>
        <strong>
          ${escapar(denuncia.status)}
        </strong>
      </div>

      <div class="detail-box">
        <small>Categoria</small>
        <strong>
          ${escapar(denuncia.categoria)}
        </strong>
      </div>

      <div class="detail-box">
        <small>Local</small>
        <strong>
          ${escapar(denuncia.local)}
        </strong>
      </div>

      <div class="detail-box">
        <small>Data da ocorrência</small>
        <strong>
          ${formatarData(denuncia.dataOcorrencia)}
        </strong>
      </div>

      <div class="detail-box">
        <small>Recebida em</small>
        <strong>
          ${formatarDataHora(denuncia.criadaEm)}
        </strong>
      </div>

      <div class="detail-box">
        <small>Última atualização</small>
        <strong>
          ${formatarDataHora(denuncia.atualizadaEm)}
        </strong>
      </div>

    </div>

    <h3>Descrição</h3>

    <div class="description-box">
      ${escapar(denuncia.descricao)}
    </div>

    ${
      denuncia.anexo
        ? `
          <p class="muted">
            <strong>Anexo informado:</strong>
            ${escapar(denuncia.anexo)}
          </p>
        `
        : ""
    }
  `;

  $("#modal").classList.remove(
    "hidden"
  );
}

document
  .querySelectorAll("[data-close-modal]")
  .forEach((el) => {

    el.addEventListener(
      "click",
      () => {
        $("#modal").classList.add(
          "hidden"
        );
      }
    );

  });

$("#filtro-status").addEventListener(
  "change",
  renderizarDenuncias
);

$("#busca").addEventListener(
  "input",
  renderizarDenuncias
);

atualizarTelaDelegacia();