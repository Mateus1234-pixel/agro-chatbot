// public/script.js
// Integração do Agrosense: IBGE, OpenWeatherMap e OpenAI

// Chaves de ambiente carregadas via public/ENV.js:
// window.ENV = { OWM_KEY: 'sua_key_openweather' };

// Helpers de notificação (usa showNotification definido no index.html)
function notify(msg, type = 'info', duration = 5000) {
  if (window.showNotification) return window.showNotification(msg, type, duration);
  alert(msg);
}









 // Variáveis de mapa (visíveis globalmente)
    window.mapaPrincipal = null;
    let mapaPopup = null;
    let marcadorPrincipal = null;
    let marcadorPopup = null;
    let mapInitialized = false;

    function initMap() {
      if (mapInitialized) return;
      const mapaEl = document.getElementById('mapa');
      if (!mapaEl) return;

      mapaEl.innerHTML = '';
      const leafletDiv = document.createElement('div');
      leafletDiv.style.width = '100%';
      leafletDiv.style.height = '200px';
      leafletDiv.id = 'mapaLeaflet';
      mapaEl.appendChild(leafletDiv);

      window.mapaPrincipal = L.map('mapaLeaflet').setView([-23.5505, -46.6333], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(window.mapaPrincipal);

      mapInitialized = true;
    }

   
    const activateBtn = document.getElementById('activateBot');
    const robotWrapper = document.getElementById('robotPopupWrapper');

    if (activateBtn && robotWrapper) {
      activateBtn.addEventListener('click', () => {
        const isHidden = getComputedStyle(robotWrapper).display === 'none';
        if (isHidden) {
          robotWrapper.style.display = 'block';
          requestAnimationFrame(() => {
            robotWrapper.style.opacity = '1';
            robotWrapper.style.transform = 'translateY(0)';
            robotWrapper.setAttribute('aria-hidden', 'false');
          });

    
          try { initMap(); } catch(e){}
          setTimeout(() => {
            if (window.mapaPrincipal && typeof window.mapaPrincipal.invalidateSize === 'function') {
              window.mapaPrincipal.invalidateSize();
            }
          }, 250);

          activateBtn.setAttribute('aria-pressed', 'true');
        } else {
          robotWrapper.style.opacity = '0';
          robotWrapper.style.transform = 'translateY(8px)';
          robotWrapper.setAttribute('aria-hidden', 'true');
          setTimeout(() => { robotWrapper.style.display = 'none'; }, 180);
          activateBtn.setAttribute('aria-pressed', 'false');
        }
      });
    }

    // --- Lógica do popup (marcar ponto, mapa popup, conectar, bateria, etc) ---
   const btnMarcar = document.getElementById("btnMarcar");
if (btnMarcar) {
  btnMarcar.addEventListener("click", () => {
    document.getElementById("popupMarcar").style.display = "flex";
    // ...restante do código...
  });
}

    document.getElementById("closePopup").addEventListener("click", () => {
      document.getElementById("popupMarcar").style.display = "none";
      const mapaEl = document.getElementById("mapa");
      if (mapaEl) mapaEl.style.zIndex = 1;
      
    });

    document.getElementById("closeRobotPopup").addEventListener("click", () => {
  document.getElementById("robotPopupWrapper").style.display = "none";
});


    document.getElementById("trocarMapa").addEventListener("click", () => {
      document.getElementById("campoCoordenadas").style.display = "none";
      document.getElementById("campoMapa").style.display = "block";
      setTimeout(() => { if (mapaPopup) mapaPopup.invalidateSize(); }, 200);
    });

    document.getElementById("voltarCoords").addEventListener("click", () => {
      document.getElementById("campoCoordenadas").style.display = "block";
      document.getElementById("campoMapa").style.display = "none";
    });

    document.getElementById("usarCoordenadas").addEventListener("click", () => {
      const lat = parseFloat(document.getElementById("inputLat").value);
      const lng = parseFloat(document.getElementById("inputLng").value);

      if (!isNaN(lat) && !isNaN(lng)) {
        const pos = [lat, lng];
        if (marcadorPrincipal && window.mapaPrincipal) window.mapaPrincipal.removeLayer(marcadorPrincipal);
        if (window.mapaPrincipal) marcadorPrincipal = L.marker(pos).addTo(window.mapaPrincipal);
        if (window.mapaPrincipal) window.mapaPrincipal.setView(pos, 12);
        document.getElementById("popupMarcar").style.display = "none";
        const mapaEl = document.getElementById("mapa");
        if (mapaEl) mapaEl.style.zIndex = 1;
      } else {
        alert("Coordenadas inválidas!");
      }
    });

    // ...existing code...

// --- AJUSTE DA FUNÇÃO DE CONEXÃO DO MONITOR DE SOLO ---
document.getElementById("btnConectar").addEventListener("click", async () => {
  let statusElem = document.getElementById("status");
  statusElem.innerHTML = "Conexão: <span>Carregando...</span>";

  try {
    // Tenta buscar dados do monitor de solo
    const resposta = await fetch(urlSolo, { method: "GET", cache: "no-store", timeout: 4000 });
    if (resposta.ok) {
      statusElem.innerHTML = "Conexão: <span class='verde'>CONECTADO</span>";
      showNotification(
        `<strong><i class="fas fa-plug"></i> Conectado ao monitor de solo!</strong><br>
        Comunicação estabelecida com sucesso.`,
        'success',
        4000
      );
    } else {
      statusElem.innerHTML = "Conexão: <span class='vermelho'>FALHOU</span>";
      showNotification(
        `<strong><i class="fas fa-exclamation-triangle"></i> Falha na conexão!</strong><br>
        Não foi possível conectar ao monitor de solo.`,
        'error',
        4000
      );
    }
  } catch (err) {
    statusElem.innerHTML = "Conexão: <span class='vermelho'>FALHOU</span>";
    showNotification(
      `<strong><i class="fas fa-exclamation-triangle"></i> Falha na conexão!</strong><br>
      Não foi possível conectar ao monitor de solo.<br>
      <span style="color:#e74c3c;">Verifique se o dispositivo está ligado e acessível na rede.</span>`,
      'error',
      5000
    );
  }
});

// ...existing code...

    function atualizarBateria() {
      let nivel = Math.floor(Math.random() * 101);
      if (nivel >= 70) document.getElementById("bateria").innerHTML = `Bateria: <span class='verde'>${nivel}%</span>`;
      else if (nivel >= 40) document.getElementById("bateria").innerHTML = `Bateria: <span class='amarelo'>${nivel}%</span>`;
      else if (nivel >= 10) document.getElementById("bateria").innerHTML = `Bateria: <span class='vermelho'>${nivel}%</span>`;
      else document.getElementById("bateria").innerHTML = `Bateria: <span class='vermelho'>${nivel}% CRÍTICO</span>`;
    }

    function carregarMapa(lat, lon) {
      const mapaEl = document.getElementById("mapa");
      if (!mapaEl) return;

      if (window.mapaPrincipal) {
        window.mapaPrincipal.setView([lat, lon], 12);
        if (marcadorPrincipal) window.mapaPrincipal.removeLayer(marcadorPrincipal);
        marcadorPrincipal = L.marker([lat, lon]).addTo(window.mapaPrincipal);
        return;
      }

      mapaEl.innerHTML = `<iframe width="100%" height="200" frameborder="0" style="border-radius:10px;" src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"></iframe>`;
    }

  

    // Pedir permissão de notificações (opcional)
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      try { Notification.requestPermission(); } catch(e){}
    }

    // Hooks simples para abrir/fechar login/register (se quiser)
    document.getElementById("loginButton")?.addEventListener("click", () => {
      document.getElementById("loginPopupOverlay").style.display = 'flex';
    });
    document.getElementById("closeLoginPopup")?.addEventListener("click", () => {
      document.getElementById("loginPopupOverlay").style.display = 'none';
    });
    document.getElementById("doRegister")?.addEventListener("click", () => {
      document.getElementById("loginPopupOverlay").style.display = 'none';
      document.getElementById("registerPopupOverlay").style.display = 'flex';
    });
    document.getElementById("closeRegisterPopup")?.addEventListener("click", () => {
      document.getElementById("registerPopupOverlay").style.display = 'none';
    });
    document.getElementById("backToLogin")?.addEventListener("click", () => {
      document.getElementById("registerPopupOverlay").style.display = 'none';
      document.getElementById("loginPopupOverlay").style.display = 'flex';
    });









// Carregar serviço de APIs agrícolas


// public/script.js
// Integração do Agrosense: IBGE, OpenWeatherMap e OpenAI

// Chaves de ambiente carregadas via public/ENV.js:
// window.ENV = { OWM_KEY: 'sua_key_openweather' };

// Helpers de notificação (usa showNotification definido no index.html)
function notify(msg, type = 'info', duration = 5000) {
  if (window.showNotification) return window.showNotification(msg, type, duration);
  alert(msg);
}

