// Smartfarm site casual-access gate.
// This is NOT real server-side security. It only blocks casual browsing on a static GitHub Pages site.
(() => {
  const STORAGE_KEY = 'smartfarm_site_auth_v1';
  const SALT = '165ce932aa1a727466822cc8a9361d1d';
  const PASSWORD_HASH = '4f7d331a716d91984cb3b6b9a1b11842c6ab8a9263335ddf4e719fbf1419681c';

  async function digest(text) {
    const bytes = new TextEncoder().encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function unlock() {
    document.documentElement.removeAttribute('data-auth-pending');
    const gate = document.getElementById('authGate');
    if (gate) gate.remove();
  }

  function buildGate() {
    const gate = document.createElement('section');
    gate.id = 'authGate';
    gate.setAttribute('aria-label', '비밀번호 확인');
    gate.innerHTML = `
      <div class="auth-panel">
        <div class="auth-kicker">Smartfarm Project</div>
        <h1>비공개 검토용 자료</h1>
        <p>이 사이트는 개인 검토용 정적 HTML 문서입니다. 비밀번호를 입력하면 현재 브라우저 세션에서 열람됩니다.</p>
        <form id="authForm">
          <input id="authPassword" type="password" autocomplete="current-password" placeholder="비밀번호" autofocus />
          <button type="submit">열기</button>
        </form>
        <p id="authMessage" class="auth-message" role="alert"></p>
        <p class="auth-note">※ GitHub Pages용 최소 접근 차단이며, 진짜 서버 로그인 보안은 아닙니다.</p>
      </div>`;
    document.body.appendChild(gate);
    const form = gate.querySelector('#authForm');
    const input = gate.querySelector('#authPassword');
    const msg = gate.querySelector('#authMessage');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const value = input.value || '';
      msg.textContent = '확인 중...';
      try {
        const candidate = await digest(`${SALT}:${value}`);
        if (candidate === PASSWORD_HASH) {
          sessionStorage.setItem(STORAGE_KEY, 'ok');
          unlock();
        } else {
          msg.textContent = '비밀번호가 맞지 않습니다.';
          input.value = '';
          input.focus();
        }
      } catch (error) {
        msg.textContent = '이 브라우저에서 보안 확인을 처리하지 못했습니다. HTTPS 주소에서 다시 열어주세요.';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'ok') {
      unlock();
    } else {
      buildGate();
    }
  });
})();
