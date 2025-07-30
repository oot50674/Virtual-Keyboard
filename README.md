# Virtual Keyboard
<img width="775" height="425" alt="image" src="https://github.com/user-attachments/assets/45b64c32-2368-458d-9779-ffd68b646e16" />



웹 브라우저에서 사용할 수 있는 한글/영문 가상 키보드 라이브러리입니다.

## ✨ 주요 기능

- 🇰🇷 **한글 조합 지원**: 완전한 한글 입력 및 조합 기능
- 🇺🇸 **영문 입력**: QWERTY 레이아웃의 영문 키보드
- 🎛️ **크기 조절**: 사용자가 키보드 크기를 자유롭게 조절 가능
- 🌐 **언어 전환**: 한글/영문 간 쉬운 전환
- 🎨 **커스터마이징**: 다양한 설정 옵션 제공

## 🚀 빠른 시작

### 1. 파일 포함

```html
<link rel="stylesheet" href="vkeyboard.css">
<script src="vkeyboard.js"></script>
```

### 2. HTML 구조

```html
<div class="input-container">
    <textarea id="input" placeholder="Type here..."></textarea>
    <button class="keyboard-trigger">
        <img src="keyboard-icon.png" alt="키보드" />
    </button>
</div>
```

### 3. 초기화

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const keyboard = initVirtualKeyboard('input', {
        lang: 'ko',           // 초기 언어 (en 또는 ko)
        showControls: false,  // 상단 컨트롤 표시 여부
        align: 'right',       // 키보드 정렬 방식 (center, left, right)
        fontSize: '1.0rem'    // 키보드 폰트 크기
    });
});
```

## ⚙️ 설정 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `lang` | string | `'ko'` | 초기 언어 설정 (`'ko'` 또는 `'en'`) |
| `showControls` | boolean | `true` | 키보드 상단 컨트롤 패널 표시 여부 |
| `align` | string | `'center'` | 키보드 정렬 방식 (`'center'`, `'left'`, `'right'`) |
| `fontSize` | string | `'1.0rem'` | 키보드 폰트 크기 |

## 🎯 사용 예시

### 기본 사용법

```javascript
// 기본 설정으로 키보드 초기화
const keyboard = initVirtualKeyboard('myInput');
```

### 고급 설정

```javascript
// 커스텀 설정으로 키보드 초기화
const keyboard = initVirtualKeyboard('myInput', {
    lang: 'en',
    showControls: true,
    align: 'left',
    fontSize: '1.2rem'
});
```

### 프로그래밍 방식으로 제어

```javascript
// 키보드 표시/숨김
keyboard.show();
keyboard.hide();

// 언어 변경
keyboard.setLanguage('ko'); // 한글로 변경
keyboard.setLanguage('en'); // 영문으로 변경

// 크기 조절
keyboard.setScale(1.2); // 120% 크기로 조절
```

## 📁 파일 구조

```
Virtual-Keyboard/
├── index.html          # 데모 페이지
├── vkeyboard.js        # 가상 키보드 메인 라이브러리
├── vkeyboard.css       # 가상 키보드 스타일시트
└── README.md           # 프로젝트 문서
```

## 🌟 특징

### 한글 입력 지원
- 완전한 한글 조합 기능
- 자음, 모음 조합 처리
- 받침 입력 지원
- 한글 타이핑 규칙 준수

### 반응형 디자인
- 모바일 환경 최적화
- 터치 인터페이스 지원
- 다양한 화면 크기 대응

### 사용자 경험
- 직관적인 인터페이스
- 부드러운 애니메이션
- 키보드 단축키 지원

## 🎨 커스터마이징

CSS 변수를 사용하여 키보드의 모양을 쉽게 커스터마이징할 수 있습니다:

```css
.keyboard-overlay {
    --keyboard-bg: #ffffff;
    --key-bg: #f5f5f5;
    --key-hover: #e0e0e0;
    --key-active: #d0d0d0;
    --border-color: #ddd;
    --text-color: #333;
}
```

## 🔧 개발 정보

- **작성일**: 2025.07.28
- **버전**: 1.0.0
- **라이선스**: MIT

---

⭐ 이 프로젝트가 도움이 되셨다면 별표를 눌러주세요!