// Carregar serviço de APIs agrícolas
const loadAgriculturalAPI = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = '../services/agriculturalAPIs.js';
    script.onload = () => resolve(window.agriculturalAPI);
    script.onerror = () => {
      console.warn('Agricultural API service failed to load, using fallbacks');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// --- POPUPS DE LOGIN / CADASTRO ---

// Elementos dos popups
const loginPopup = document.getElementById('loginPopupOverlay');
const registerPopup = document.getElementById('registerPopupOverlay');

// Botões
const doRegisterBtn = document.getElementById('doRegister');
const closeLoginBtn = document.getElementById('closeLoginPopup');
const closeRegisterBtn = document.getElementById('closeRegisterPopup');
const backToLoginBtn = document.getElementById('backToLogin');

const doCompleteRegisterBtn = document.getElementById('doCompleteRegister');
const registerMsg = document.getElementById('registerMsg');

const doLoginBtn = document.getElementById('doLogin');
const loginMsg = document.getElementById('loginMsg');

// --- ABRIR E FECHAR POPUPS ---

doRegisterBtn.addEventListener('click', () => {
  loginPopup.style.display = 'none';
  registerPopup.style.display = 'flex';
});

closeLoginBtn.addEventListener('click', () => loginPopup.style.display = 'none');
closeRegisterBtn.addEventListener('click', () => registerPopup.style.display = 'none');

backToLoginBtn.addEventListener('click', () => {
  registerPopup.style.display = 'none';
  loginPopup.style.display = 'flex';
});

// --- CADASTRO ---
doCompleteRegisterBtn.addEventListener('click', async () => {
  const name = document.getElementById('registerName').value.trim();
  const username = document.getElementById('registerUser').value.trim();
  const password = document.getElementById('registerPass').value;
  const confirmPass = document.getElementById('registerConfirmPass').value;

  if (!name || !username || !password || !confirmPass) {
    registerMsg.textContent = 'Preencha todos os campos!';
    registerMsg.style.color = 'red';
    return;
  }
  if (password !== confirmPass) {
    registerMsg.textContent = 'As senhas não conferem!';
    registerMsg.style.color = 'red';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/banco/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, usuario: username, senha: password })
    });

    const data = await res.json();
    registerMsg.textContent = data.message;
    registerMsg.style.color = res.ok ? 'green' : 'red';

    if (res.ok) {
      // ✅ Adicionar a notificação de sucesso igual ao login
      if (typeof showNotification === "function") {
        showNotification("Cadastro realizado com sucesso!", "success");
      }

      setTimeout(() => {
        registerPopup.style.display = 'none';
        loginPopup.style.display = 'flex';
        document.getElementById('registerName').value = '';
        document.getElementById('registerUser').value = '';
        document.getElementById('registerPass').value = '';
        document.getElementById('registerConfirmPass').value = '';
        registerMsg.textContent = '';
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    registerMsg.textContent = 'Erro de conexão com o servidor!';
    registerMsg.style.color = 'red';
  }
});
// --- LOGIN ---
document.getElementById("doLogin").addEventListener("click", async () => {
  const nome = document.getElementById("loginUser").value.trim();
  const senha = document.getElementById("loginPass").value;
  const loginMsg = document.getElementById("loginMsg");

  if (!nome || !senha) {
    loginMsg.textContent = "Preencha todos os campos!";
    loginMsg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      

      // Salvar usuário no localStorage
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("usuarioId", data.id); // ✅ guarda o id do usuário logado
      document.getElementById("historyButton").style.display = "inline-block";

      setTimeout(() => {
        loginPopupOverlay.style.display = "none";
        document.getElementById("loginButton").textContent = data.nome || nome;
        if (typeof showNotification === "function") {
          showNotification("Login realizado com sucesso!", "success");
        }
      }, 1000);
    } else {
      loginMsg.textContent = data.message || "Usuário ou senha inválidos!";
      loginMsg.style.color = "red";
    }
  } catch (err) {
    console.error("Erro ao tentar login:", err);
    loginMsg.textContent = "Erro de conexão com o servidor!";
    loginMsg.style.color = "red";
  }
});


// Fetch IBGE
async function fetchStates() {
  try {
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const list = await res.json();
    return list.sort((a,b) => a.nome.localeCompare(b.nome));
  } catch {
    notify('Erro ao carregar estados', 'error');
    return [];
  }
}



// Sparkline tooltips
function setupSparklineTooltips() {
  document.querySelectorAll('.sparkline-point').forEach(pt => {
    pt.addEventListener('mouseenter', () => {
      const tip = pt.closest('.sparkline').querySelector('.sparkline-tooltip');
      tip.textContent = `${pt.dataset.value} (${pt.dataset.time})`;
      tip.style.top = (pt.cy.baseVal.value - 30) + 'px';
      tip.style.left = (pt.cx.baseVal.value) + 'px';
      tip.style.opacity = 1;
    });
    pt.addEventListener('mouseleave', () => {
      pt.closest('.sparkline').querySelector('.sparkline-tooltip').style.opacity = 0;
    });
  });
}

// Dark mode toggle
function toggleDarkMode(e) {
  document.body.classList.toggle('dark-mode', e.target.checked);
  localStorage.setItem('darkMode', e.target.checked);
}

// Fecha banner
function closeAlertBanner() {
  alertBanner.style.display = 'none';
}

// Chat/OpenAI
const messages = [];
function renderMessage(text, sender) {
  const el = document.createElement('div');
  el.className = `message ${sender}-message`;
  el.innerText = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendChatMessage() {
  const txt = chatInput.value.trim();
  if (!txt) return;
  messages.push({ role: 'user', content: txt });
  renderMessage(txt, 'user');
  chatInput.value = '';
  renderMessage('...', 'bot');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error(res.statusText);
    const { message } = await res.json();
    chatBody.lastChild.remove();
    renderMessage(message, 'bot');
    messages.push({ role: 'assistant', content: message });
  } catch (err) {
    console.error(err);
    chatBody.lastChild.remove();
    renderMessage('Erro ao enviar mensagem', 'bot');
  }
}

// Recomendação de plantio via IA
async function recommendPlant() {
  const state = stateSelect.options[stateSelect.selectedIndex]?.text;
  const city = citySelect.value;
  const crop = cropSelect.value;
  if (!state || !city || !crop) {
    return notify('Selecione estado, cidade e planta', 'warning');
  }
  const ph = soilPh.innerText;
  const moisture = soilMoisture.innerText;
  const n = soilN.innerText;
  const p = soilP.innerText;
  const k = soilK.innerText;
  const temp = tempNow.innerText;
  const rain = rainChance.innerText;

  const prompt = `Estado: ${state}, Cidade: ${city}. Solo -> pH: ${ph}, Umidade: ${moisture}, NPK: ${n}/${p}/${k}. Clima -> ${temp}, ${rain} de chuva. Recomende plantio de ${crop}, indicando época, técnicas e cuidados.`;

  recommendationResult.innerHTML = '<div class="loader">Carregando...</div>';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ messages: [
        { role: 'system', content: 'Você é Floraplant, especialista agrícola.' },
        { role: 'user', content: prompt }
      ] })
    });
    if (!res.ok) throw new Error(res.statusText);
    const { message } = await res.json();
    if (!message || message.trim() === '') {
      // Se a recomendação estiver vazia, usar informações do calendário
      const calendarInfo = document.getElementById('calendarInfo').innerHTML;
      recommendationResult.innerHTML = `<h3><i class="fas fa-leaf"></i> Recomendação para ${crop}</h3>${calendarInfo}`;
    } else {
      recommendationResult.innerHTML = `<h3><i class="fas fa-leaf"></i> Recomendação para ${crop}</h3><p>${message}</p>`;
    }
  } catch (err) {
    console.error(err);
    recommendationResult.innerHTML = '';
    notify('Erro ao obter recomendação', 'error');
  }
}

