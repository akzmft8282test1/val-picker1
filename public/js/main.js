// 13개 맵 목록
const MAPS = [
  '어센트', '바인드', '헤이븐', '스플릿', '아이스박스', 
  '브리즈', '프랙처', '펄', '로터스', '어비스', 
  '선셋', '코로드', '서밋'
];

// 발로란트 전체 요원 목록 (총 26명)
const AGENTS = [
  // 타격대 (Duelist)
  '제트', '레이즈', '피닉스', '레이나', '요루', '네온', '아이소',
  // 개척자 (Initiator)
  '소바', '브리치', '페이드', '케이/오', '게코', '테호',
  // 전략가 (Controller)
  '오멘', '바이퍼', '브림스톤', '아스트라', '하버', '클로브',
  // 감시자 (Sentinel)
  '킬조이', '사이퍼', '체임버', '데드락', '바이런'
];

document.addEventListener('DOMContentLoaded', () => {
  renderMaps();

  // 플레이어 등록 폼 이벤트 핸들러
  const playerForm = document.getElementById('playerForm');
  if (playerForm) {
    playerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('playerName').value.trim();
      const tier = document.getElementById('playerTier').value;

      if (!name) return;

      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tier })
      });

      if (res.ok) location.reload();
    });
  }
});

// 맵 13개 Grid 렌더링
function renderMaps() {
  const grid = document.getElementById('mapGrid');
  if (grid) {
    grid.innerHTML = MAPS.map(map => `<div class="map-item" id="map-${map}">${map}</div>`).join('');
  }
}

// 특정 플레이어 삭제
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

// 배열 무작위 셔플 함수 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 팀 생성 알고리즘 (밸런스 / 랜덤 - 동티어 랜덤 셔플 적용)
function generateTeams(type) {
  const tags = Array.from(document.querySelectorAll('.player-tag'));
  if (tags.length < 2) return alert('최소 2명 이상 등록해야 팀을 나눌 수 있습니다.');

  let players = tags.map(tag => ({
    name: tag.dataset.name,
    tier: tag.dataset.tier,
    score: parseInt(tag.dataset.score)
  }));

  let teamA = [], teamB = [];

  if (type === 'random') {
    // 완전 랜덤
    shuffleArray(players);
    players.forEach((p, idx) => (idx % 2 === 0 ? teamA : teamB).push(p));
  } else {
    // 1. 플레이어를 먼저 무작위로 섞음 (동티어 플레이어 간 기본 순서를 매번 변경)
    shuffleArray(players);

    // 2. 티어 점수 내림차순 정렬 (점수가 같아도 1번 과정으로 인해 내부 순서가 매번 달라짐)
    players.sort((a, b) => b.score - a.score);

    // 3. 점수 합산 분배 (양 팀 점수가 같을 때는 50% 확률로 무작위 배치)
    let sumA = 0, sumB = 0;

    players.forEach(p => {
      if (sumA === sumB) {
        if (Math.random() < 0.5) {
          teamA.push(p);
          sumA += p.score;
        } else {
          teamB.push(p);
          sumB += p.score;
        }
      } else if (sumA < sumB) {
        teamA.push(p);
        sumA += p.score;
      } else {
        teamB.push(p);
        sumB += p.score;
      }
    });
  }

  renderTeamList('teamA', teamA, 'scoreA');
  renderTeamList('teamB', teamB, 'scoreB');
}

function renderTeamList(elementId, team, scoreId) {
  const list = document.getElementById(elementId);
  const totalScore = team.reduce((acc, cur) => acc + cur.score, 0);
  document.getElementById(scoreId).innerText = `(점수: ${totalScore})`;
  list.innerHTML = team.map(p => `<li><strong>${p.name}</strong> <small>(${p.tier})</small></li>`).join('');
}

// 랜덤 맵 추첨
function pickRandomMap() {
  const randomIndex = Math.floor(Math.random() * MAPS.length);
  const selected = MAPS[randomIndex];

  document.querySelectorAll('.map-item').forEach(el => el.classList.remove('selected'));
  const mapElem = document.getElementById(`map-${selected}`);
  if (mapElem) mapElem.classList.add('selected');

  document.getElementById('selectedMap').innerText = `선택된 맵: ${selected}`;
}

// 공/수 진영 주사위
function rollSide() {
  const side = Math.random() < 0.5 ? '공격 (Attack)' : '수비 (Defense)';
  document.getElementById('sideResult').innerText = side;
}

// 전체 26명 중 랜덤 요원 추천
function pickRandomAgent() {
  const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  document.getElementById('agentResult').innerText = agent;
}
