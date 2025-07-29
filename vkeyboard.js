/**
 * 가상 키보드 라이브러리
 * @file vkeyboard.js
 * 작성일: 2025.07.28
 * 버전: 1.0.0
 * 
 * 설명: 한글/영문 입력을 지원하는 가상 키보드 라이브러리
 *       - 한글 조합 기능 지원
 *       - 반응형 디자인 적용
 *       - 다양한 설정 옵션 제공
 * 
 * 사용법:
 *   const keyboard = initVirtualKeyboard('inputId', {
 *     lang: 'ko',           // 초기 언어 (en 또는 ko)
 *     showControls: true,   // 상단 컨트롤 표시 여부
 *     align: 'center',      // 키보드 정렬 방식
 *     fontSize: '1.0rem'    // 키보드 폰트 크기
 *   });
 * 
 */

// ==================== 상수 정의 ====================
const KEYBOARD_CONSTANTS = {
  // 시간 관련 상수
  DOUBLE_CLICK_THRESHOLD: 500,
  
  // 크기 관련 상수
  MIN_SCALE: 0.5,
  MAX_SCALE: 1.5,
  DEFAULT_SCALE: 1.0,
  SCALE_STEP: 10,
  
  // DOM 관련 상수
  SELECTORS: {
    KEYBOARD: 'keyboard',
    KEYBOARD_OVERLAY: 'keyboard-overlay',
    KEYBOARD_CLOSE: 'keyboard-close',
    KEYBOARD_RESET: 'keyboard-reset',
    SIZE_MINUS_MINI: 'size-minus-mini',
    SIZE_PLUS_MINI: 'size-plus-mini',
    SIZE_VALUE_MINI: 'size-value-mini',
    LANG_SELECT: 'lang-select',
    SIZE_SLIDER: 'size-slider',
    SIZE_VALUE: 'size-value'
  },
  
  // CSS 클래스명
  CLASSES: {
    KEYBOARD_OVERLAY: 'keyboard-overlay',
    KEYBOARD_HEADER: 'keyboard-header',
    KEYBOARD_HEADER_LEFT: 'keyboard-header-left',
    KEYBOARD_HEADER_RIGHT: 'keyboard-header-right',
    KEYBOARD_TRIGGER: 'keyboard-trigger',
    SIZE_CONTROL_MINI: 'size-control-mini',
    SIZE_BTN_MINI: 'size-btn-mini',
    KEYBOARD_RESET_BTN: 'keyboard-reset-btn',
    KEYBOARD_CLOSE_BTN: 'keyboard-close-btn',
    SHOW: 'show',
    KEY: 'key',
    ROW: 'row',
    SHIFT: 'shift',
    ACTIVE: 'active',
    LOCKED: 'locked',
    BACKSPACE: 'backspace',
    ENTER: 'enter',
    LANG_TOGGLE: 'lang-toggle',
    NUMBER: 'number',
    PUNCTUATION: 'punctuation'
  }
};

const KEYBOARD_LAYOUTS = {
  en: [
    ['1','2','3','4','5','6','7','8','9','0','-','=','backspace'],
    ['q','w','e','r','t','y','u','i','o','p','[',']', '\\'],
    ['a','s','d','f','g','h','j','k','l',';','\'','enter'],
    ['shift','z','x','c','v','b','n','m',',','.','/',],
    ['space','한영']
  ],
  ko: [
    ['1','2','3','4','5','6','7','8','9','0','-','=','backspace'],
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ','[',']','\\'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ',';','\'','enter'],
    ['shift','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ',',','.','/',],
    ['space','한영']
  ]
};

const HANGUL_DATA = {
  CHO: [
    'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ',
    'ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
  ],
  JUNG: [
    'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ',
    'ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
  ],
  JONG: [
    '', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ',
    'ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ',
    'ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
  ]
};

// 매핑 객체 생성
const HANGUL_MAPS = {
  CHO: Object.fromEntries(HANGUL_DATA.CHO.map(function(c, i) { return [c, i]; })),
  JUNG: Object.fromEntries(HANGUL_DATA.JUNG.map(function(c, i) { return [c, i]; })),
  JONG: Object.fromEntries(HANGUL_DATA.JONG.map(function(c, i) { return [c, i]; }))
};

const HANGUL_COMBINATIONS = {
  DOUBLE_CHO: {
    'ㄱㄱ':'ㄲ','ㄷㄷ':'ㄸ','ㅂㅂ':'ㅃ','ㅅㅅ':'ㅆ','ㅈㅈ':'ㅉ'
  },
  DOUBLE_JUNG: {
    'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ',
    'ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'
  },
  DOUBLE_JONG: {
    'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ',
    'ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ',
    'ㅂㅅ':'ㅄ'
  },
  SHIFT_DOUBLE_CHO: {
    'ㅂ':'ㅃ','ㅈ':'ㅉ','ㄷ':'ㄸ','ㄱ':'ㄲ','ㅅ':'ㅆ'
  },
  SPLIT_JONG: {
    'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],
    'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],
    'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],
    'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ']
  }
};