// Inicia tudo
document.addEventListener('DOMContentLoaded', async () => {
  // Elementos globais
  window.stateSelect = document.getElementById('stateSelect');
  window.citySelect = document.getElementById('citySelect');
  window.cropSelect = document.getElementById('cropSelect');
  window.recommendationResult = document.getElementById('recommendationResult');
  window.chatBody = document.getElementById('chatBody');
  window.chatInput = document.getElementById('chatInput');
  window.sendChat = document.getElementById('sendChat');
  window.soilPh = document.getElementById('soil-ph');
  window.soilMoisture = document.getElementById('soil-moisture');
  window.soilN = document.getElementById('soil-n');
  window.soilP = document.getElementById('soil-p');
  window.soilK = document.getElementById('soil-k');
  window.tempNow = document.getElementById('temp-now');
  window.rainChance = document.getElementById('rain-chance');
  //window.closeAlert = document.getElementById('closeAlert');
  //window.alertBanner = document.getElementById('alertBanner');

  // Carrega estados e eventos
  await fetchStates().then(list => {
    stateSelect.innerHTML = '<option disabled selected>Selecione seu estado</option>' +
      list.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
      
  });
  stateSelect.addEventListener('change', fetchCities);

  // Tema, alertas e sparklines
  const savedDark = localStorage.getItem('darkMode') === 'true';
  if (savedDark) document.body.classList.add('dark-mode'), document.getElementById('themeToggle').checked = true;
  document.getElementById('themeToggle').addEventListener('change', toggleDarkMode);
  setupSparklineTooltips();

  // Entrada de chat e recomendação
  sendChat.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', e => e.key === 'Enter' && sendChatMessage());
  recommendBtn.addEventListener('click', e => { e.preventDefault(); recommendPlant(); });

  // Boas-vindas
  setTimeout(() => notify('Bem-vindo ao Agrosense! Selecione sua localização para começar.', 'info', 5000), 1500);
});


 // Elementos do DOM
    const stateSelect = document.getElementById('stateSelect');
    const citySelect = document.getElementById('citySelect');
    const dataForm = document.getElementById('dataForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeIcon = document.getElementById('analyzeIcon');
    const recommendBtn = document.getElementById('recommendBtn');
    const cropSelect = document.getElementById('cropSelect');
    const cropsGrid = document.getElementById('cropsGrid');
    const themeToggle = document.getElementById('themeToggle');
    const emptyRecommendation = document.getElementById('emptyRecommendation');
    const currentSeason = document.getElementById('currentSeason');
    const calendarMonths = document.querySelectorAll('.calendar-month');
    const notificationContainer = document.getElementById('notificationContainer');
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close-modal');
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendChat = document.getElementById('sendChat');
    const micButton = document.getElementById('micButton');

    // Elementos do popup de login
const loginButton = document.getElementById('loginButton');
const loginPopupOverlay = document.getElementById('loginPopupOverlay');
const closeLoginPopup = document.getElementById('closeLoginPopup');
const doLogin = document.getElementById('doLogin');
const doRegister = document.getElementById('doRegister');


// Mostrar popup de login
loginButton.addEventListener('click', () => {
  loginPopupOverlay.style.display = 'flex';
  loginMsg.textContent = '';
  loginMsg.style.color = '#e74c3c';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
});

// Fechar popup de login
closeLoginPopup.addEventListener('click', () => {
  loginPopupOverlay.style.display = 'none';
});

// Fechar popup clicando fora dele
loginPopupOverlay.addEventListener('click', (e) => {
  if (e.target === loginPopupOverlay) {
    loginPopupOverlay.style.display = 'none';
  }
});

// Pega os elementos


// Abre o popup de cadastro e fecha o login
doRegisterBtn.addEventListener('click', () => {
  loginPopup.style.display = 'none';
  registerPopup.style.display = 'flex';
});

// Fecha o popup de login
closeLoginBtn.addEventListener('click', () => {
  loginPopup.style.display = 'none';
});

// Fecha o popup de cadastro
closeRegisterBtn.addEventListener('click', () => {
  registerPopup.style.display = 'none';
});

// Volta pro popup de login
backToLoginBtn.addEventListener('click', () => {
  registerPopup.style.display = 'none';
  loginPopup.style.display = 'flex';
});



    // Função para exibir notificações
    function showNotification(message, type = 'info', duration = 5000) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-icon">
          ${type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' :
          type === 'error' ? '<i class="fas fa-times-circle"></i>' :
            type === 'success' ? '<i class="fas fa-check-circle"></i>' :
              '<i class="fas fa-info-circle"></i>'}
        </div>
        <div class="notification-content">
          <div class="notification-title">
            ${type === 'warning' ? 'Aviso' :
          type === 'error' ? 'Erro' :
            type === 'success' ? 'Sucesso' :
              'Informação'}
          </div>
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      `;

      notificationContainer.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('show');
      }, 100);

      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.remove();
        }, 300);
      });

      if (duration > 0) {
        setTimeout(() => {
          if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
              notification.remove();
            }, 300);
          }
        }, duration);
      }

      return notification;
    }

    // Buscar estados da API do IBGE
    async function fetchStates() {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const states = await response.json();
        return states
          .map(state => ({ id: state.id, sigla: state.sigla, nome: state.nome }))
          .sort((a, b) => a.nome.localeCompare(b.nome));
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
        showNotification('Não foi possível carregar os estados. Tente novamente.', 'error');
        return [];
      }
    }

    // Buscar cidades da API do IBGE
   async function fetchCities(event) {
  // Obtenha o valor do estado selecionado
  const uf = event.target.value; // ← Use event.target.value
  citySelect.disabled = true;
  
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const list = await res.json();
    citySelect.innerHTML = `<option disabled selected>Selecione sua cidade</option>` +
      list.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    citySelect.disabled = false;
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
    notify('Erro ao carregar cidades', 'error');
  }
}

    // Buscar informações agrícolas da IA
    async function fetchAgriculturalInfo(city, stateName, crop = null, weather = null, soil = null) {
  const loadingIndicator = document.getElementById('recommendationResult');
  loadingIndicator.innerHTML = `
    <div class="loader">
    recomendações com IA...
    </div>
  `;

  try {
    // Monta o prompt dinâmico com clima e solo
    let prompt = `Local: ${city}, ${stateName}, Brasil.\n`;
    if (weather) {
      prompt += `Condições climáticas atuais: temperatura ${weather.tempNow}°C (mín ${weather.tempMin}°C, máx ${weather.tempMax}°C), umidade do ar ${weather.humidityAir}%, vento ${weather.windSpeed} km/h (${weather.windDir}), chuva ${weather.rain}mm.\n`;
    }
    if (soil) {
      prompt += `Condições do solo: pH ${soil.soilPH}, umidade ${soil.soilMoisture}, nitrogênio ${soil.soilN}, matéria orgânica ${soil.orgC}, textura ${soil.textureDisplay}, drenagem ${soil.drainage}.\n`;
    }
   if (crop) {
  prompt += `Responda em HTML, usando <ul class="recommend-boxes"><li>...</li></ul> com até 4 tópicos curtos, frases simples e emojis agrícolas. Dê dicas práticas de plantio, solo, época e manejo para cultivar ${crop} nessas condições.`;
} else {
  prompt += `Responda em HTML, usando <ul class="recommend-boxes"><li>...</li></ul> listando de 3 a 5 culturas recomendadas para plantar nessas condições (cada uma em uma linha com emoji). Depois, dê dicas gerais em até 2 frases curtas, também em <ul class="recommend-boxes"><li>...</li></ul> e com emoji.`;
}

    // Chama a IA (usando a mesma função do chatbot)
    const iaResponse = await getChatbotResponse(prompt);

    // Retorna a resposta da IA (pode conter HTML)
    return iaResponse;
  } catch (error) {
    console.error('Erro ao buscar informações agrícolas:', error);
    return `<p>Não foi possível gerar recomendações no momento. Por favor, tente novamente mais tarde.</p>`;
  }
}
    

    // Popular estados no dropdown
    async function populateStates() {
      const states = await fetchStates();
      stateSelect.innerHTML = '<option value="" disabled selected>Selecione seu estado</option>';

      states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.sigla;
        option.textContent = state.nome;
        stateSelect.appendChild(option);
      });
    }

    // Popular cidades no dropdown
    async function populateCities() {
      const selectedStateOption = stateSelect.options[stateSelect.selectedIndex];
      if (!selectedStateOption.value) return;

      citySelect.innerHTML = '<option value="" disabled selected>Carregando cidades...</option>';
      citySelect.disabled = true;

      const stateName = selectedStateOption.textContent;
      const states = await fetchStates();
      const state = states.find(s => s.nome === stateName);

      if (!state) return;

      const cities = await fetchCities(state.id);

      citySelect.innerHTML = '<option value="" disabled selected>Selecione sua cidade</option>';
      citySelect.disabled = false;

      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.nome; // Agora o value é o nome da cidade
        option.textContent = city.nome;
        citySelect.appendChild(option);
      });
    }
citySelect.addEventListener('change', async () => {
  const city = citySelect.value;
  const state = stateSelect.value;
  if (!city || !state) return;

  const mapPlaceholder = document.getElementById('mapPlaceholder');
  const cityMap = document.getElementById('cityMap');

  // Busca as coordenadas
  const coords = await getCoordinatesForCity(city, state);

  if (coords && coords.lat && coords.lon) {
    // Monta o link do OpenStreetMap
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon-0.1}%2C${coords.lat-0.1}%2C${coords.lon+0.1}%2C${coords.lat+0.1}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;
    cityMap.src = mapUrl;
    cityMap.style.display = 'block';
    mapPlaceholder.style.display = 'none';
  } else {
    cityMap.style.display = 'none';
    mapPlaceholder.style.display = 'flex';
    mapPlaceholder.innerHTML = `<i class="fas fa-map-marked-alt"></i><p>Não foi possível localizar a cidade no mapa.</p>`;
  }
});



    // Obter coordenadas geográficas - API alternativa mais confiável
    async function getCoordinatesForCity(city, state) {
      // Tentar API Nominatim do OpenStreetMap (mais confiável)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', ' + state + ', Brasil')}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
      } catch (error) {
        console.error('Erro na API Nominatim:', error);
      }
      
      // Fallback: Tentar API alternativa do Open-Meteo
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          return {
            lat: data.results[0].latitude,
            lon: data.results[0].longitude
          };
        }
      } catch (error) {
        console.error('Erro na API Open-Meteo:', error);
      }
      
      // Último fallback: coordenadas padrão baseadas no estado
      return getFallbackCoordinates(state);
    }

    // Coordenadas de fallback
    

    // Buscar dados meteorológicos REAIS
    async function fetchRealWeatherData(lat, lon) {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Verificar se os dados necessários estão presentes
        if (!data.current || !data.daily) {
          throw new Error('Dados incompletos da API');
        }

        return {
          tempNow: data.current.temperature_2m,
          tempMin: data.daily.temperature_2m_min[0],
          tempMax: data.daily.temperature_2m_max[0],
          humidityAir: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDir: convertWindDirection(data.current.wind_direction_10m),
          conditions: getWeatherCondition(data.current.precipitation),
          rain: data.daily.precipitation_sum[0],
          success: true
        };
      } catch (error) {
        console.error('Erro ao buscar dados meteorológicos:', error);
        console.log('Usando dados simulados como fallback');
        return fetchSimulatedWeatherData();
      }
    }

    // Converter direção do vento em pontos cardeais
    function convertWindDirection(degrees) {
      const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
      const index = Math.round(degrees / 45) % 8;
      return directions[index];
    }

    // Determinar condição climática
    function getWeatherCondition(precipitation) {
      if (precipitation > 5) return 'Chuva forte';
      if (precipitation > 0.5) return 'Chuva leve';
      return 'Céu limpo';
    }

    // Dados meteorológicos simulados (fallback)
    

    // Buscar dados REAIS do solo - SoilGrids API
   

    // Buscar umidade do solo - Open-Meteo API
    /*async function fetchSoilMoisture(lat, lon) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_0_1cm&timezone=UTC`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const moistureArray = data.hourly.soil_moisture_0_1cm;
        const times = data.hourly.time;

        // Encontrar o último valor disponível
        let lastIndex = moistureArray.length - 1;
        while (lastIndex >= 0 && moistureArray[lastIndex] === null) {
          lastIndex--;
        }

        if (lastIndex < 0) {
          throw new Error('Nenhum dado de umidade disponível');
        }

        // Converter m³/m³ para porcentagem e formatar
        const moisturePercent = (moistureArray[lastIndex] * 100).toFixed(1) + '%';
        return moisturePercent;
      } catch (error) {
        console.error('Erro ao buscar umidade do solo:', error);
        throw error;
      }
    }*/

 async function updateAgriculturalCalendar(state) {
  const calendarBox = document.getElementById('calendarInfo');
  const city = citySelect.options[citySelect.selectedIndex]?.textContent || '';
  const stateName = stateSelect.options[stateSelect.selectedIndex]?.textContent || state;

  calendarBox.innerHTML = `<div class="loader">Gerando calendário agrícola...</div>`;

  // Prompt personalizado para a IA
  const prompt = `Monte um calendário agrícola para ${city}, ${stateName}, Brasil.
Considere as condições climáticas e agrícolas típicas dessa cidade.
Responda SOMENTE com um array JSON de 12 objetos, um para cada mês (jan a dez), cada um com as propriedades: "plantio", "crescimento", "colheita", "manutencao" (cada uma deve ser uma string curta, mesmo se não houver atividade, use ""). NÃO escreva nada além do JSON. Exemplo de resposta: [{"plantio": "Milho, Feijão", "crescimento": "Regar", "colheita": "", "manutencao": "Adubar"}, ...]`;

  let iaResponse = '';
  let calendarData = null;

  try {
    iaResponse = await getChatbotResponse(prompt);
    // Tenta extrair apenas o JSON da resposta
    let jsonMatch = iaResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0].replace(/'/g, '"');
      try {
        calendarData = JSON.parse(jsonStr);
      } catch (err) {
        console.error('Erro ao fazer parse do JSON:', err, jsonStr);
        calendarData = null;
      }
    }
  } catch (e) {
    console.error('Erro geral ao processar calendário:', e);
    calendarData = null;
  }

  // Nomes dos meses
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (calendarData && Array.isArray(calendarData)) {
    let gridHtml = '';
    calendarData.forEach((mes, idx) => {
      const plantio = Array.isArray(mes.plantio) ? mes.plantio.join(', ') : (mes.plantio || '');
      const crescimento = Array.isArray(mes.crescimento) ? mes.crescimento.join(', ') : (mes.crescimento || '');
      const colheita = Array.isArray(mes.colheita) ? mes.colheita.join(', ') : (mes.colheita || '');
      const manutencao = Array.isArray(mes.manutencao) ? mes.manutencao.join(', ') : (mes.manutencao || '');

      gridHtml += `
        <div class="calendar-month">
          <h4>${meses[idx]}</h4>
          ${plantio ? `<p><strong>Plantio:</strong> ${plantio}</p>` : ''}
          ${crescimento ? `<p><strong>Crescimento:</strong> ${crescimento}</p>` : ''}
          ${colheita ? `<p><strong>Colheita:</strong> ${colheita}</p>` : ''}
          ${manutencao ? `<p><strong>Manutenção:</strong> ${manutencao}</p>` : ''}
          ${!plantio && !crescimento && !colheita && !manutencao ? `<p>Sem atividades principais</p>` : ''}
        </div>
      `;
    });

    calendarBox.innerHTML = `
      <div class="calendar-grid">${gridHtml}</div>
    `;

    const emptyCalendar = document.getElementById('emptyCalendar');
    if (emptyCalendar) emptyCalendar.style.display = 'none';
  } else {
    // Fallback: mostra a resposta da IA (mesmo que seja texto ou HTML)
    calendarBox.innerHTML = `
      <div class="agricultural-info">
        ${iaResponse && typeof iaResponse === 'string'
          ? iaResponse
          : 'Não foi possível gerar um calendário agrícola detalhado para a sua região. Tente novamente ou refine sua localização.'}
      </div>
    `;
  }
}


    

    // Determinar tipo de solo
    function getSoilType(texture) {
      if (!texture) return 'Não disponível';

      // Extrair valores numéricos das porcentagens
      const sand = parseFloat(texture.sand);
      const silt = parseFloat(texture.silt);
      const clay = parseFloat(texture.clay);

      // Classificação baseada no triângulo de texturas do solo
      if (clay > 40) return 'Argiloso';
      if (sand > 70 && clay < 15) return 'Arenoso';
      if (silt > 80) return 'Siltoso';
      if (clay >= 27 && clay <= 40 && sand <= 20) return 'Franco-argiloso';
      if (clay >= 20 && clay <= 35 && silt >= 30 && sand <= 45) return 'Franco-argilo-siltoso';
      if (sand >= 45 && clay >= 20 && sand <= 65) return 'Franco-argilo-arenoso';

      return 'Franco';
    }

    // Determinar drenagem do solo
    function getDrainageFromTexture(texture) {
      if (!texture) return "";

      const sand = parseFloat(texture.sand);
      const clay = parseFloat(texture.clay);

      if (sand > 70) return "";
      if (clay > 50) return "";
      return "";
    }

    // Dados simulados do solo (fallback)
    function fetchSimulatedSoilData() {
      //const simulatedPH = (5.5 + Math.random() * 2.5).toFixed(2);
      const simulatedPH = "";
      const simulatedMoisture = "";
      const simulatedN = "";
      const simulatedP = "";
      const simulatedK = "";
      const simulatedOrgC = "";
      const textures = "";
      const simulatedTexture = "";
      const simulatedTextureDisplay = "";
      return {
        soilPH: simulatedPH,
        soilMoisture: simulatedMoisture,
        soilType: simulatedTexture,
        soilN: simulatedN,
        soilP: simulatedP,
        soilK: simulatedK,
        orgC: simulatedOrgC,
        textureDisplay: simulatedTextureDisplay,
        drainage: getDrainageFromTexture({
    
        }),
        success: false
      };
    }

    // Atualizar interface com dados
    async function updateUI(weather, soil, city, state) {
      // Atualizar dados meteorológicos
      document.getElementById('temp-now').textContent = `${weather.tempNow}°C`;
      document.getElementById('temp-minmax').textContent = `${weather.tempMin}°C / ${weather.tempMax}°C`;
      document.getElementById('humidity-air-w').textContent = `${weather.humidityAir}%`;
      document.getElementById('wind-speed').textContent = `${weather.windSpeed} km/h`;
      document.getElementById('wind-dir').textContent = weather.windDir;
      document.getElementById('rain-chance').textContent = weather.rain > 0 ? `${weather.rain}mm` : 'Não';

      // Atualizar dados do solo
      document.getElementById('soil-ph').textContent = soil.soilPH || '-';
      document.getElementById('soil-n').textContent = soil.soilN || '-';
      document.getElementById('soil-p').textContent = soil.soilP || '-';
      document.getElementById('soil-k').textContent = soil.soilK || '-';

      // Atualizar status do solo
      if (soil.success) {
        updateSoilStatus(soil);
      } else {
        document.getElementById('soil-ph-status').textContent = '-';
        document.getElementById('soil-ph-status').className = "";
        document.getElementById('soil-moisture-status').textContent = '-';
        document.getElementById('soil-moisture-status').className = "";
      }

      // Atualizar calendário agrícola
      updateAgriculturalCalendar(state);

      // Notificação de sucesso
      const source = soil.success ? "dados reais" : "dados reais";
      const stateName = stateSelect.options[stateSelect.selectedIndex].textContent;
      showNotification(`Dados analisados com sucesso para ${city}, ${stateName} (${source})`, 'success');
    }

    // Atualizar status do solo com cores
    function updateSoilStatus(soil) {
      const phStatus = document.getElementById('soil-ph-status');
      const moistureStatus = document.getElementById('soil-moisture-status');

      if (soil.soilPH) {
        const phValue = parseFloat(soil.soilPH);
        if (phValue < 5.5) {
          phStatus.textContent = "Ácido";
          phStatus.className = "status-danger";
          showNotification('O pH do solo está muito baixo (ácido). Recomenda-se aplicar calcário.', 'warning');
        } else if (phValue > 7.0) {
          phStatus.textContent = "Alcalino";
          phStatus.className = "status-warning";
          showNotification('O pH do solo está muito alto (alcalino). Recomenda-se aplicar enxofre.', 'warning');
        } else {
          phStatus.textContent = "Ideal";
          phStatus.className = "status-ok";
        }
      } else {
        phStatus.textContent = "-";
        phStatus.className = "";
      }

      if (soil.soilMoisture) {
        const moistureValue = parseFloat(soil.soilMoisture);
        if (moistureValue < 30) {
          moistureStatus.textContent = "Seco";
          moistureStatus.className = "status-danger";
          showNotification('Umidade do solo muito baixa. Recomenda-se irrigação urgente.', 'warning');
        } else if (moistureValue > 70) {
          moistureStatus.textContent = "Encharcado";
          moistureStatus.className = "status-warning";
          showNotification('Solo encharcado. Reduza a irrigação para evitar problemas nas raízes.', 'warning');
        } else {
          moistureStatus.textContent = "Ideal";
          moistureStatus.className = "status-ok";
        }
      } else {
        moistureStatus.textContent = "-";
        moistureStatus.className = "";
      }
    }

    
    // Atualizar resultado da recomendação
    function updateRecommendationResult(city, state, content) {
      const resultBox = document.getElementById('recommendationResult');
      resultBox.innerHTML = `
        <h3><i class="fas fa-map-marker-alt"></i> Recomendações para ${city}, ${state}</h3>
        <div class="agricultural-info">${content}</div>`;
      if (emptyRecommendation) {
        emptyRecommendation.style.display = 'none';
      }
    }

    // Mostrar detalhes da cultura
    async function showCropDetails(cropName) {
  // Mapeamento de ícones para cada cultura
  const cropIcons = {
    tomate: 'fas fa-apple-alt',
    milho: 'fas fa-corn',
    soja: 'fas fa-seedling',
    alface: 'fas fa-leaf',
    feijao: 'fas fa-seedling',
    cenoura: 'fas fa-carrot'
  };

  // Usa o ícone correspondente ou um padrão
  const iconClass = cropIcons[cropName] || 'fas fa-seedling';
  
  // Atualiza o título do modal com o ícone
  modalTitle.innerHTML = `<i class="${iconClass}"></i> Detalhes sobre ${cropName}`;
  
  modalContent.innerHTML = '<div class="loader">Carregando informações...</div>';
  modal.style.display = 'block';

  try {
    const state = stateSelect.value;
    const city = citySelect.options[citySelect.selectedIndex].textContent;
    const info = await fetchAgriculturalInfo(city, state, cropName);
    modalContent.innerHTML = info;
  } catch (error) {
    console.error('Erro:', error);
    modalContent.innerHTML = '<p>Não foi possível carregar as informações. Tente novamente.</p>';
  }
}

    // Alternar modo escuro
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      showNotification(`Modo ${isDarkMode ? 'escuro' : 'claro'} ativado`, 'info', 2000);
    }



    // Configurar tooltips
    function setupSparklineTooltips() {
      const sparklineContainers = document.querySelectorAll('.sparkline');

      sparklineContainers.forEach(container => {
        const points = container.querySelectorAll('.sparkline-point');
        const tooltip = container.querySelector('.sparkline-tooltip');

        points.forEach(point => {
          point.addEventListener('mouseenter', (e) => {
            const value = point.getAttribute('data-value');
            const time = point.getAttribute('data-time');
            const rect = point.getBoundingClientRect();

            tooltip.textContent = `${time}: ${value}`;
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.top - 30}px`;
            tooltip.style.opacity = '1';
          });

          point.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
          });
        });
      });
    }

    // Enviar formulário (modificado com SOLUÇÃO 1 e 2)
    dataForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const state = stateSelect.value;
  const city = citySelect.value; // Use o value, não o textContent
  const stateName = stateSelect.options[stateSelect.selectedIndex].textContent;

  // Verifica se cidade está selecionada de verdade
  if (
    !state ||
    !city ||
    city === "" ||
    city === "Selecione primeiro o estado" ||
    city === "Selecione sua cidade"
  ) {
    showNotification('Por favor, selecione um estado e uma cidade', 'warning');
    return;
  }

  analyzeBtn.disabled = true;
  analyzeIcon.className = 'fas fa-spinner loading';
  analyzeBtn.innerHTML = `<i class="fas fa-spinner loading"></i> Analisando`;

  

  try {
    const coords = await getCoordinatesForCity(city, state);
    const weather = await fetchRealWeatherData(coords.lat, coords.lon);

    // SOLUÇÃO 1: Substituição do bloco inline por fetchSoilData
    let soil;
    try {
      soil = await fetchSoilData(coords.lat, coords.lon);
    } catch (soilError) {
      console.error('Erro ao buscar dados do solo:', soilError);
      // SOLUÇÃO 2: Usar dados simulados se a API falhar
      soil = fetchSimulatedSoilData();
      soil.success = false;
    }

    await updateUI(weather, soil, city, stateName);

    const recommendations = await fetchAgriculturalInfo(city, stateName, null, weather, soil);
    updateRecommendationResult(city, stateName, recommendations);

// --- habilitar botão PDF somente 10s depois que a análise terminar com sucesso ---
if (typeof pdfBtn !== 'undefined' && pdfBtn) {
  // garante que comece escondido/indisponível
  pdfBtn.style.display = 'none';
  pdfBtn.disabled = true;
  pdfBtn.title = 'Disponível em 10s';

  // Limpa timer anterior, se houver
  if (window.__pdfEnableTimer) clearTimeout(window.__pdfEnableTimer);

  // Aguarda 10 segundos e habilita o botão
  window.__pdfEnableTimer = setTimeout(() => {
    pdfBtn.style.display = 'inline-block'; // mostra o botão
    pdfBtn.disabled = false;               // habilita clique
    pdfBtn.title = 'Gerar PDF';

    if (typeof showNotification === 'function') {
      showNotification('Botão "PDF" habilitado — agora você pode baixar o PDF.', 'success', 3500);
    }
  }, 10000);
}






  } catch (error) {
    console.error('Erro:', error);
    showNotification(`Erro ao processar sua solicitação: ${error.message}`, 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeIcon.className = 'fas fa-search';
    analyzeBtn.innerHTML = `<i class="fas fa-search"></i> Analisar Condições`;
  }
});
recommendBtn.addEventListener('click', async () => {
  const selectedCrop = cropSelect.value;
  const state = stateSelect.value;
  const city = citySelect.options[citySelect.selectedIndex].textContent;

  // Primeiro: verifica se selecionou a planta
  if (!selectedCrop) {
    showNotification('Por favor, selecione uma planta', 'warning');
    return;
  }
  // Depois: verifica se selecionou estado e cidade
  if (!state || !city || city === "" || city === "Selecione primeiro o estado" || city === "Selecione sua cidade") {
    showNotification('Por favor, selecione um estado e uma cidade', 'warning');
    return;
  }

  try {
    const cropName = cropSelect.options[cropSelect.selectedIndex].text;
    showCropDetails(cropName);
  } catch (error) {
    console.error('Erro:', error);
    showNotification(`Erro ao gerar recomendações: ${error.message}`, 'error');
  }
});

    // SOLUÇÃO 3: Implementação do chatbot com OpenAI
    async function getChatbotResponse(userMessage) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: userMessage }
        ]
      })
    });
    const data = await response.json();
    if (data.message) return data.message;
    throw new Error(data.error || 'Erro desconhecido');
  } catch (error) {
    console.error('Erro ao chamar o backend:', error);
    showNotification('Erro no assistente. Tentando resposta alternativa...', 'error');

    // Resposta alternativa em caso de falha
    const responses = {
      "oi": "Não foi possível gerar uma recomendação de plantio detalhada para a sua região. Tente novamente ou refine sua localização.",
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    return responses.default;
  }
}

    // Configurar reconhecimento de voz
    function setupVoiceRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        micButton.style.display = 'none';
        showNotification('Seu navegador não suporta reconhecimento de voz', 'warning');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      micButton.addEventListener('click', () => {
        if (micButton.classList.contains('listening')) {
          recognition.stop();
          micButton.classList.remove('listening');
        } else {
          recognition.start();
          micButton.classList.add('listening');
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        micButton.classList.remove('listening');
        if (transcript.trim()) {
          sendChatMessage();
        }
      };

      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        micButton.classList.remove('listening');
        showNotification('Erro no microfone: ' + event.error, 'error');
      };
    }

    

    // Enviar mensagem no chat
    async function sendChatMessage() {
      const message = chatInput.value.trim();
      if (!message) return;

      addChatMessage(message, 'user');
      chatInput.value = '';

      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'message bot-message';
      typingIndicator.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
      chatBody.appendChild(typingIndicator);
      chatBody.scrollTop = chatBody.scrollHeight;

      try {
        const botResponse = await getChatbotResponse(message);
        chatBody.removeChild(typingIndicator);
        addChatMessage(botResponse, 'bot');
        speakText(botResponse); // <-- Adicione esta linha aqui
      } catch (error) {
        chatBody.removeChild(typingIndicator);
        addChatMessage("Houve um erro ao processar sua mensagem. Tente novamente.", 'bot');
      }
    }

    function speakText(text) {
      if (!('speechSynthesis' in window)) {
        console.log('speechSynthesis não suportado');
        return;
      }
      window.speechSynthesis.cancel();

      // Remove tags HTML para a fala
      const plainText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'pt-BR';

      // Função para selecionar a voz pt-BR
      function setVoiceAndSpeak() {
        const voices = window.speechSynthesis.getVoices();
        const brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
        if (brVoice) utterance.voice = brVoice;
        window.speechSynthesis.speak(utterance);
      }

      // Se as vozes ainda não carregaram, aguarde o evento
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = function handler() {
          setVoiceAndSpeak();
          // Remove o handler para evitar múltiplas execuções
          window.speechSynthesis.onvoiceschanged = null;
        };
        // Força o carregamento das vozes
        window.speechSynthesis.getVoices();
      } else {
        setVoiceAndSpeak();
      }
    }

    // Adicionar mensagem ao chat
    function addChatMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
      if (sender === 'bot') {
        messageDiv.innerHTML = text; // Permite HTML para o bot
      } else {
        messageDiv.textContent = text;
      }
      chatBody.appendChild(messageDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Toggle do chat
    chatToggle.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
    });

    closeChat.addEventListener('click', () => {
      chatWindow.classList.remove('active');
    });

    // Fechar modal
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    setupVoiceRecognition();

// Mostrar popup de login
loginButton.addEventListener('click', () => {
  loginPopupOverlay.style.display = 'flex';
  loginMsg.textContent = '';
  loginMsg.style.color = '#e74c3c';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
});

// Fechar popup de login
closeLoginPopup.addEventListener('click', () => {
  loginPopupOverlay.style.display = 'none';
});

// Fechar popup clicando fora dele
loginPopupOverlay.addEventListener('click', (e) => {
  if (e.target === loginPopupOverlay) {
    loginPopupOverlay.style.display = 'none';
  }
});






// fetchSoilGrids (exemplo com timeout maior)
/*async function fetchSoilGrids(lat, lon) {
  const baseUrl = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
  const params = `?lon=${encodeURIComponent(lon)}&lat=${encodeURIComponent(lat)}&property=phh2o&property=ocd&property=nitrogen&property=sand&property=silt&property=clay&depth=0-5cm`;
  const url = baseUrl + params;

  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    const controller = new AbortController();
    const timeoutMs = 20000; // Aumentei para 20s
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`Solicitando SoilGrids (${attempt}/${maxAttempts}) ->`, url);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        if ([502, 503, 504].includes(res.status) && attempt < maxAttempts) {
          console.warn(`SoilGrids respondeu ${res.status}. Retentando...`);
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt-1)));
          continue;
        }
        throw new Error(`SoilGrids error ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const getMean = (prop) => {
        const v = data.properties?.[prop]?.layers?.[0]?.values?.mean;
        return v !== undefined && v !== null ? Number(v) : null;
      };

      return {
        ph: getMean('phh2o'),
        nitrogen: getMean('nitrogen'),
        organicC: getMean('ocd'),
        texture: {
          sand: getMean('sand'),
          silt: getMean('silt'),
          clay: getMean('clay')
        }
      };
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.warn(`SoilGrids request aborted (timeout). Tentativa ${attempt}/${maxAttempts}.`);
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt-1)));
          continue;
        }
        return null;
      }
      console.warn('Erro ao acessar SoilGrids:', err.message || err);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt-1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

// Exemplo do chamador que trata null (fetchSoilData)
async function fetchSoilData(lat, lon) {
  try {
    const soilGridsData = await fetchSoilGrids(lat, lon);

    if (!soilGridsData) {
      console.warn('SoilGrids indisponível — usando fallback simulado.');
      if (typeof fetchSimulatedSoilData === 'function') {
        const simulated = await fetchSimulatedSoilData(lat, lon);
        // preencher UI com simulated (verifique ids/inputs do seu HTML)
        // ex:
        // document.getElementById('phInput').value = simulated.ph ?? 'N/A';
        return simulated;
      } else {
        return {
          ph: null,
          nitrogen: null,
          organicC: null,
          texture: { sand: null, silt: null, clay: null },
          __source: 'fallback'
        };
      }
    }

    // uso normal quando temos dados reais
    // ex.: document.getElementById('phInput').value = soilGridsData.ph ?? 'N/A';
    return soilGridsData;
  } catch (e) {
    console.error('Erro ao buscar dados do solo:', e);
    // fallback final
    if (typeof fetchSimulatedSoilData === 'function') {
      return await fetchSimulatedSoilData(lat, lon);
    }
    return null;
  }
}































// Alternar modo escuro
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

// Restaurar preferência de modo ao carregar
window.addEventListener('DOMContentLoaded', () => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
  }
});



    function speakText(text) {
      if (!('speechSynthesis' in window)) {
        console.log('speechSynthesis não suportado');
        return;
      }
      window.speechSynthesis.cancel();

      // Remove tags HTML para a fala
      const plainText = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = 'pt-BR';

      // Função para selecionar a voz pt-BR
      function setVoiceAndSpeak() {
        const voices = window.speechSynthesis.getVoices();
        const brVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
        if (brVoice) utterance.voice = brVoice;
        window.speechSynthesis.speak(utterance);
      }

      // Se as vozes ainda não carregaram, aguarde o evento
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = function handler() {
          setVoiceAndSpeak();
          // Remove o handler para evitar múltiplas execuções
          window.speechSynthesis.onvoiceschanged = null;
        };
        // Força o carregamento das vozes
        window.speechSynthesis.getVoices();
      } else {
        setVoiceAndSpeak();
      }
    }
   



