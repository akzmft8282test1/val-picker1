require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// DB 테이블 초기화
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        tier VARCHAR(20) NOT NULL,
        tier_score INT NOT NULL
      );
    `);
    console.log('Database table initialized');
  } catch (err) {
    console.error('DB Init Error:', err);
  }
}
initDb();

// 티어별 가중치 점수
const TIER_SCORES = {
  '아이언': 1, '브론즈': 2, '실버': 3, '골드': 4,
  '플래티넘': 5, '다이아몬드': 6, '초월자': 7, '불멸': 8, '레디언트': 9
};

// 메인 페이지
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players ORDER BY id DESC');
    res.render('index', { players: result.rows });
  } catch (err) {
    res.status(500).send('DB Error');
  }
});

// 플레이어 등록 API
app.post('/api/players', async (req, res) => {
  const { name, tier } = req.body;
  const score = TIER_SCORES[tier] || 1;
  try {
    const result = await pool.query(
      'INSERT INTO players (name, tier, tier_score) VALUES ($1, $2, $3) RETURNING *',
      [name, tier, score]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 플레이어 삭제 API
app.delete('/api/players/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM players WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 초기화 API
app.delete('/api/players', async (req, res) => {
  try {
    await pool.query('DELETE FROM players');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
