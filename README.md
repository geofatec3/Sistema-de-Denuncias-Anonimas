# Sistema-de-Denuncias-
# 🛡️ SisDenúncia - Sistema Web de Denúncias Anônimas

O **SisDenúncia** é um sistema web responsivo desenvolvido para permitir que cidadãos realizem denúncias 100% anônimas de crimes e acompanhem o andamento da investigação via número de protocolo. Além disso, disponibiliza uma área restrita para que a delegacia responsável possa gerenciar, analisar e atualizar o status de cada ocorrência.

---

## 🚀 Funcionalidades

### 👤 Área do Cidadão
- **Aviso de Garantia de Anonimato:** Sem registro de IP ou dados pessoais.
- **Formulário de Denúncia:** Campos para categoria do crime, data/hora, endereço, descrição e upload de arquivos de prova.
- **Geração de Protocolo:** Código único gerado no envio (Ex: `DEN-2026-8942`).
- **Acompanhamento:** Consulta do status em tempo real e leitura dos pareceres policiais através do protocolo.

### 🚓 Área da Delegacia (Painel Policial)
- **Acesso Restrito:** Autenticação simulada de policiais/agentes.
- **Métricas:** Total de denúncias, pendentes, em investigação e concluídas.
- **Diretório de Denúncias:** Tabela interativa com busca e filtro por status.
- **Tratamento de Caso:** Atualização do status e campo de texto livre para parecer policial.

---

## 💻 Tecnologias Utilizadas

- **HTML5:** Estrutura semântica das páginas.
- **Tailwind CSS:** Framework de estilização utilitária rápida e responsiva.
- **JavaScript (ES6+):** Lógica do sistema, manipulação de DOM e persistência local (`localStorage`).
- **FontAwesome:** Ícones de interface policial e cidadã.

---

## 📂 Como Executar Localmente

1. Clone o repositório no seu computador:
   ```bash
   git clone https://github.com/seu-usuario/sis-denuncia.git