document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activateBot');
  const robotWrapper = document.getElementById('robotPopupWrapper');
  const closeBtn = document.getElementById('closeRobotPopup'); // botão de fechar (adicione no HTML)

  if (!activateBtn || !robotWrapper) return;

  // estado inicial (garante que comece escondido)
  robotWrapper.style.display = robotWrapper.style.display || 'none';
  robotWrapper.style.opacity = robotWrapper.style.opacity || '0';
  robotWrapper.style.transform = robotWrapper.style.transform || 'translateY(8px)';
  robotWrapper.setAttribute('aria-hidden', 'true');

  // abrir — **sempre abre** e não fecha ao clicar novamente
  activateBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // evita que o clique "vaze" e acione handlers externos
    // se já estiver aberto, sai
    if (robotWrapper.dataset.open === 'true') return;

    robotWrapper.style.display = 'block';
    requestAnimationFrame(() => {
      robotWrapper.style.opacity = '1';
      robotWrapper.style.transform = 'translateY(0)';
      robotWrapper.setAttribute('aria-hidden', 'false');
      robotWrapper.dataset.open = 'true';
    });
  });

  // função de fechar (chamada só pelo botão X ou ESC)
  function closeRobot() {
    robotWrapper.style.opacity = '0';
    robotWrapper.style.transform = 'translateY(8px)';
    robotWrapper.setAttribute('aria-hidden', 'true');
    delete robotWrapper.dataset.open;
    setTimeout(() => { robotWrapper.style.display = 'none'; }, 180);
  }

  // botão fechar (adicione <button id="closeRobotPopup">X</button> dentro do robotWrapper)
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRobot();
    });
  }

  // fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && robotWrapper.dataset.open === 'true') closeRobot();
  });

  // evita que cliques dentro do popup fechem algo por handlers externos
  robotWrapper.addEventListener('click', (e) => e.stopPropagation());
});


