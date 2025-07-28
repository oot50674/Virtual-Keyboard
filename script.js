const layouts = {
  en: [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['shift','z','x','c','v','b','n','m'],
    ['space']
  ],
  ko: [
    ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
    ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
    ['shift','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
    ['space']
  ]
};

const CHO = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ',
  'ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];
const JUNG = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ',
  'ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
];
const JONG = [
  '', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ',
  'ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ',
  'ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

const CHO_MAP = Object.fromEntries(CHO.map((c,i)=>[c,i]));
const JUNG_MAP = Object.fromEntries(JUNG.map((c,i)=>[c,i]));
const JONG_MAP = Object.fromEntries(JONG.map((c,i)=>[c,i]));

const DOUBLE_CHO = {
  'ㄱㄱ':'ㄲ','ㄷㄷ':'ㄸ','ㅂㅂ':'ㅃ','ㅅㅅ':'ㅆ','ㅈㅈ':'ㅉ'
};
const DOUBLE_JUNG = {
  'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ',
  'ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'
};
const DOUBLE_JONG = {
  'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ',
  'ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ',
  'ㅂㅅ':'ㅄ'
};
const SHIFT_DOUBLE_CHO = {
  'ㅂ':'ㅃ','ㅈ':'ㅉ','ㄷ':'ㄸ','ㄱ':'ㄲ','ㅅ':'ㅆ'
};
const SPLIT_JONG = {
  'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],
  'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],
  'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],
  'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ']
};

function composeHangul(cho,jung,jong='') {
  const ci=CHO_MAP[cho];
  const ji=JUNG_MAP[jung];
  const ti=JONG_MAP[jong]||0;
  if(ci==null||ji==null) return cho+jung+jong;
  return String.fromCharCode(0xAC00 + ci*21*28 + ji*28 + ti);
}

class HangulIME {
  constructor(){ this.reset(); }
  reset(){ this.cho=''; this.jung=''; this.jong=''; }
  getCurrent(){
    if(!this.jung && !this.cho) return '';
    if(!this.jung) return this.cho;
    return composeHangul(this.cho||'ㅇ',this.jung,this.jong);
  }
  flush(){ const out=this.getCurrent(); this.reset(); return out; }
  input(ch){
    let out='';
    const isVowel=JUNG.includes(ch);
    if(isVowel){
      if(!this.jung){
        if(!this.cho) this.cho='ㅇ';
        this.jung=ch;
      }else if(!this.jong){
        const comb=DOUBLE_JUNG[this.jung+ch];
        if(comb){
          this.jung=comb;
        }else{
          out+=this.flush();
          this.cho='ㅇ';
          this.jung=ch;
        }
      }else{
        const split=SPLIT_JONG[this.jong];
        if(split){
          this.jong=split[0];
          out+=this.flush();
          this.cho=split[1];
        }else{
          const last=this.jong;
          this.jong='';
          out+=this.flush();
          this.cho=last;
        }
        this.jung=ch;
      }
    }else{
      if(!this.jung){
        if(!this.cho){
          this.cho=ch;
        }else{
          const comb=DOUBLE_CHO[this.cho+ch];
          if(comb){
            this.cho=comb;
          }else{
            out+=this.flush();
            this.cho=ch;
          }
        }
      }else if(!this.jong){
        this.jong=ch;
      }else{
        const comb=DOUBLE_JONG[this.jong+ch];
        if(comb){
          this.jong=comb;
        }else{
          out+=this.flush();
          this.cho=ch;
        }
      }
    }
    return out;
  }
}

class VirtualKeyboard {
  constructor(input,container,lang='en'){
    this.input=input;
    this.container=container;
    this.lang=lang;
    this.hangul=new HangulIME();
    this.isShift=false;
    this.ignoreInput=false;
    this.output='';
    this.render();
    this.input.addEventListener('input',()=>{
      if(this.ignoreInput) return;
      this.hangul.reset();
      this.output=this.input.value;
    });
  }
  render(){
    this.container.innerHTML='';
    this.container.className='keyboard';
    const layout=layouts[this.lang];
    layout.forEach(row=>{
      const rowDiv=document.createElement('div');
      rowDiv.className='row';
      row.forEach(key=>{
        const keyBtn=document.createElement('button');
        keyBtn.className='key';
        if(key==='shift') keyBtn.classList.add('shift');
        keyBtn.textContent=key==='space'?'␣':key==='shift'?'Shift':key;
        keyBtn.onclick=()=>this.handleKey(key);
        rowDiv.appendChild(keyBtn);
      });
      this.container.appendChild(rowDiv);
    });
  }
  handleKey(key){
    if(key==='shift'){
      this.isShift=!this.isShift;
      this.container.querySelectorAll('.key.shift').forEach(btn=>{
        btn.classList.toggle('active',this.isShift);
      });
      return;
    }
    if(this.lang==='ko'){
      if(this.isShift && key!=='space'){
        key=SHIFT_DOUBLE_CHO[key]||key;
        this.isShift=false;
        this.container.querySelectorAll('.key.shift').forEach(btn=>btn.classList.remove('active'));
      }
      if(key==='space'){
        this.output+=this.hangul.flush()+' ';
      }else{
        this.output+=this.hangul.input(key);
      }
      this.ignoreInput=true;
      this.input.value=this.output+this.hangul.getCurrent();
      this.ignoreInput=false;
    }else{
      if(key==='space'){
        this.ignoreInput=true;
        this.input.value+=' ';
        this.ignoreInput=false;
      }else{
        const ch=this.isShift?key.toUpperCase():key;
        this.ignoreInput=true;
        this.input.value+=ch;
        this.ignoreInput=false;
        if(this.isShift){
          this.isShift=false;
          this.container.querySelectorAll('.key.shift').forEach(btn=>btn.classList.remove('active'));
        }
      }
    }
    this.input.focus();
  }
  switchLanguage(lang){
    if(layouts[lang]){
      if(this.lang==='ko'){
        this.output+=this.hangul.flush();
        this.input.value=this.output;
      }
      this.lang=lang;
      this.render();
    }
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('input');
  const container=document.getElementById('keyboard');
  const select=document.getElementById('lang-select');
  const keyboard=new VirtualKeyboard(input,container,select.value);
  select.addEventListener('change',e=>{
    keyboard.switchLanguage(e.target.value);
  });
});
