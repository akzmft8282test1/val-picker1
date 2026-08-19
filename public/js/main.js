// 13개 발로란트 맵 목록 (어센트, 바인드, 헤이븐, 스플릿, 아이스박스, 브리즈, 프랙처, 펄, 로터스, 어비스, 선셋, 카스바, 지평선)
const MAPS = [
  '어센트', '바인드', '헤이븐', '스플릿', '아이스박스', 
  '브리즈', '프랙처', '펄', '로터스', '어비스', 
  '선셋', '디스트릭트', '카스바'
];

const AGENTS = [
  '제트', '레이즈', '페이드', '소바', '킬조이', '사이퍼', '브리치', '오멘', 
  '바이퍼', '아스트라', '케이/오', '체임버', '네온', '페이드', '하버', '게코', '데드락', '아이소', '클로브'
];

document.addEventListener('DOMContentLoaded', () => {
  renderMaps();

  // 플레이어 등록 폼 처리
  document.getElementById('playerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('playerName').value;
    const tier = document.getElementById('playerTier').value;

    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tier })
    });

    if (res.ok) location.reload();
  });
});

// 13개 맵 그리드 렌더링
function renderMaps() {
  const grid = document.getElementById('mapGrid');
  grid.innerHTML = MAPS.map(map => `<div class="map-item" id="map-${map}">${map}</div>`).join('');
}

// 플레이어 삭제
async function removePlayer(id) {
  await fetch(`/api/players/${id}`, { method: 'DELETE' });
  location.reload();
}

// 전체 플레이어 초기화
async function clearAllPlayers() {
  if (confirm('모든 참가자를 삭제하시겠습니까?')) {
    await fetch('/api/players', { method: 'DELETE' });
    location.reload();
  }
}

// 팀 뽑기 알고리즘
function generateTeams(type) {
  const tags = Array.from(document.querySelectorAll('.player-tag'));
  if (tags.length < 2) return alert('최소 2명 이상 등록해야 합니다.');

  let players = tags.map(tag => ({
    name: tag.dataset.name,
    tier: tag.dataset.tier,
    score: parseInt(tag.dataset.score)
  }));

  let teamA = [], teamB = [];

  if (type === 'random') {
    players.sort(() => Math.random() - 0.5);
    players.forEach((p, idx) => (idx % 2 === 0 ? teamA : teamB).push(p));
  } else {
    // 밸런스 알고리즘 (티어 점수 내림차순 정렬 후 교대 배치)
    players.sort((a, b) => b.score - a.score);
    let sumA = 0, sumB = 0;

    players.forEach(p => {
      if (sumA <= sumB) {
        teamA.push(p);
        sumA += p.score;
      } else {
        teamB.push(p);
        sumB += p.score;
      }
    });
  }

  // 화면 출력
  renderTeamList('teamA', teamA);
  renderTeamList('teamB', teamB);
}

function renderTeamList(elementId, team) {
  const list = document.getElementById(elementId);
  list.innerHTML = team.map(p => `<li>${p.name} (${p.tier})</li>`).join('');
}

// 맵 추첨
function pickRandomMap() {
  const randomIndex = Math.floor(Math.random() * MAPS.length);
  const selected = MAPS[randomIndex];

  document.querySelectorAll('.map-item').forEach(el => el.classList.remove('selected'));
  document.getElementById(`map-${selected}`).classList.add('selected');
  document.getElementById('selectedMap').innerText = `선택된 맵: ${selected}`;
}

// 추가 기능: 진영 선택 주사위
function rollSide() {
  const side = Math.random() < 0.5 ? '공격 (Attack)' : '수비 (Defense)';
  document.getElementById('sideResult').innerText = side;
}

// 추가 기능: 랜덤 요원 추천
function pickRandomAgent() {
  const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  document.getElementById('agentResult').innerText = agent;
}