const btnTopo = document.getElementById("btnTopo");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btnTopo.classList.add("show");
  } else {
    btnTopo.classList.remove("show");
  }
});

btnTopo.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});



// Scroll spy simples para ativar link conforme a seção visível
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".anchor-nav a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});


































/* Histórico — comportamento: fechado = só header; aberto = mostra métricas (layout igual à imagem) */

const historyButton = document.getElementById("historyButton");
const historyPopup = document.getElementById("historyPopupOverlay") || document.getElementById("historyPopup");
const closeHistoryPopup = document.getElementById("closeHistoryPopup");
const historyContent = document.getElementById("historyContent");
const historyFooterText = document.getElementById("historyFooterText");

let expandedDay = null;

function generateDayHTML(dia) {
  return `
    <div class="day-item" data-day-id="${dia.id}">
      <div class="day-header" data-day-id="${dia.id}">
        <div class="day-info">
          <h2>${dia.label}</h2>
          <p>${dia.date}</p>
        </div>
        <i class="fas fa-chevron-down chevron" aria-hidden="true"></i>
      </div>

      <div class="metrics-content" id="metrics-${dia.id}">
        <div class="metrics-grid" id="metrics-grid-${dia.id}"></div>
      </div>
    </div>
  `;
}


function renderHistorico(historicoData) {
  historyContent.innerHTML = historicoData.map(d => generateDayHTML(d)).join('');
  historyFooterText.textContent = `${historicoData.length} registros encontrados`;

  historicoData.forEach(dia => {
    const gridEl = document.getElementById(`metrics-grid-${dia.id}`);
    if (!gridEl) return;

    const cols = [[],[],[]];
    dia.metricas.forEach((m, i) => { cols[i % 3].push(m); });

    const colsHTML = cols.map(col => {
      return `<div class="metrics-column">${col.map(metrica => `
        <div class="metric-row">
          <div class="metric-icon-box"><i class="${metrica.icon}" aria-hidden="true"></i></div>
          <div style="flex:1;min-width:0">
            <p class="metric-label">${metrica.tipo}</p>
            <p class="metric-value">${metrica.valor}</p>
          </div>
        </div>
      `).join('')}</div>`;
    }).join('');

    gridEl.innerHTML = colsHTML;

    const metricsContent = document.getElementById(`metrics-${dia.id}`);
    if (metricsContent) metricsContent.style.display = 'none';
  });

  document.querySelectorAll('#historyContent .chevron').forEach(c => c.style.transform = 'rotate(0deg)');
  expandedDay = null;
}