const SHIFT_SYMBOLS = {
  '1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')',
  '-':'_','=':'+','[':'{',']':'}',';':':','\'':'"',',':'<','.':'>','/':'?'
};

// ==================== 유틸리티 함수 ====================

/**
 * 한글 조합 함수
 * @param {string} cho - 초성
 * @param {string} jung - 중성  
 * @param {string} jong - 종성
 * @returns {string} 조합된 한글 문자
 */
function composeHangul(cho, jung, jong) {
  jong = jong || '';
  var ci = HANGUL_MAPS.CHO[cho];
  var ji = HANGUL_MAPS.JUNG[jung];
  var ti = HANGUL_MAPS.JONG[jong] || 0;
  
  if (ci == null || ji == null) {
    return cho + jung + jong;
  }
  
  return String.fromCharCode(0xAC00 + ci * 21 * 28 + ji * 28 + ti);
}

/**
 * DOM 요소 생성 유틸리티
 * @param {string} tag - HTML 태그명
 * @param {Object} options - 속성 및 옵션
 * @returns {HTMLElement} 생성된 DOM 요소
 */
function createElement(tag, options) {
  options = options || {};
  var element = document.createElement(tag);
  
  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.textContent) element.textContent = options.textContent;
  if (options.type) element.type = options.type;
  
  return element;
}

/**
 * 요소 존재 확인 유틸리티
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null} 요소 또는 null
 */
function safeGetElement(id) {
  try {
    return document.getElementById(id);
  } catch (error) {
    console.warn('Element not found:', id);
    return null;
  }
}

// ==================== 한글 입력기 클래스 ====================

/**
 * 한글 입력 처리 클래스
 */
function HangulIME() {
  this.reset();
}

HangulIME.prototype.reset = function() {
  this.cho = '';
  this.jung = '';
  this.jong = '';
};

HangulIME.prototype.getCurrent = function() {
  if (!this.jung && !this.cho) return '';
  if (!this.jung) return this.cho;
  return composeHangul(this.cho || 'ㅇ', this.jung, this.jong);
};

HangulIME.prototype.flush = function() {
  var out = this.getCurrent();
  this.reset();
  return out;
};

HangulIME.prototype.input = function(ch) {
  var out = ''; // 최종적으로 입력 필드에 반영될 문자열
  // 입력된 문자가 모음인지 자음인지 판별
  var isVowel = HANGUL_DATA.JUNG.indexOf(ch) !== -1;
  
  if (isVowel) {
    out += this._handleVowelInput(ch); // 모음 입력 처리
  } else {
    out += this._handleConsonantInput(ch); // 자음 입력 처리
  }
  
  return out;
};

HangulIME.prototype._handleVowelInput = function(ch) {
  var out = '';
  
  if (!this.jung) {
    // 현재 중성이 없는 경우
    if (!this.cho) this.cho = 'ㅇ'; // 초성이 없으면 'ㅇ'을 기본 초성으로 설정
    this.jung = ch; // 입력된 모음을 중성으로 설정
  } else if (!this.jong) {
    // 현재 중성이 있고 종성이 없는 경우 (초성 + 중성 상태)
    var comb = HANGUL_COMBINATIONS.DOUBLE_JUNG[this.jung + ch]; // 이중 모음 조합 시도
    if (comb) {
      this.jung = comb; // 이중 모음으로 조합 성공
    } else {
      // 이중 모음 조합 실패: 현재 조합된 글자를 완성하고, 새로운 모음으로 다음 글자 시작
      out += this.flush();
      this.cho = 'ㅇ'; // 'ㅇ'을 초성으로 하여 새로운 글자 시작
      this.jung = ch;
    }
  } else {
    // 현재 종성까지 있는 경우 (초성 + 중성 + 종성 상태)
    var split = HANGUL_COMBINATIONS.SPLIT_JONG[this.jong]; // 종성 분리 가능한지 확인 (겹받침)
    if (split) {
      // 겹받침인 경우: 첫 번째 종성을 현재 글자의 종성으로 유지하고, 두 번째 종성을 다음 글자의 초성으로 사용
      this.jong = split[0];
      out += this.flush();
      this.cho = split[1];
    } else {
      // 겹받침이 아닌 경우: 현재 글자를 완성하고, 종성을 다음 글자의 초성으로 사용
      var last = this.jong; // 현재 종성을 임시 저장
      this.jong = '';
      out += this.flush();
      this.cho = last; // 종성을 다음 글자의 초성으로 설정
    }
    this.jung = ch; // 새로운 모음을 다음 글자의 중성으로 설정
  }
  
  return out;
};

