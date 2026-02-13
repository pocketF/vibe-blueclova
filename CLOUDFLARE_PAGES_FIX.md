# Cloudflare Pages 빌드 오류 해결 방법

## 문제 원인

에러 메시지:
```
npm error Missing: yaml@2.8.2 from lock file
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
```

이는 `package.json`과 `package-lock.json`이 동기화되지 않아 발생하는 문제입니다.

## 해결 방법

### 방법 1: Cloudflare Pages 빌드 설정 변경 (권장)

1. **Cloudflare Dashboard** → **Pages** → 해당 프로젝트 선택
2. **Settings** → **Builds & deployments** 탭
3. **Build configuration** 섹션에서:
   - **Build command**: `npm install && npm run build`
   - 또는: `npm install --legacy-peer-deps && npm run build`
4. **Save** 클릭

### 방법 2: package-lock.json 재생성 (이미 완료)

로컬에서 다음 명령어를 실행하여 `package-lock.json`을 재생성했습니다:

```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Regenerate package-lock.json"
git push origin main
```

### 방법 3: .npmrc 파일 추가

프로젝트 루트에 `.npmrc` 파일을 생성하여 설치 전략을 변경:

```
legacy-peer-deps=true
```

### 방법 4: wrangler.toml 파일 생성 (선택사항)

Cloudflare Pages는 `wrangler.toml` 파일이 있으면 이를 사용합니다. 프로젝트 루트에 생성:

```toml
name = "vibe-blueclova"
compatibility_date = "2024-01-01"

[build]
command = "npm install && npm run build"
cwd = "."

[build.upload]
format = "service-worker"
```

## 확인 사항

1. **GitHub에 최신 코드가 푸시되었는지 확인**
   - https://github.com/pocketF/vibe-blueclova

2. **Cloudflare Pages에서 재배포**
   - **Deployments** 탭 → **Retry deployment** 클릭

3. **빌드 로그 확인**
   - 배포 실패 시 로그에서 정확한 오류 확인

## 추가 팁

- `npm ci`는 lock 파일과 정확히 일치해야 하므로, 의존성이 변경되었다면 `npm install`을 사용하는 것이 더 안전합니다.
- Cloudflare Pages는 기본적으로 `npm ci`를 사용하므로, 빌드 명령어를 명시적으로 설정하는 것이 좋습니다.
