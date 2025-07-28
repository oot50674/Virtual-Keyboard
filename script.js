const layouts = {
    en: [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m'],
        ['space']
    ],
    ko: [
        ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
        ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
        ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
        ['space']
    ]
};

class VirtualKeyboard {
    constructor(input, container, lang = 'en') {
        this.input = input;
        this.container = container;
        this.lang = lang;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.container.className = 'keyboard';
        const layout = layouts[this.lang];
        layout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            row.forEach(key => {
                const keyBtn = document.createElement('button');
                keyBtn.className = 'key';
                keyBtn.textContent = key === 'space' ? '␣' : key;
                keyBtn.onclick = () => this.handleKey(key);
                rowDiv.appendChild(keyBtn);
            });
            this.container.appendChild(rowDiv);
        });
    }

    handleKey(key) {
        if (key === 'space') {
            this.input.value += ' ';
        } else {
            this.input.value += key;
        }
        this.input.focus();
    }

    switchLanguage(lang) {
        if (layouts[lang]) {
            this.lang = lang;
            this.render();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const container = document.getElementById('keyboard');
    const select = document.getElementById('lang-select');
    const keyboard = new VirtualKeyboard(input, container, select.value);

    select.addEventListener('change', e => {
        keyboard.switchLanguage(e.target.value);
    });
});

