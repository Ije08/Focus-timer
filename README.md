# ⏱️ Focus Timer (뽀모도로 포커스 타이머)

👉 **[웹에서 바로 실행하기 (무설치)](https://willowy-beijinho-a6bdf2.netlify.app/)**

> 프리미엄 글래스모피즘 디자인과 웹 위젯(PIP) 기능을 지원하는 현대적인 오픈소스 포모도로 타이머입니다.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ 주요 기능 (Key Features)

- 🎨 **프리미엄 글래스모피즘 UI**: 세련된 그라데이션 배경과 유연한 수평 대시보드 레이아웃
- 📱 **독립형 PIP 위젯 모드**: 브라우저 외부 화면 위에서도 항상 떠 있는 콤팩트 미니 타이머 위젯 지원
- ⏱️ **타이머 자유 설정**: 집중/짧은휴식/긴휴식 시간을 사용자가 직접 커스텀 가능 (초 단위 정밀 기록)
- 📊 **차별화된 일간/주간 통계**:
  - **일간**: 오늘 하루 중 처음 시작한 시간대부터의 시간대별 집중 타임라인
  - **주간**: 월~일요일 기준 몰입/휴식 시간을 함께 보여주는 스택형 차트 (Stacked Bar Chart)
- 🗓️ **상세 분석 대시보드**: 최근 35일간의 **집중 히트맵(Heatmap)** 및 전체 타임라인 기록 열람
- 🎵 **자체 오디오 합성 사운드**: Web Audio API 기반의 맑고 깔끔한 시작/종료 차임벨
- 🗑️ **안전한 데이터 관리**: LocalStorage 기반 영구 저장 및 커스텀 확인 모달을 통한 기록 초기화

---

## 🛠️ 기술 스택 (Tech Stack)

- **Core**: React 18, TypeScript, Vite
- **State Management**: Zustand (`zustand/persist`)
- **Data Visualization**: Recharts, Date-fns
- **Icons**: Lucide React
- **Styling**: Modern Vanilla CSS (Glassmorphism, Animations)

---

## 🚀 시작하기 (Getting Started)

### 1. 레포지토리 클론
```bash
git clone https://github.com/Ije08/Focus-timer.git
cd Focus-timer
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

### 4. 프로덕션 빌드
```bash
npm run build
```

---

## 🤝 오픈소스 기여 안내 (Contributing)

Focus Timer는 모든 기여(Feature 제안, 버그 제보, PR 등)를 환영합니다!

1. This 레포지토리를 **Fork**합니다.
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`).
5. **Pull Request**를 생성합니다.

---

## 📜 라이선스 (License)

이 프로젝트는 [MIT 라이선스](./LICENSE)에 따라 자유롭게 사용 및 수정할 수 있습니다.
