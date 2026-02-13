# 배포 가이드

## 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

## 배포 방법

### 1. Cloudflare Pages (권장)

1. Cloudflare Dashboard → **Pages** 메뉴
2. **Create a project** → **Connect to Git**
3. GitHub 저장소 선택: `pocketF/vibe-blueclova`
4. 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (프로젝트 루트)
5. **Save and Deploy**

### 2. Netlify

1. Netlify Dashboard → **Add new site** → **Import an existing project**
2. GitHub 저장소 연결: `pocketF/vibe-blueclova`
3. 빌드 설정:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
4. **Deploy site**

### 3. Vercel

1. Vercel Dashboard → **Add New Project**
2. GitHub 저장소 선택: `pocketF/vibe-blueclova`
3. 빌드 설정 자동 감지
4. **Deploy**

### 4. Apache 서버

1. `npm run build` 실행
2. `build/` 폴더의 모든 파일을 서버의 `/video_upload` 디렉토리에 업로드
3. `.htaccess` 파일이 포함되어 있는지 확인

## 환경 변수 설정

배포 플랫폼에서 다음 환경 변수를 설정하세요:

### Cloudflare Pages
- **Settings** → **Environment variables**:
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`
  - `REACT_APP_CLOUDFLARE_ACCOUNT_ID`
  - `REACT_APP_CLOUDFLARE_API_TOKEN`

### Netlify
- **Site settings** → **Environment variables**

### Vercel
- **Settings** → **Environment Variables**

## URL 경로

- 개발 환경: `http://localhost:3000/video_upload`
- 프로덕션: `https://blueclova.com/video_upload`

## 확인 사항

1. 빌드 후 `build/` 폴더에 모든 파일이 생성되었는지 확인
2. `build/index.html` 파일이 존재하는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인
4. 배포 후 `https://blueclova.com/video_upload` 접속 테스트