HangulIME.prototype._handleConsonantInput = function(ch) {
  var out = '';
  
  if (!this.jung) {
    // 현재 중성이 없는 경우 (초성만 있거나 아무것도 없는 상태)
    if (!this.cho) {
      this.cho = ch; // 입력된 자음을 초성으로 설정
    } else {
      var comb = HANGUL_COMBINATIONS.DOUBLE_CHO[this.cho + ch]; // 이중 자음 조합 시도
      if (comb) {
        this.cho = comb; // 이중 자음으로 조합 성공
      } else {
        // 이중 자음 조합 실패: 현재 초성으로 글자를 완성하고, 새로운 자음으로 다음 글자 시작
        out += this.flush();
        this.cho = ch;
      }
    }
  } else if (!this.jong) {
    // 현재 중성이 있고 종성이 없는 경우 (초성 + 중성 상태)
    this.jong = ch; // 입력된 자음을 종성으로 설정
  } else {
    // 현재 종성까지 있는 경우 (초성 + 중성 + 종성 상태)
    var comb = HANGUL_COMBINATIONS.DOUBLE_JONG[this.jong + ch]; // 겹받침 조합 시도
    if (comb) {
      this.jong = comb; // 겹받침으로 조합 성공
    } else {
      // 겹받침 조합 실패: 현재 글자를 완성하고, 새로운 자음을 다음 글자의 초성으로 사용
      out += this.flush();
      this.cho = ch;
    }
  }
  
  return out;
};

// ==================== 가상 키보드 클래스 ====================

/**
 * 가상 키보드 메인 클래스
 * @param {string} inputId - 대상 인풋 요소 ID
 * @param {Object} options - 설정 옵션
 */
function VirtualKeyboard(inputId, options) {
  options = options || {};
  
  // 기본 속성 초기화
  this._initializeProperties(inputId, options);
  
  // DOM 요소 설정
  this._setupDOM();
  
  // 이벤트 리스너 설정
  this._setupEventListeners();
  
  // 초기 렌더링
  this.render();
}

VirtualKeyboard.prototype._initializeProperties = function(inputId, options) {
  this.input = safeGetElement(inputId);
  if (!this.input) {
    throw new Error('Input element with id "' + inputId + '" not found');
  }
  
  this.lang = options.lang || 'en';
  this.fontSize = options.fontSize || '1.0rem';
  this.align = options.align || 'center';
  
  this.hangul = new HangulIME();
  this.isShift = false;
  this.isShiftLocked = false;
  this.lastShiftClickTime = 0;
  this.ignoreInput = false;
  this.output = '';
  this.keyboardScale = KEYBOARD_CONSTANTS.DEFAULT_SCALE;
  this.isVisible = false;
  
  var self = this;
  window.addEventListener('resize', function() {
    if (self.isVisible) {
      self.positionKeyboard();
    }
  });
};

VirtualKeyboard.prototype._setupDOM = function() {
  this.container = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD);
  this.overlay = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_OVERLAY);
  
  if (!this.overlay) {
    this._createKeyboardOverlay();
  }
  
  if (!this.container) {
    this.container = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD);
  }
  
  this.triggerElement = this._findTriggerElement();
  this.useIconTrigger = !!this.triggerElement;
  
  this._setupTrigger();
};

VirtualKeyboard.prototype._createKeyboardOverlay = function() {
  // keyboard-overlay 생성
  this.overlay = createElement('div', {
    id: KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_OVERLAY,
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_OVERLAY
  });
  
  // 헤더 생성
  var header = this._createKeyboardHeader();
  
  // keyboard 컨테이너 생성
  this.container = createElement('div', {
    id: KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD
  });
  
  // 모든 요소를 overlay에 추가
  this.overlay.appendChild(header);
  this.overlay.appendChild(this.container);
  
  // overlay를 body에 추가
  document.body.appendChild(this.overlay);
};

VirtualKeyboard.prototype._createKeyboardHeader = function() {
  var header = createElement('div', {
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_HEADER
  });
  
  // header-left 생성
  var headerLeft = createElement('div', {
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_HEADER_LEFT
  });
  
  var sizeControl = this._createSizeControl();
  var resetBtn = createElement('button', {
    id: KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_RESET,
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_RESET_BTN,
    textContent: '초기화'
  });
  
  headerLeft.appendChild(sizeControl);
  headerLeft.appendChild(resetBtn);
  
  // header-right 생성
  var headerRight = createElement('div', {
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_HEADER_RIGHT
  });
  
  var closeBtn = createElement('button', {
    id: KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_CLOSE,
    className: KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_CLOSE_BTN,
    textContent: '×'
  });
  
  headerRight.appendChild(closeBtn);
  
  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  
  return header;
};

