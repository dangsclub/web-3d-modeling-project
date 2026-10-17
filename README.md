# 🎨 3D 모델링 따라 그리기 웹 프로젝트 (Web 3D Sculpting & Reference Viewer)

> 와콤 패드와 펜을 활용해 목표 3D 모델을 관찰하고, 기본 도형에서부터 하나씩 모양을 빚어 만들며 배우는 인터랙티브 3D 모델링 실습 플랫폼입니다.

---

## 🚀 프로젝트 핵심 기능
- **2열 split 워크스페이스:**
  - **왼쪽 (Target Reference View):** 학습 목표가 되는 3D 모델(인체 두상/상반신/전신 파츠 등)을 360도로 돌려보며 관찰하는 뷰어
  - **오른쪽 (Work Canvas):** 와콤 펜으로 기본 도형의 정점(Vertex)을 누르고 당겨 형태를 다듬는 스컬프팅 실습 영역
- **와콤 펜 & 필압(PointerEvent) 연동:**
  - 펜의 누르는 힘(Pressure)을 감지하여 브러시 범위 및 변형 강도를 실시간 조절
  - 하단 필압 바(Pressure Bar)를 통한 필압 입력 상태 시각화
- **단계별 튜토리얼 가이드 (Step-by-Step):**
  - 기초 두상 잡기 ➔ 상반신 굴곡 표현 ➔ 전신 디테일 관찰 단계 전환
- **SEO 및 수익화 탑재:**
  - 구글 애드센스 광고 단위 배치 영역 및 검색엔진 최적화 메타 태그 내장

---

## 🛠️ 기술 스택 (Tech Stack)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **3D Engine:** Three.js (r128), OrbitControls
- **Input API:** PointerEvent (Wacom Pen & Tablet support)
- **Deployment:** Vercel / Netlify / GitHub Pages

---

## 📂 프로젝트 구조 (Project Structure)
```text
web-3d-modeling-project/
├── index.html       # 2열 워크스페이스 레이아웃 및 애드센스/SEO 태그
├── style.css        # 다크 테마 기반 스튜디오 UI 및 반응형 스타일
├── main.js          # Three.js 레퍼런스 뷰어 + 와콤 펜 필압/변형 로직
└── README.md        # 프로젝트 구성 및 업데이트 기록 문서
```

---

## 🔄 업데이트 내역 (Changelog)

- **v1.1.0 (2026-10-18)**
  - 와콤 펜 스컬프팅 기능 구현 (2열 뷰어 구조 도입)
  - PointerEvent 기반 필압(Pressure) 감지 및 실시간 변형(Deform) 로직 적용
  - 왼쪽 목표 3D 모델 360도 관찰 뷰어 및 도구 선택바(변형/회전) 추가
- **v1.0.0 (2026-10-18)**
  - Initial Release: 기본 3D 큐브 및 튜토리얼 UI 구조 세팅

---

## 💡 향후 개선 계획 (Roadmap)
- [ ] 외부 `.glb` / `.gltf` 인체 3D 모델 파일 업로드 기능
- [ ] 와콤 펜 버튼(사이드키) 연동 및 Undo/Redo 기능 지원
- [ ] 구글 애드센스 정식 승인 및 광고 연결
