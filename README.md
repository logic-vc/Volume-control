# 🎤 Vocal Volume Monitor

조용히 노래 연습할 수 있도록 도와주는 실시간 마이크 볼륨 모니터링 애플리케이션입니다.

## ✨ 주요 기능

### 1. 실시간 마이크 입력 모니터링
- Web Audio API를 활용한 실시간 마이크 볼륨 감지
- 시각적으로 아름다운 원형 볼륨 인디케이터
- 실시간 볼륨 미터 바

### 2. 기준 볼륨 설정
- 슬라이더를 통한 간편한 기준 볼륨 설정
- 0~100 범위의 볼륨 조절 가능
- 실시간으로 기준값 변경 가능

### 3. 시각적 피드백
- **초록색** 🟢: 볼륨이 기준 이하 (안전)
- **빨간색** 🔴: 볼륨이 기준 초과 (경고)
- 색상 변화와 함께 진동 애니메이션 효과
- 상태 메시지로 명확한 피드백 제공

### 4. 볼륨 히스토리 차트
- 실시간 볼륨 변화를 그래프로 표시
- 기준선 표시로 쉬운 비교
- 최근 50개 데이터 포인트 표시

## 🚀 사용 방법

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd Volume-control
```

2. **로컬 서버로 실행**

웹 브라우저에서 직접 `index.html`을 열거나, 로컬 서버를 사용하세요:

```bash
# Python 3 사용
python -m http.server 8000

# Node.js 사용 (http-server 필요)
npx http-server

# VS Code Live Server 확장 사용
# index.html에서 우클릭 -> "Open with Live Server"
```

3. **브라우저에서 접속**
```
http://localhost:8000
```

### 앱 사용하기

1. **마이크 시작**: "마이크 시작하기" 버튼을 클릭하여 마이크 권한을 허용합니다.
2. **기준 설정**: 슬라이더를 조정하여 원하는 볼륨 기준을 설정합니다.
3. **연습 시작**: 노래를 부르면서 실시간 피드백을 확인합니다.
   - 초록색 = 조용히 잘하고 있어요! ✓
   - 빨간색 = 볼륨을 낮춰주세요! ⚠️
4. **정지**: 연습이 끝나면 "정지" 버튼을 클릭합니다.

### 키보드 단축키

- **Space**: 마이크 시작
- **Escape**: 마이크 정지

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**:
  - CSS Grid & Flexbox 레이아웃
  - CSS Variables (Custom Properties)
  - 그라디언트 및 애니메이션
  - 반응형 디자인
- **JavaScript (ES6+)**:
  - Web Audio API
  - Canvas API (차트 렌더링)
  - MediaDevices API (마이크 접근)
  - DOM 조작

## 📁 프로젝트 구조

```
Volume-control/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css      # 스타일시트
├── js/
│   └── script.js      # JavaScript 로직
└── README.md          # 프로젝트 문서
```

## 🎨 디자인 특징

### 컬러 팔레트
- **Primary**: #6366f1 (인디고)
- **Secondary**: #8b5cf6 (보라)
- **Success**: #10b981 (초록)
- **Danger**: #ef4444 (빨강)
- **Dark Background**: #0f172a ~ #1e293b

### UI/UX 특징
- 다크 모드 디자인
- 부드러운 애니메이션 및 트랜지션
- 직관적인 색상 피드백 시스템
- 모바일 반응형 디자인
- 접근성을 고려한 큰 버튼과 명확한 텍스트

## 🌐 브라우저 호환성

- ✅ Chrome (권장)
- ✅ Edge
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer (지원하지 않음)

**참고**: Web Audio API와 MediaDevices API를 지원하는 최신 브라우저가 필요합니다.

## 🔒 개인정보 보호

- 모든 오디오 처리는 **브라우저 내에서만** 수행됩니다
- 마이크 입력은 **저장되지 않습니다**
- 네트워크 전송이 **없습니다**
- 완전히 **오프라인**으로 작동합니다

## 📱 반응형 디자인

- 데스크톱, 태블릿, 모바일 모두 지원
- 화면 크기에 따라 자동으로 레이아웃 조정
- 터치 인터페이스 최적화

## 🎯 사용 사례

- 🏠 **아파트/빌라에서 노래 연습**: 이웃에게 피해 주지 않고 연습
- 🎓 **보컬 레슨**: 학생들의 볼륨 조절 훈련
- 🎙️ **팟캐스트 녹음**: 일정한 볼륨 유지
- 📢 **발표 연습**: 적절한 목소리 크기 연습
- 👶 **조용한 환경 유지**: 아기가 자는 동안 조용히 말하기

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

## 👨‍💻 제작

**VOCAL LOGIC**
스마트한 보컬 연습 솔루션

### 소셜 미디어
- 🎥 [YouTube](https://youtube.com)
- 📝 [Blog](https://blog.naver.com)
- 💬 [KakaoTalk](https://kakaocorp.com)

---

Made with ❤️ by VOCAL LOGIC