VirtualKeyboard.prototype._createSizeControl = function() {
  var sizeControl = createElement('div', {
    className: KEYBOARD_CONSTANTS.CLASSES.SIZE_CONTROL_MINI
  });
  
  var minusBtn = createElement('button', {
    id: KEYBOARD_CONSTANTS.SELECTORS.SIZE_MINUS_MINI,
    className: KEYBOARD_CONSTANTS.CLASSES.SIZE_BTN_MINI,
    type: 'button',
    textContent: '-'
  });
  
  var sizeValue = createElement('span', {
    id: KEYBOARD_CONSTANTS.SELECTORS.SIZE_VALUE_MINI,
    textContent: '100%'
  });
  
  var plusBtn = createElement('button', {
    id: KEYBOARD_CONSTANTS.SELECTORS.SIZE_PLUS_MINI,
    className: KEYBOARD_CONSTANTS.CLASSES.SIZE_BTN_MINI,
    type: 'button',
    textContent: '+'
  });
  
  sizeControl.appendChild(minusBtn);
  sizeControl.appendChild(sizeValue);
  sizeControl.appendChild(plusBtn);
  
  return sizeControl;
};

VirtualKeyboard.prototype._findTriggerElement = function() {
  var parent = this.input.parentElement;
  if (!parent) return null;
  
  // 직접 형제 요소들 중에서 keyboard-trigger 클래스를 가진 요소 찾기
  var siblings = parent.children;
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling !== this.input && sibling.classList.contains(KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_TRIGGER)) {
      return sibling;
    }
  }
  
  // 형제 요소가 없으면 부모 내에서 keyboard-trigger 클래스를 가진 모든 요소 중 첫 번째 찾기
  return parent.querySelector('.' + KEYBOARD_CONSTANTS.CLASSES.KEYBOARD_TRIGGER);
};

VirtualKeyboard.prototype._setupTrigger = function() {
  if (this.useIconTrigger && this.triggerElement) {
    var self = this;
    this.triggerElement.addEventListener('click', function(e) {
      e.stopPropagation();
      if (self.isVisible) {
        self.hideKeyboard();
      } else {
        self.showKeyboard();
        self.input.focus();
      }
    });
  }
};

VirtualKeyboard.prototype._setupEventListeners = function() {
  var self = this;
  
  // 인풋 포커스 이벤트 (아이콘 모드가 아닐 때만)
  if (!this.useIconTrigger) {
    this.input.addEventListener('focus', function() {
      self.showKeyboard();
    });
  }
  
  // 키보드 컨트롤 버튼들
  this._setupControlButtons();
  
  // 전역 이벤트들
  this._setupGlobalEvents();
};

VirtualKeyboard.prototype._setupControlButtons = function() {
  var self = this;
  
  // 키보드 닫기 버튼
  var closeBtn = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_CLOSE);
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      self.hideKeyboard();
    });
  }
  
  // 키보드 초기화 버튼
  var resetBtn = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.KEYBOARD_RESET);
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      self.resetInput();
    });
  }
  
  // 키보드 헤더의 크기 -/+ 버튼
  var miniMinus = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_MINUS_MINI);
  var miniPlus = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_PLUS_MINI);
  
  if (miniMinus && miniPlus) {
    miniMinus.addEventListener('click', function(e) {
      e.stopPropagation();
      self.adjustKeyboardSize(-KEYBOARD_CONSTANTS.SCALE_STEP);
    });
    miniPlus.addEventListener('click', function(e) {
      e.stopPropagation();
      self.adjustKeyboardSize(KEYBOARD_CONSTANTS.SCALE_STEP);
    });
  }
};

VirtualKeyboard.prototype._setupGlobalEvents = function() {
  var self = this;
  
  // 인풋 필드 외부 클릭 시 키보드 숨김
  document.addEventListener('click', function(e) {
    var isLangToggle = e.target.closest('.key[data-key="한영"]');
    if (!self.input.contains(e.target) && 
        !self.overlay.contains(e.target) && 
        !isLangToggle) {
      self.hideKeyboard();
    }
  });
  
  // 인풋 변경 이벤트
  this.input.addEventListener('input', function() {
    if (self.ignoreInput) return;
    self.hangul.reset();
    self.output = self.input.value;
  });
  
  // ESC 키로 키보드 숨김
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      self.hideKeyboard();
      self.input.blur();
    }
  });
};

VirtualKeyboard.prototype.showKeyboard = function() {
  this.isVisible = true;
  this.overlay.classList.add(KEYBOARD_CONSTANTS.CLASSES.SHOW);
  this.positionKeyboard();
};

