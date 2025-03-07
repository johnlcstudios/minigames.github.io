// Theme Management
const themeToggle = document.createElement('div');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = `
    <label class="switch">
        <input type="checkbox" id="themeSwitch">
        <span class="slider"></span>
    </label>
`;

// Insert theme toggle into the document
document.body.insertBefore(themeToggle, document.body.firstChild);

// Add theme toggle styles
const style = document.createElement('style');
style.textContent = `
    .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--md-sys-color-surface-container);
        transition: .4s;
        border-radius: 34px;
        border: 2px solid var(--md-sys-color-outline);
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 2px;
        background-color: var(--md-sys-color-primary);
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--md-sys-color-primary-container);
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    [data-theme="dark"] {
        --md-sys-color-primary: #D0BCFF;
        --md-sys-color-on-primary: #381E72;
        --md-sys-color-primary-container: #4F378B;
        --md-sys-color-on-primary-container: #EADDFF;
        --md-sys-color-surface: #1C1B1F;
        --md-sys-color-on-surface: #E6E1E5;
        --md-sys-color-surface-container: #2B2930;
        --md-sys-color-outline: #938F99;
    }
`;
document.head.appendChild(style);

// Theme toggle functionality
const themeSwitch = document.getElementById('themeSwitch');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';
}

// Theme switch handler
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Add event listener for theme switch
themeSwitch.addEventListener('change', switchTheme);