function toggleDayById(dayId) {
  const previous = expandedDay;
  expandedDay = (expandedDay === dayId) ? null : dayId;

  if (previous && previous !== dayId) {
    const prevMetrics = document.getElementById(`metrics-${previous}`);
    const prevHeader = document.querySelector(`[data-day-id="${previous}"].day-header`);
    if (prevMetrics) prevMetrics.style.display = 'none';
    if (prevHeader) prevHeader.classList.remove('open');
    const prevChevron = prevHeader && prevHeader.querySelector('.chevron');
    if (prevChevron) prevChevron.style.transform = 'rotate(0deg)';
  }

  const metrics = document.getElementById(`metrics-${dayId}`);
  const header = document.querySelector(`[data-day-id="${dayId}"].day-header`);
  const chevron = header && header.querySelector('.chevron');
  if (!metrics || !header) return;

  if (expandedDay === dayId) {
    metrics.style.display = 'block';
    header.classList.add('open');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    metrics.style.display = 'none';
    header.classList.remove('open');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  }
}

if (historyContent) {
  historyContent.addEventListener('click', (ev) => {
    const header = ev.target.closest('.day-header');
    if (!header) return;
    const dayId = header.getAttribute('data-day-id');
    if (!dayId) return;
    toggleDayById(dayId);
  });
}

if (historyButton && historyPopup && historyContent && historyFooterText) {
  historyButton.addEventListener("click", async () => {
    historyPopup.style.display = "flex";
    historyContent.innerHTML = `<div style="padding:32px 24px;text-align:center;"><i class="fas fa-spinner fa-spin"></i> Carregando histórico...</div>`;
    historyFooterText.textContent = "";

    try {
      const usuarioId = localStorage.getItem("usuarioId");
      if (!usuarioId) throw new Error("Usuário não logado");

      const res = await fetch(`http://localhost:8080/backend/historico.php?usuarioId=${usuarioId}`);
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      let dados;
      try { dados = JSON.parse(text); } catch (e) { throw new Error("Resposta do backend não é JSON válido. Começa com: " + text.slice(0,120)); }

      const historicoData = dados.map((row, idx) => {
        const dateObj = new Date(row.medicao_em || row.data || Date.now());
        const diaLabel = (row.cidade && row.estado) ? `${row.cidade}/${row.estado}` : (row.localizacao || `Registro ${idx+1}`);
        const diaDate = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();

        const metricas = [
  { tipo: "Temp. Ar", valor: (row.temperatura_ar ?? row.temperaturaAr) ? `${row.temperatura_ar ?? row.temperaturaAr} °C` : "-", hora: diaDate, icon: "fas fa-temperature-high", class: "temperature" },
    { tipo: "Direção", valor: (row.direcao_vento ?? row.direcaoVento) ? String(row.direcao_vento ?? row.direcaoVento) : "-", hora: diaDate, icon: "fas fa-compass", class: "direction" },
    { tipo: "Precipitação", valor: (row.precipitacao ?? row.precipitacao) ? String(row.precipitacao ?? row.precipitacao) : "-", hora: diaDate, icon: "fas fa-cloud-rain", class: "rain" },
  { tipo: "Umidade Solo", valor: (row.umidade_solo ?? row.umidadeSolo) ? `${row.umidade_solo ?? row.umidadeSolo} %` : "-", hora: diaDate, icon: "fas fa-tint", class: "soil-humidity" },
  { tipo: "Umidade Ar", valor: (row.umidade_ar ?? row.umidadeAr) ? `${row.umidade_ar ?? row.umidadeAr} %` : "-", hora: diaDate, icon: "fas fa-tint", class: "humidity" },
    { tipo: "Vento", valor: (row.velocidade_vento ?? row.velocidadeVento) ? String(row.velocidade_vento ?? row.velocidadeVento) : "-", hora: diaDate, icon: "fas fa-wind", class: "wind" },
  { tipo: "Nitrogênio", valor: row.nitrogenio ?? row.nitrogenio ?? "-", hora: diaDate, icon: "fas fa-leaf", class: "nitrogen" },
  { tipo: "Fósforo", valor: row.fosforo ?? row.fosforo ?? "-", hora: diaDate, icon: "fas fa-seedling", class: "phosphorus" },
  { tipo: "Potássio", valor: row.potassio ?? row.potassio ?? "-", hora: diaDate, icon: "fas fa-apple-alt", class: "potassium" },
    { tipo: "pH Solo", valor: row.ph_solo ?? row.phSolo ?? "-", hora: diaDate, icon: "fas fa-flask", class: "ph" }
];

        return { id: idx + 1, label: diaLabel, date: diaDate, metricas };
      });

      renderHistorico(historicoData);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      historyContent.innerHTML = `<div style="padding:32px;text-align:center;color:#e74c3c;">Erro ao carregar histórico.<br>${err.message}</div>`;
      historyFooterText.textContent = "";
    }
  });

  if (closeHistoryPopup) {
    closeHistoryPopup.addEventListener("click", () => {
      historyPopup.style.display = "none";
      expandedDay = null;
      document.querySelectorAll('#historyContent .metrics-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('#historyContent .day-header').forEach(h => h.classList.remove('open'));
      document.querySelectorAll('#historyContent .chevron').forEach(c => c.style.transform = 'rotate(0deg)');
    });
  }

  historyPopup.addEventListener('click', (ev) => {
    if (ev.target === historyPopup) {
      historyPopup.style.display = 'none';
      expandedDay = null;
      document.querySelectorAll('#historyContent .metrics-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('#historyContent .day-header').forEach(h => h.classList.remove('open'));
      document.querySelectorAll('#historyContent .chevron').forEach(c => c.style.transform = 'rotate(0deg)');
    }
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && historyPopup.style.display === 'flex') {
      historyPopup.style.display = 'none';
      expandedDay = null;
      document.querySelectorAll('#historyContent .metrics-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('#historyContent .day-header').forEach(h => h.classList.remove('open'));
      document.querySelectorAll('#historyContent .chevron').forEach(c => c.style.transform = 'rotate(0deg)');
    }
  });

} else {
  console.warn("Elementos do histórico não encontrados. Verifique IDs: historyButton, historyPopupOverlay (ou historyPopup), historyContent, historyFooterText.");
}

window.__hist_toggle = toggleDayById;





// novo: elemento do botão PDF
const pdfBtn = document.getElementById('pdfBtn');

// monta um node com o conteúdo atual da pesquisa (cidade/estado + blocos importantes)
function collectSearchContent() {
  const stateName = stateSelect.options[stateSelect.selectedIndex]?.textContent || '';
  const cityName = citySelect.value || '';
  const header = `<div style="font-family: Arial, Helvetica, sans-serif; padding:10px;">
    <h1>Agrosense - Resultado de ${cityName} / ${stateName}</h1>
    <p><small>Gerado em: ${new Date().toLocaleString()}</small></p>
    <hr/>
  </div>`;

  // pega as seções visíveis mais relevantes - prefere clones para não quebrar a UI
  const previsaoHtml = document.getElementById('previsao')?.innerHTML || '';
  const calendarHtml = document.getElementById('calendarInfo')?.innerHTML || '';
  const recommendationHtml = document.getElementById('recommendationResult')?.innerHTML || '';

  const wrapper = document.createElement('div');
  wrapper.style.width = '1200px'; // boa largura para renderizar
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#222';
  wrapper.innerHTML = header +
    `<section><h2>Previsão</h2>${previsaoHtml}</section>
     <section><h2>Calendário Agrícola</h2>${calendarHtml}</section>
     <section><h2>Recomendações</h2>${recommendationHtml}</section>`;

  return { node: wrapper, cityName, stateName };
}


async function generatePdfAndDownload() {
  const { node, cityName, stateName } = collectSearchContent();

  // esconder node fora da tela (não perturbando a página)
  node.style.position = 'fixed';
  node.style.left = '-9999px';
  document.body.appendChild(node);

  try {
    // captura com html2canvas
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, logging:false });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // gerar PDF com jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const safeCity = (cityName || 'cidade').replace(/\s+/g, '_');
    const safeState = (stateName || 'estado').replace(/\s+/g, '_');

    pdf.save(`Agrosense_${safeCity}_${safeState}.pdf`); // inicia o download
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    if (typeof showNotification === 'function') showNotification('Erro ao gerar PDF', 'error');
    else alert('Erro ao gerar PDF');
  } finally {
    node.remove();
  }
}


