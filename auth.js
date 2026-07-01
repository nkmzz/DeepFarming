(() => {
  const PASSWORD_HASH = '1c2ae443cd95b1160e596f3110de1a87cc913ec203b3a2bf3adafcc6bf7e2a00';
  const SESSION_KEY = 'deepfarming_access_ok';

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function showGate() {
    document.documentElement.classList.add('locked');
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="gate" role="dialog" aria-modal="true">
        <div class="gate-card">
          <div class="gate-badge">DeepFarming</div>
          <h1>접근 확인</h1>
          <p>개인 검토용 스마트팜 프로젝트 노트입니다. 임시 비밀번호를 입력하면 현재 브라우저 세션에서 열립니다.</p>
          <input id="gatePassword" type="password" placeholder="Password" autocomplete="current-password" />
          <button id="gateSubmit">열기</button>
          <small id="gateMsg">GitHub Pages의 정적 사이트용 간이 게이트입니다. 진짜 서버 보안은 아닙니다.</small>
        </div>
      </div>
    `);
    const input = document.getElementById('gatePassword');
    const btn = document.getElementById('gateSubmit');
    const msg = document.getElementById('gateMsg');
    async function check() {
      const h = await sha256(input.value || '');
      if (h === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
        document.querySelector('.gate')?.remove();
        document.documentElement.classList.remove('locked');
      } else {
        msg.textContent = '비밀번호가 맞지 않습니다.';
        input.select();
      }
    }
    btn.addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    setTimeout(() => input.focus(), 50);
  }

  if (sessionStorage.getItem(SESSION_KEY) !== '1') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showGate);
    else showGate();
  }
})();
