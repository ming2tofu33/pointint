# Backend Rules

FastAPI + Railway. Python 3.12+.

## Project Structure

```
backend/
├── app/
│   ├── main.py          FastAPI app + CORS + router registration
│   ├── core/            Config, database, shared utilities
│   ├── api/             API endpoint routers
│   └── services/        Business logic (image processing, cursor generation)
├── tests/               Test suite
├── requirements.txt     Dependencies
└── pyproject.toml       Project config + ruff settings
```

## Python Setup

- venv: `backend/.venv` 만 사용. `backend/venv` 금지.
- Python 3.12+ (`.python-version` 참조).
- 의존성 설치: `pip install -r requirements.txt`
- Lint: `ruff check .` (backend/ 에서 실행)
- Test: `pytest tests/ -v --tb=short`

## Dev

```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 서버 실행
uvicorn app.main:app --reload --port 8000

# 헬스체크
curl http://localhost:8000/health
```

## Core Modules

- **`app/core/config.py`** — 환경변수 설정 (dotenv)
- **`app/main.py`** — FastAPI 앱 + CORS 미들웨어
- **`app/services/`** — 이미지 처리 (Pillow, rembg), 커서 생성 로직
- **`app/api/`** — 엔드포인트 라우터

## Supabase

- 백엔드는 **Service Role Key** 사용 (`SUPABASE_SERVICE_ROLE_KEY`).
- API 응답에 Service Role Key를 절대 포함하지 않는다.
- 프론트엔드에 Service Role Key를 전달하지 않는다.

## Image Processing

- 배경 제거: `rembg` (CPU 모드)
- 이미지 조작: `Pillow` (PIL)
- `.cur` 바이너리 생성: 커스텀 로직 (`app/services/`)
- 입력 포맷: PNG, JPG, WebP, GIF
- 출력 포맷: `.cur` (Phase 1), `.ani` (Phase 1.5)

## Environment Variables

`.env` 파일 필수 (`.env.example` 참조):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8000
```

## Deployment (Railway)

```bash
# Railway가 자동 감지:
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Health check: `GET /health → {"status": "ok"}`
- `main` 브랜치 push → Railway 자동 배포

## Forbidden Patterns

- `print()` 사용 금지. `logging` 모듈 사용.
- 환경변수 하드코딩 금지. `app/core/config.py` 경유.
- API 응답에 내부 키/시크릿 노출 금지.
- `backend/venv` 디렉토리 생성 금지 (`.venv`만 사용).