pdfBtn.addEventListener('click', (e) => {
  e.preventDefault();
  generatePdfAndDownload();
});







// Disparar o login quando pressionar Enter
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault(); // evita submit automático
    doLoginBtn.click(); // simula o clique no botão "Entrar"
  }
});


// ...existing code...

// --- INTEGRAÇÃO MONITOR DE SOLO ---
// ...existing code...

// --- INTEGRAÇÃO MONITOR DE SOLO ---
// ...existing code...

// --- INTEGRAÇÃO MONITOR DE SOLO ---
// ...existing code...

// --- INTEGRAÇÃO MONITOR DE SOLO ---
const urlSolo = "http://192.168.1.11:5000/dados"; // Altere para o IP correto

async function atualizarMonitorSolo() {
  try {
    const resposta = await fetch(urlSolo);
    const dados = await resposta.json();
    if (!Array.isArray(dados) || dados.length === 0) return;

    // Pega o dado mais recente
    const d = dados[dados.length - 1];

    // --- CAMPOS DE UMIDADE ---
    // Umidade do ar
    document.getElementById('humidity').textContent =
      d.umid_ar !== undefined && d.umid_ar !== null ? `${d.umid_ar} %` : '-';
    // Umidade do solo
    document.getElementById('humidity-soil').textContent =
      d.umid_solo !== undefined && d.umid_solo !== null ? `${d.umid_solo} %` : '-';

    // --- CAMPOS DE TEMPERATURA ---
    // Temperatura do ar
    document.getElementById('temp-air').textContent =
      d.temp_ar !== undefined && d.temp_ar !== null ? `${d.temp_ar} °C` : '-';
    // Temperatura do solo
    document.getElementById('temp-soil').textContent =
      d.temp_solo !== undefined && d.temp_solo !== null ? `${d.temp_solo} °C` : '-';

    // --- DEMAIS CAMPOS (se quiser manter) ---
    document.getElementById('soil-ph').textContent = d.ph ?? '-';
    document.getElementById('soil-ph-status').textContent = d.ph
      ? (d.ph < 5.5 ? 'Ácido' : d.ph > 7.5 ? 'Alcalino' : 'Neutro')
      : '-';
document.getElementById('soil-cond').textContent = d.condutividade !== undefined && d.condutividade !== null ? `${d.condutividade}` : '-';

    document.getElementById('soil-n').textContent = d.n !== undefined && d.n !== null ? `${d.n} %` : '-';
    document.getElementById('soil-p').textContent = d.p !== undefined && d.p !== null ? `${d.p} %` : '-';
    document.getElementById('soil-k').textContent = d.k !== undefined && d.k !== null ? `${d.k} %` : '-';

  } catch (erro) {
    console.error("Erro ao buscar dados do solo:", erro);
  }
}

// ...existing code...

// Só executa ao clicar no botão "btnAnalise"
const btnAnalise = document.getElementById('btnAnalise');
let intervaloAtualizacao = null;

async function coletarDados() {
  const solo = {
    ph: document.getElementById('soil-ph')?.textContent.replace(',', '.') || "0",
    umidade: document.getElementById('humidity-soil')?.textContent.replace('%', '').replace(',', '.').trim() || "0",
    n: document.getElementById('soil-n')?.textContent.replace('%', '').replace(',', '.').trim() || "0",
    p: document.getElementById('soil-p')?.textContent.replace('%', '').replace(',', '.').trim() || "0",
    k: document.getElementById('soil-k')?.textContent.replace('%', '').replace(',', '.').trim() || "0"
  };

  const ar = {
    temp: document.getElementById('temp-air')?.textContent.replace('°C', '').replace(',', '.').trim() || "0",
    umidade: document.getElementById('humidity')?.textContent.replace('%', '').replace(',', '.').trim() || "0"
  };

  const cidade = document.getElementById('citySelect')?.value || "";
  const estado = document.getElementById('stateSelect')?.options[
    document.getElementById('stateSelect').selectedIndex
  ]?.text || "";
  const usuarioId = localStorage.getItem('usuarioId') || "0";

  const precipitacao = document.getElementById('rain-chance')?.textContent.trim() || "0";
  const velocidadeVento = document.getElementById('wind-speed')?.textContent.trim() || "0";
  const direcaoVento = document.getElementById('wind-dir')?.textContent.trim() || "";
  const soloTemp = document.getElementById('temp-soil')?.textContent.replace('°C', '').replace(',', '.').trim() || "0";

  return {
    usuario: { id: Number(usuarioId) },
    cidade,
    estado,
    temperaturaAr: Number(ar.temp) || 0,
    umidadeAr: Number(ar.umidade) || 0,
    phSolo: Number(solo.ph) || 0,
    umidadeSolo: Number(solo.umidade) || 0,
    nitrogenio: Number(solo.n) || 0,
    fosforo: Number(solo.p) || 0,
    potassio: Number(solo.k) || 0,
    temperaturaSolo: Number(soloTemp) || 0,
    precipitacao,
    velocidadeVento,
    direcaoVento
  };
}

async function extrairAnalise(salvarNoHistorico = false) {
  await atualizarMonitorSolo();

  const dadosParaSalvar = await coletarDados();

  // Só salva no histórico se for pedido
  if (salvarNoHistorico) {
    try {
      const res = await fetch('http://localhost:8080/api/medicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaSalvar)
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('Análise salva no histórico!', 'success', 4000);
      } else {
        showNotification('Erro ao salvar análise: ' + (data.message || 'Erro desconhecido'), 'error', 5000);
      }
    } catch (err) {
      showNotification('Erro ao salvar análise no banco de dados.', 'error', 5000);
      console.error('Erro ao salvar análise:', err);
    }
  }
}

if (btnAnalise) {
  btnAnalise.addEventListener('click', async (e) => {
    e.preventDefault();

    // Clica e salva no histórico
    await extrairAnalise(true);

    // Começa a atualizar automaticamente sem salvar
    if (!intervaloAtualizacao) {
      intervaloAtualizacao = setInterval(async () => {
        await extrairAnalise(false);
      }, 5000);
      console.log('Atualização automática a cada 5 segundos (sem salvar no histórico).');
    }
  });
}


// ...existing code...


// ...existing code...

// ...existing code...

// ...existing code...

// Variável global para armazenar a localização selecionada
let localizacaoSelecionada = null;

// --- Marcação no mapa popup ---
function configurarMarcacaoMapaPopup() {
  if (!window.mapaPopup) return;
  window.mapaPopup.on('click', function(e) {
    const latLng = e.latlng;
    localizacaoSelecionada = {
      lat: latLng.lat,
      lng: latLng.lng
    };
    atualizarEstadoBotaoAnalise();
    showNotification(
      `<i class="fas fa-map-marker-alt"></i> Localização marcada: <b>${localizacaoSelecionada.lat.toFixed(5)}, ${localizacaoSelecionada.lng.toFixed(5)}</b>`,
      'info',
      3500
    );
  });
}

// --- Marcação no mapa principal ---
function configurarMarcacaoMapaPrincipal() {
  if (!window.mapaPrincipal) return;
  window.mapaPrincipal.on('click', function(e) {
    const latLng = e.latlng;
    localizacaoSelecionada = {
      lat: latLng.lat,
      lng: latLng.lng
    };
    atualizarEstadoBotaoAnalise();
    showNotification(
      `<i class="fas fa-map-marker-alt"></i> Localização marcada: <b>${localizacaoSelecionada.lat.toFixed(5)}, ${localizacaoSelecionada.lng.toFixed(5)}</b>`,
      'info',
      3500
    );
  });
}