VirtualKeyboard.prototype.hideKeyboard = function() {
  this.isVisible = false;
  this.overlay.classList.remove(KEYBOARD_CONSTANTS.CLASSES.SHOW);
};

VirtualKeyboard.prototype.positionKeyboard = function() {
  if (this.align === 'center') {
    this._positionCenter();
  } else {
    this._positionAligned();
  }
};

VirtualKeyboard.prototype._positionCenter = function() {
  var inputRect = this.input.getBoundingClientRect();
  var inputCenterX = inputRect.left + inputRect.width / 2;
  this.overlay.style.left = inputCenterX + 'px';
  this.overlay.style.transform = 'translateX(-50%)';
  this.overlay.style.top = (inputRect.bottom + 2) + 'px';
};

VirtualKeyboard.prototype._positionAligned = function() {
  var inputRect = this.input.getBoundingClientRect();
  var inputLeft = inputRect.left;
  var inputWidth = inputRect.width;
  var overlayWidth = this.overlay.offsetWidth;
  
  var left = 0;
  if (this.align === 'left') {
    left = inputLeft;
  } else if (this.align === 'right') {
    left = inputLeft + inputWidth - overlayWidth;
  }
  
  // 뷰포트 범위를 벗어나지 않도록 보정
  var maxLeft = window.innerWidth - overlayWidth;
  if (left < 0) {
    left = 0;
  } else if (left > maxLeft) {
    left = maxLeft;
  }
  
  this.overlay.style.left = left + 'px';
  this.overlay.style.transform = 'translateX(0)';
  this.overlay.style.top = (inputRect.bottom + 2) + 'px';
};

VirtualKeyboard.prototype.render = function() {
  this.container.innerHTML = '';
  this.container.className = 'keyboard';
  
  // CSS 변수로 키보드 크기 및 폰트 크기 설정
  this.container.style.setProperty('--keyboard-scale', this.keyboardScale);
  this.container.style.setProperty('--keyboard-font-size', this.fontSize);
  
  this._renderKeyboard();
};

VirtualKeyboard.prototype._renderKeyboard = function() {
  var layout = KEYBOARD_LAYOUTS[this.lang];
  var self = this;
  
  layout.forEach(function(row) {
    var rowDiv = self._createKeyboardRow(row);
    self.container.appendChild(rowDiv);
  });
};

VirtualKeyboard.prototype._createKeyboardRow = function(row) {
  var rowDiv = createElement('div', { className: KEYBOARD_CONSTANTS.CLASSES.ROW });
  var self = this;
  
  row.forEach(function(key) {
    var keyBtn = self._createKeyButton(key);
    rowDiv.appendChild(keyBtn);
  });
  
  return rowDiv;
};

VirtualKeyboard.prototype._createKeyButton = function(key) {
  var keyBtn = createElement('button', { className: KEYBOARD_CONSTANTS.CLASSES.KEY });
  keyBtn.setAttribute('data-key', key);
  
  // 키 타입별 클래스 추가
  this._addKeyClasses(keyBtn, key);
  
  // 키 표시 텍스트 설정
  var displayText = this._getKeyDisplayText(key);
  keyBtn.textContent = displayText;
  
  // 클릭 이벤트 설정
  var self = this;
  keyBtn.onclick = function(e) {
    e.stopPropagation();
    self.handleKey(key);
  };
  
  return keyBtn;
};