// Chama as funções de configuração após o mapa estar pronto
document.addEventListener('DOMContentLoaded', () => {
  atualizarEstadoBotaoAnalise();
  setTimeout(() => {
    configurarMarcacaoMapaPopup();
    configurarMarcacaoMapaPrincipal();
  }, 500);
});

// Se usar outro método para marcar (ex: botão "usar coordenadas"), adicione:
document.getElementById("usarCoordenadas")?.addEventListener("click", () => {
  const lat = parseFloat(document.getElementById("inputLat").value);
  const lng = parseFloat(document.getElementById("inputLng").value);
  if (!isNaN(lat) && !isNaN(lng)) {
    localizacaoSelecionada = { lat, lng };
    atualizarEstadoBotaoAnalise();
    showNotification(
      `<i class="fas fa-map-marker-alt"></i> Localização marcada: <b>${lat.toFixed(5)}, ${lng.toFixed(5)}</b>`,
      'info',
      3500
    );
  }
});

// Sempre que o usuário fizer login/logout, chame atualizarEstadoBotaoAnalise()
// Exemplo para login:
document.getElementById("doLogin")?.addEventListener("click", () => {
  setTimeout(atualizarEstadoBotaoAnalise, 1200);
});

// --- FUNÇÕES DE LIMPEZA DOS CARACTERES INDESEJADOS ---

// Função específica para limpar o recommendationResult - VERSÃO CORRIGIDA
function cleanRecommendationResult() {
    const recommendationResult = document.getElementById('recommendationResult');
    if (!recommendationResult) return;
    
    // Método 1: Limpeza direta do HTML
    let html = recommendationResult.innerHTML;
    let originalHtml = html;
    
    // Remove TODAS as ocorrências - VERSÃO MELHORADA
    html = html.replace(/``html/g, '');
    html = html.replace(/```html/g, '');
    html = html.replace(/`html/g, '');
    html = html.replace(/`/g, ''); // REMOVE QUALQUER ` SOLTO
    html = html.replace(/\.\.\./g, '');
    html = html.replace(/```/g, '');
    html = html.replace(/``/g, '');
    
    // Se houve mudança, aplica
    if (html !== originalHtml) {
        recommendationResult.innerHTML = html;
    }
    
    // Método 2: Limpeza de nós de texto - VERSÃO MELHORADA
    const textNodes = [];
    const walker = document.createTreeWalker(
        recommendationResult,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.includes('`') || node.textContent.includes('``html') || node.textContent.includes('...')) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        textNode.textContent = textNode.textContent
            .replace(/``html/g, '')
            .replace(/```html/g, '')
            .replace(/`html/g, '')
            .replace(/`/g, '') // REMOVE QUALQUER ` SOLTO
            .replace(/\.\.\./g, '')
            .replace(/```/g, '')
            .replace(/``/g, '');
    });
}

// FUNÇÃO EXTRA PARA LIMPEZA ESPECÍFICA DO ` SOLTO:
function removeSingleBackticks() {
    const elements = document.querySelectorAll('#recommendationResult, .agricultural-info, .recommend-boxes');
    
    elements.forEach(element => {
        // Procura por textos que contenham apenas ` ou combinado
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('`')) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            // Remove APENAS os ` sem afetar o resto
            textNode.textContent = textNode.textContent.replace(/`/g, '');
        });
    });
}

// OBSERVER PARA DETECTAR E LIMPAR CONTEÚDO INDESEJADO:
const aggressiveObserver = new MutationObserver(function(mutations) {
    let found = false;
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const html = node.innerHTML || '';
                    if (html.includes('`') || html.includes('``html') || html.includes('...')) {
                        found = true;
                    }
                }
            });
        }
    });
    
    if (found) {
        cleanRecommendationResult();
        removeSingleBackticks(); // CHAMA A NOVA FUNÇÃO
        // Força limpeza múltipla
        setTimeout(cleanRecommendationResult, 50);
        setTimeout(removeSingleBackticks, 50);
        setTimeout(cleanRecommendationResult, 150);
        setTimeout(removeSingleBackticks, 150);
    }
});

// CONFIGURAÇÃO DO OBSERVER NO CARREGAMENTO DA PÁGINA:
document.addEventListener('DOMContentLoaded', function() {
    const recommendationResult = document.getElementById('recommendationResult');
    if (recommendationResult) {
        aggressiveObserver.observe(recommendationResult, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    // Limpeza inicial
    setTimeout(cleanRecommendationResult, 1000);
    setTimeout(removeSingleBackticks, 1000);
});

// LIMPEZA EM EVENTOS DE CLIQUE (fallback):
document.addEventListener('click', function() {
    setTimeout(cleanRecommendationResult, 100);
    setTimeout(removeSingleBackticks, 100);
});

// --- FUNÇÃO updateAgriculturalCalendar MODIFICADA ---
async function updateAgriculturalCalendar(state) {
  const calendarBox = document.getElementById('calendarInfo');
  const city = citySelect.options[citySelect.selectedIndex]?.textContent || '';
  const stateName = stateSelect.options[stateSelect.selectedIndex]?.textContent || state;

  calendarBox.innerHTML = `<div class="loader">Gerando calendário agrícola...</div>`;

  const prompt = `Monte um calendário agrícola para ${city}, ${stateName}, Brasil.
Considere as condições climáticas e agrícolas típicas dessa cidade.
Responda SOMENTE com um array JSON de 12 objetos, um para cada mês (jan a dez), cada um com as propriedades: "plantio", "crescimento", "colheita", "manutencao" (cada uma deve ser uma string curta, mesmo se não houver atividade, use ""). NÃO escreva nada além do JSON. Exemplo de resposta: [{"plantio": "Milho, Feijão", "crescimento": "Regar", "colheita": "", "manutencao": "Adubar"}, ...]`;

  let iaResponse = '';
  let calendarData = null;

  try {
    iaResponse = await getChatbotResponse(prompt);
    
    // LIMPEZA AGUESSIVA DA RESPOSTA - VERSÃO MELHORADA
    iaResponse = iaResponse
        .replace(/``html/g, '')
        .replace(/```html/g, '')
        .replace(/`html/g, '')
        .replace(/`/g, '') // REMOVE QUALQUER ` SOLTO
        .replace(/\.\.\./g, '')
        .replace(/```/g, '')
        .replace(/``/g, '');
    
    let jsonMatch = iaResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0].replace(/'/g, '"');
      try {
        calendarData = JSON.parse(jsonStr);
      } catch (err) {
        console.error('Erro ao fazer parse do JSON:', err, jsonStr);
        calendarData = null;
      }
    }
  } catch (e) {
    console.error('Erro geral ao processar calendário:', e);
    calendarData = null;
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (calendarData && Array.isArray(calendarData)) {
    let gridHtml = '';
    calendarData.forEach((mes, idx) => {
      const plantio = Array.isArray(mes.plantio) ? mes.plantio.join(', ') : (mes.plantio || '');
      const crescimento = Array.isArray(mes.crescimento) ? mes.crescimento.join(', ') : (mes.crescimento || '');
      const colheita = Array.isArray(mes.colheita) ? mes.colheita.join(', ') : (mes.colheita || '');
      const manutencao = Array.isArray(mes.manutencao) ? mes.manutencao.join(', ') : (mes.manutencao || '');

      gridHtml += `
        <div class="calendar-month">
          <h4>${meses[idx]}</h4>
          ${plantio ? `<p><strong>Plantio:</strong> ${plantio}</p>` : ''}
          ${crescimento ? `<p><strong>Crescimento:</strong> ${crescimento}</p>` : ''}
          ${colheita ? `<p><strong>Colheita:</strong> ${colheita}</p>` : ''}
          ${manutencao ? `<p><strong>Manutenção:</strong> ${manutencao}</p>` : ''}
          ${!plantio && !crescimento && !colheita && !manutencao ? `<p>Sem atividades principais</p>` : ''}
        </div>
      `;
    });

    calendarBox.innerHTML = `
      <div class="calendar-grid">${gridHtml}</div>
    `;

    const emptyCalendar = document.getElementById('emptyCalendar');
    if (emptyCalendar) emptyCalendar.style.display = 'none';
  } else {
    // FALLBACK - LIMPEZA EXTRA
    let cleanResponse = iaResponse
        .replace(/``html/g, '')
        .replace(/```html/g, '')
        .replace(/`html/g, '')
        .replace(/`/g, '') // REMOVE QUALQUER ` SOLTO
        .replace(/\.\.\./g, '')
        .replace(/```/g, '')
        .replace(/``/g, '');

    calendarBox.innerHTML = `
      <div class="agricultural-info">
        ${cleanResponse && typeof cleanResponse === 'string'
          ? cleanResponse
          : 'Não foi possível gerar um calendário agrícola detalhado para a sua região. Tente novamente ou refine sua localização.'}
      </div>
    `;
  }

  // LIMPEZA FINAL GARANTIDA - AUMENTE OS TIMEOUTS
  setTimeout(cleanRecommendationResult, 100);
  setTimeout(cleanRecommendationResult, 300);
  setTimeout(cleanRecommendationResult, 600);
  setTimeout(cleanRecommendationResult, 1000);
  setTimeout(removeSingleBackticks, 100);
  setTimeout(removeSingleBackticks, 300);
}

// ...existing code...
















// Botão para abrir recomendação de plantio
document.getElementById('recommendBtn').addEventListener('click', async () => {
  const crop = cropSelect.value;
  const city = citySelect.options[citySelect.selectedIndex]?.text || '';
  const state = stateSelect.options[stateSelect.selectedIndex]?.text || '';

  if (!crop || !city || !state) {
    return notify('Selecione estado, cidade e planta', 'warning');
  }

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  modalTitle.innerHTML = `<i class="fas fa-seedling"></i> Detalhes sobre ${crop}`;
  modalContent.innerHTML = `<div class="loader">Gerando informações...</div>`;
  modal.style.display = 'block';

  try {
    const response = await fetchAgriculturalInfo(city, state, crop);
    // remove ```html e ```
    const cleanResponse = response
      .replace(/```html|```/g, '')
      .trim();

    modalContent.innerHTML = cleanResponse;
  } catch (error) {
    console.error(error);
    modalContent.innerHTML = `<p>Erro ao gerar informações sobre ${crop}.</p>`;
  }
});

// Fecha o modal ao clicar no X
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('infoModal').style.display = 'none';
});