VirtualKeyboard.prototype._addKeyClasses = function(keyBtn, key) {
  var classes = KEYBOARD_CONSTANTS.CLASSES;
  
  if (key === 'shift') {
    keyBtn.classList.add(classes.SHIFT);
    keyBtn.classList.toggle(classes.ACTIVE, this.isShift);
    if (this.isShiftLocked) {
      keyBtn.classList.add(classes.LOCKED);
    }
  }
  
  if (key === 'backspace') keyBtn.classList.add(classes.BACKSPACE);
  if (key === 'enter') keyBtn.classList.add(classes.ENTER);
  if (key === '한영') keyBtn.classList.add(classes.LANG_TOGGLE);
  if (/[0-9]/.test(key)) keyBtn.classList.add(classes.NUMBER);
  if (/[\-=\[\];',.\\/]/.test(key)) keyBtn.classList.add(classes.PUNCTUATION);
};

VirtualKeyboard.prototype._getKeyDisplayText = function(key) {
  if (key === 'space') return '␣';
  if (key === 'shift') return 'Shift';
  if (key === 'backspace') return '←';
  if (key === 'enter') return 'Enter';
  if (key === '한영') return this.lang === 'ko' ? 'En' : '한';
  
  if (this.isShift) {
    if (this.lang === 'ko' && HANGUL_COMBINATIONS.SHIFT_DOUBLE_CHO[key]) {
      return HANGUL_COMBINATIONS.SHIFT_DOUBLE_CHO[key];
    }
    if (SHIFT_SYMBOLS[key]) {
      return SHIFT_SYMBOLS[key];
    }
    if (this.lang === 'en' && /[a-z]/.test(key)) {
      return key.toUpperCase();
    }
  }
  
  return key;
};

VirtualKeyboard.prototype.handleKey = function(key) {
  switch (key) {
    case 'shift':
      this._handleShiftKey();
      break;
    case 'backspace':
      this._handleBackspaceKey();
      break;
    case 'enter':
      this._handleEnterKey();
      break;
    case '한영':
      this._handleLanguageToggleKey();
      break;
    default:
      this._handleRegularKey(key);
      break;
  }
  
  this._maintainKeyboardFocus();
};

VirtualKeyboard.prototype._handleShiftKey = function() {
  var currentTime = Date.now();
  var timeDiff = currentTime - this.lastShiftClickTime;
  
  // 더블 클릭 감지 (정의된 시간 임계값 이내)
  if (timeDiff < KEYBOARD_CONSTANTS.DOUBLE_CLICK_THRESHOLD && timeDiff > 0) {
    this.isShiftLocked = !this.isShiftLocked; // Shift 고정 상태 토글
    this.isShift = this.isShiftLocked; // Shift 고정 상태에 따라 Shift 활성화
  } else if (this.isShiftLocked) {
    // Shift가 이미 고정된 상태에서 단일 클릭 시 고정 해제
    this.isShiftLocked = false;
    this.isShift = false;
  } else {
    // 일반 단일 클릭: Shift 상태 토글
    this.isShift = !this.isShift;
  }
  
  this.lastShiftClickTime = currentTime; // 마지막 Shift 클릭 시간 업데이트
  this.render(); // Shift 상태 변경을 반영하기 위해 키보드 다시 렌더링
};

VirtualKeyboard.prototype._handleBackspaceKey = function() {
  if (this.lang === 'ko') {
    this._handleKoreanBackspace(); // 한글 모드 백스페이스 처리
  } else {
    this._handleEnglishBackspace(); // 영문 모드 백스페이스 처리
  }
};

VirtualKeyboard.prototype._handleKoreanBackspace = function() {
  var currentHangul = this.hangul.getCurrent(); // 현재 조합 중인 한글 글자 가져오기
  if (currentHangul) {
    // 조합 중인 한글이 있을 경우: 한글 조합 상태를 역순으로 제거
    if (this.hangul.jong) {
      this.hangul.jong = ''; // 종성 제거
    } else if (this.hangul.jung) {
      this.hangul.jung = ''; // 중성 제거
    } else if (this.hangul.cho && this.hangul.cho !== 'ㅇ') {
      this.hangul.cho = ''; // 초성 제거 (초성이 'ㅇ'이 아닐 때만, 'ㅇ'은 기본 초성이므로)
    } else {
      this.hangul.reset(); // 모든 조합 상태 초기화
    }
    // 입력 필드 업데이트: 기존 출력 + (새로 조합된 한글 또는 빈 문자열)
    this._updateInputValue(this.output + this.hangul.getCurrent());
  } else {
    // 조합 중인 한글이 없을 경우: 최종 출력 문자열에서 마지막 문자 제거
    if (this.output.length > 0) {
      this.output = this.output.slice(0, -1); // 출력 문자열에서 마지막 문자 제거
      this._updateInputValue(this.output);
    }
  }
};

VirtualKeyboard.prototype._handleEnglishBackspace = function() {
  // 영문 모드에서는 입력 필드의 마지막 문자 직접 제거
  if (this.input.value.length > 0) {
    this._updateInputValue(this.input.value.slice(0, -1));
  }
};

VirtualKeyboard.prototype._handleEnterKey = function() {
  if (this.lang === 'ko') {
    // 한글 모드: 현재 조합 중인 한글을 완성하고, 줄바꿈 문자 추가
    this.output += this.hangul.flush() + '\n';
    this._updateInputValue(this.output);
  } else {
    // 영문 모드: 입력 필드에 직접 줄바꿈 문자 추가
    this._updateInputValue(this.input.value + '\n');
  }
};

VirtualKeyboard.prototype._handleLanguageToggleKey = function() {
  var newLang = this.lang === 'ko' ? 'en' : 'ko'; // 현재 언어에 따라 전환할 새 언어 결정
  this.switchLanguage(newLang); // 언어 전환 처리
  
  // 언어 선택 드롭다운(존재한다면)의 값도 업데이트하여 UI 동기화
  var select = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.LANG_SELECT);
  if (select) {
    select.value = newLang;
  }
  
  var self = this;
  // 비동기적으로 키보드를 다시 표시하여 모든 UI 업데이트가 완료된 후 실행되도록 함
  setTimeout(function() {
    self.showKeyboard();
  }, 0);
};

VirtualKeyboard.prototype._handleRegularKey = function(key) {
  if (this.lang === 'ko') {
    this._handleKoreanInput(key); // 한글 입력 처리
  } else {
    this._handleEnglishInput(key); // 영문 입력 처리
  }
};

VirtualKeyboard.prototype._handleKoreanInput = function(key) {
  // 입력된 키가 숫자 또는 특수문자인지 확인
  if (/[0-9\-=\[\];',.\\/]/.test(key)) {
    var ch = key;
    // Shift가 활성화되어 있고 Shift-Symbol 조합이 가능한 경우
    if (this.isShift && SHIFT_SYMBOLS[key]) {
      ch = SHIFT_SYMBOLS[key];
    }
    this.output += this.hangul.flush(); // 현재 조합 중인 한글을 완성하여 출력 버퍼에 추가
    this.output += ch; // 숫자/특수문자를 출력 버퍼에 추가
    this._updateInputValue(this.output); // 입력 필드 업데이트
    this._handleShiftAfterInput(); // Shift 상태 정리
  } else {
    // 입력된 키가 한글 자음/모음인 경우
    if (this.isShift && key !== 'space') {
      // Shift가 활성화되어 있고 스페이스바가 아닌 경우: Shift + 자음 조합 시도 (예: ㅂ -> ㅃ)
      key = HANGUL_COMBINATIONS.SHIFT_DOUBLE_CHO[key] || key;
      // Shift가 고정되지 않은 상태라면 Shift 해제 및 키보드 다시 렌더링
      if (!this.isShiftLocked) {
        this.isShift = false;
        this.render();
      }
    }
    
    if (key === 'space') {
      this.output += this.hangul.flush() + ' '; // 한글 조합 완료 후 스페이스 추가
    } else {
      this.output += this.hangul.input(key); // 한글 입력기 로직에 따라 문자 처리 및 출력 버퍼 업데이트
    }
    // 입력 필드 업데이트: 기존 출력 + 현재 조합 중인 한글
    this._updateInputValue(this.output + this.hangul.getCurrent());
  }
};

VirtualKeyboard.prototype._handleEnglishInput = function(key) {
  if (key === 'space') {
    this._updateInputValue(this.input.value + ' '); // 스페이스바는 직접 추가
  } else {
    var ch = key;
    if (this.isShift) {
      // Shift가 활성화된 경우: 숫자/특수문자는 Shift-Symbol, 알파벳은 대문자로 변환
      if (SHIFT_SYMBOLS[key]) {
        ch = SHIFT_SYMBOLS[key];
      } else {
        ch = key.toUpperCase();
      }
    }
    this._updateInputValue(this.input.value + ch); // 변환된 문자 입력 필드에 추가
    this._handleShiftAfterInput(); // Shift 상태 정리
  }
};

VirtualKeyboard.prototype._handleShiftAfterInput = function() {
  // Shift가 활성화되어 있고 Shift Lock이 아닌 경우, Shift 상태를 해제하고 키보드를 다시 렌더링
  if (this.isShift && !this.isShiftLocked) {
    this.isShift = false;
    this.render();
  }
};

VirtualKeyboard.prototype._updateInputValue = function(value) {
  this.ignoreInput = true; // 입력 필드 변경 시 'input' 이벤트 리스너가 중복 처리하지 않도록 플래그 설정
  this.input.value = value; // 입력 필드 값 업데이트
  this.ignoreInput = false; // 플래그 해제
};

VirtualKeyboard.prototype._maintainKeyboardFocus = function() {
  this.input.focus(); // 입력 필드에 항상 포커스 유지
  // 키보드가 숨겨져 있다면 다시 표시
  if (!this.isVisible) {
    this.showKeyboard();
  }
};

VirtualKeyboard.prototype.switchLanguage = function(lang) {
  if (!KEYBOARD_LAYOUTS[lang]) return; // 유효하지 않은 언어 코드인 경우 종료
  
  if (this.lang === 'ko') {
    // 현재 한글 모드인 경우: 조합 중인 한글을 최종 완성하여 output에 추가
    this.output += this.hangul.flush();
    this.input.value = this.output;
  } else {
    // 현재 영문 모드인 경우: 기존 입력 필드의 값을 output에 저장 (한글 모드로 전환 시 조합 시작을 위함)
    this.output = this.input.value;
  }
  
  this.lang = lang; // 언어 설정 업데이트
  this.isShift = false; // 언어 전환 시 Shift 상태 초기화
  this.isShiftLocked = false; // Shift 고정 상태도 초기화
  this.render(); // 새 언어 레이아웃으로 키보드 다시 렌더링
  
  // 언어 전환 후 키보드 표시 상태 유지
  if (this.isVisible) {
    this.showKeyboard();
  }
};

VirtualKeyboard.prototype.setKeyboardSize = function(scale) {
  // 키보드 크기 배율을 허용된 최소/최대 범위로 제한
  scale = Math.max(KEYBOARD_CONSTANTS.MIN_SCALE, Math.min(KEYBOARD_CONSTANTS.MAX_SCALE, scale));
  this.keyboardScale = scale; // 현재 키보드 크기 배율 업데이트
  this.container.style.setProperty('--keyboard-scale', scale); // CSS 변수 업데이트
  this.container.style.setProperty('--keyboard-font-size', this.fontSize); // 폰트 크기 CSS 변수 업데이트
  
  // 크기 조절 UI (미니 컨트롤 및 메인 슬라이더)의 값 동기화
  this._syncSizeValues(scale);
};

VirtualKeyboard.prototype._syncSizeValues = function(scale) {
  var percentage = Math.round(scale * 100) + '%'; // 백분율 문자열 생성
  
  // 미니 크기 값 표시 업데이트
  var miniValue = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_VALUE_MINI);
  if (miniValue) miniValue.textContent = percentage;
  
  // 메인 크기 슬라이더 및 값 표시 업데이트
  var mainSlider = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_SLIDER);
  var mainValue = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_VALUE);
  if (mainSlider && mainValue) {
    mainSlider.value = Math.round(scale * 100); // 슬라이더 값 설정
    mainValue.textContent = percentage; // 값 표시 업데이트
  }
};

VirtualKeyboard.prototype.adjustKeyboardSize = function(delta) {
  // 현재 스케일에 델타 값을 더하여 새로운 스케일 계산 (백분율 기반)
  var newScale = this.keyboardScale * 100 + delta;
  this.setKeyboardSize(newScale / 100); // 새로운 스케일 적용
};

VirtualKeyboard.prototype.resetInput = function() {
  // 한글 입력기 상태 초기화 (초성, 중성, 종성)
  this.hangul.reset();
  // 최종 출력 버퍼 초기화
  this.output = '';
  // 입력 필드 내용 초기화
  this._updateInputValue('');
  // Shift 상태 (활성화 여부, 고정 여부) 초기화
  this.isShift = false;
  this.isShiftLocked = false;
  // 변경된 Shift 상태를 반영하여 키보드 다시 렌더링
  this.render();
  // 입력 필드에 포커스 재설정
  this.input.focus();
};

// ==================== 초기화 함수 ====================

/**
 * VirtualKeyboard 초기화 함수
 * @param {string} inputId - 대상 인풋 요소 ID
 * @param {Object} options - 설정 옵션
 * @returns {VirtualKeyboard} 키보드 인스턴스
 */
function initVirtualKeyboard(inputId, options) {
  options = options || {};
  var config = {
    lang: options.lang || 'en',
    showControls: options.showControls || false,
    align: options.align || 'center',
    fontSize: options.fontSize || '1.0rem'
  };
  
  // controls 표시/숨김 설정
  var controls = document.querySelector('.controls');
  if (controls) {
    controls.style.display = config.showControls ? 'flex' : 'none';
  }
  
  try {
    var keyboard = new VirtualKeyboard(inputId, config);
    _setupExternalControls(keyboard, config.lang);
    return keyboard;
  } catch (error) {
    console.error('Failed to initialize virtual keyboard:', error);
    return null;
  }
}

/**
 * 외부 컨트롤 요소들 설정
 * @param {VirtualKeyboard} keyboard - 키보드 인스턴스
 * @param {string} initialLang - 초기 언어
 */
function _setupExternalControls(keyboard, initialLang) {
  var select = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.LANG_SELECT);
  var sizeSlider = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_SLIDER);
  var sizeValue = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_VALUE);
  
  // 언어 선택 드롭다운 이벤트
  if (select) {
    select.value = initialLang;
    select.addEventListener('change', function(e) {
      keyboard.switchLanguage(e.target.value);
      if (!keyboard.isVisible) {
        keyboard.showKeyboard();
      }
      keyboard.input.focus();
    });
  }
  
  // 크기 조정 슬라이더 이벤트 (메인 컨트롤)
  if (sizeSlider && sizeValue) {
    sizeSlider.addEventListener('input', function(e) {
      var scale = e.target.value / 100;
      keyboard.setKeyboardSize(scale);
    });
    // 초기 크기 값 설정
    sizeValue.textContent = sizeSlider.value + '%';
  }
  
  var miniValue = safeGetElement(KEYBOARD_CONSTANTS.SELECTORS.SIZE_VALUE_MINI);
  if (miniValue) {
    miniValue.textContent = sizeSlider ? sizeSlider.value + '%' : '100%';
  }
}
