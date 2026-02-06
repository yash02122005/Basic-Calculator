// ===== ADVANCED CALCULATOR ENGINE =====
class AdvancedCalculator {
    constructor() {
        // Calculator State
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForNewOperand = false;
        this.memory = 0;
        this.history = [];
        this.MAX_DIGITS = 16;
        
        // Settings
        this.settings = {
            sound: true,
            volume: 0.5,
            theme: 'light',
            commas: true,
            decimalPlaces: 4,
            scientificNotation: true,
            chainCalculations: true,
            autoDecimal: true,
            angleUnit: 'deg',
            saveHistory: true,
            historyLimit: 20,
            buttonAnimation: 'scale',
            displayAnimation: 'fade',
            performanceMode: 'balanced'
        };
        
        // Mode state
        this.currentMode = 'standard';
        this.isDegreeMode = true;
        
        // Audio
        this.audioContext = null;
        this.clickSound = document.getElementById('clickSound');
        this.equalsSound = document.getElementById('equalsSound');
        this.errorSound = document.getElementById('errorSound');
        
        // Initialize
        this.initializeElements();
        this.loadSettings();
        this.initAudio();
        this.bindEvents();
        this.updateDisplay();
        this.updateTime();
        this.setMode('standard');
        
        // Update time every minute
        setInterval(() => this.updateTime(), 60000);
    }
    
    initializeElements() {
        // Display elements
        this.display = document.getElementById('currentDisplay');
        this.historyPreview = document.getElementById('historyPreview');
        this.memoryValueElement = document.getElementById('memoryValue');
        this.memoryStatus = document.getElementById('memoryStatus');
        this.currentModeElement = document.getElementById('currentMode');
        this.calcCount = document.getElementById('calcCount');
        this.currentTime = document.getElementById('currentTime');
        
        // Calculator modes
        this.standardCalc = document.getElementById('standardCalculator');
        this.scientificCalc = document.getElementById('scientificCalculator');
        this.converterCalc = document.getElementById('converterCalculator');
        this.historyCalc = document.getElementById('historyCalculator');
        
        // Mode tabs
        this.modeTabs = document.querySelectorAll('.mode-tab');
        
        // Buttons
        this.equalsBtn = document.getElementById('equalsBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.menuToggle = document.getElementById('menuToggle');
        
        // Settings panel
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.closePanel = document.getElementById('closePanel');
        
        // Unit converter
        this.converterType = document.getElementById('converterType');
        this.fromValue = document.getElementById('fromValue');
        this.fromUnit = document.getElementById('fromUnit');
        this.toValue = document.getElementById('toValue');
        this.toUnit = document.getElementById('toUnit');
        this.swapUnits = document.getElementById('swapUnits');
        this.useInCalc = document.getElementById('useInCalc');
        this.swapValues = document.getElementById('swapValues');
        
        // History
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    bindEvents() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', () => this.inputNumber(btn.dataset.number));
        });
        
        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.inputOperator(btn.dataset.operator));
        });
        
        // Action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
        });
        
        // Function buttons
        document.querySelectorAll('[data-func]').forEach(btn => {
            btn.addEventListener('click', () => this.handleFunction(btn.dataset.func));
        });
        
        // Equals button
        this.equalsBtn.addEventListener('click', () => this.calculate());
        
        // Mode tabs
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                this.setMode(mode);
                this.playSound('click');
            });
        });
        
        // Sound toggle
        this.soundToggle.addEventListener('click', () => {
            this.toggleSound();
            this.playSound('click');
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.cycleTheme();
            this.playSound('click');
        });
        
        // Menu toggle
        this.menuToggle.addEventListener('click', () => {
            this.toggleSettings();
            this.playSound('click');
        });
        
        // Settings panel
        this.closePanel.addEventListener('click', () => {
            this.closeSettings();
            this.playSound('click');
        });
        
        this.settingsOverlay.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Settings controls
        this.bindSettingsEvents();
        
        // Unit converter
        this.bindConverterEvents();
        
        // History
        this.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Clear all calculation history?')) {
                this.clearHistory();
                this.playSound('click');
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Escape key to close settings
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.settingsPanel.classList.contains('active')) {
                    this.closeSettings();
                } else if (this.currentMode === 'converter' || this.currentMode === 'history') {
                    this.setMode('standard');
                } else {
                    this.clearAll();
                }
                e.preventDefault();
            }
        });
        
        // Click on history items
        this.historyList.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const result = historyItem.dataset.result;
                if (result) {
                    this.currentOperand = result;
                    this.updateDisplay();
                    this.playSound('click');
                }
            }
        });
    }
    
    bindSettingsEvents() {
        // Sound enabled
        const soundEnabled = document.getElementById('soundEnabled');
        if (soundEnabled) {
            soundEnabled.checked = this.settings.sound;
            soundEnabled.addEventListener('change', (e) => {
                this.settings.sound = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Volume level
        const volumeLevel = document.getElementById('volumeLevel');
        if (volumeLevel) {
            volumeLevel.value = this.settings.volume * 100;
            volumeLevel.addEventListener('input', (e) => {
                this.settings.volume = e.target.value / 100;
                this.saveSettings();
            });
        }
        
        // Thousands separator
        const thousandsSeparator = document.getElementById('thousandsSeparator');
        if (thousandsSeparator) {
            thousandsSeparator.checked = this.settings.commas;
            thousandsSeparator.addEventListener('change', (e) => {
                this.settings.commas = e.target.checked;
                this.saveSettings();
                this.updateDisplay();
            });
        }
        
        // Decimal places
        const decimalPlaces = document.getElementById('decimalPlaces');
        if (decimalPlaces) {
            decimalPlaces.value = this.settings.decimalPlaces;
            decimalPlaces.addEventListener('change', (e) => {
                this.settings.decimalPlaces = parseInt(e.target.value);
                this.saveSettings();
            });
        }
        
        // Scientific notation
        const scientificNotation = document.getElementById('scientificNotation');
        if (scientificNotation) {
            scientificNotation.checked = this.settings.scientificNotation;
            scientificNotation.addEventListener('change', (e) => {
                this.settings.scientificNotation = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Chain calculations
        const chainCalculations = document.getElementById('chainCalculations');
        if (chainCalculations) {
            chainCalculations.checked = this.settings.chainCalculations;
            chainCalculations.addEventListener('change', (e) => {
                this.settings.chainCalculations = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Angle unit
        const angleUnit = document.getElementById('angleUnit');
        if (angleUnit) {
            angleUnit.value = this.settings.angleUnit;
            angleUnit.addEventListener('change', (e) => {
                this.settings.angleUnit = e.target.value;
                this.isDegreeMode = e.target.value === 'deg';
                this.saveSettings();
            });
        }
        
        // Button animation
        const buttonAnimation = document.getElementById('buttonAnimation');
        if (buttonAnimation) {
            buttonAnimation.value = this.settings.buttonAnimation;
            buttonAnimation.addEventListener('change', (e) => {
                this.settings.buttonAnimation = e.target.value;
                this.saveSettings();
            });
        }
        
        // Display animation
        const displayAnimation = document.getElementById('displayAnimation');
        if (displayAnimation) {
            displayAnimation.value = this.settings.displayAnimation;
            displayAnimation.addEventListener('change', (e) => {
                this.settings.displayAnimation = e.target.value;
                this.saveSettings();
            });
        }
        
        // Theme cards
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                this.setTheme(theme);
                this.playSound('click');
                
                // Update active card
                document.querySelectorAll('.theme-card').forEach(c => {
                    c.classList.toggle('active', c === card);
                });
            });
        });
        
        // Reset settings
        const resetSettings = document.getElementById('resetSettings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                if (confirm('Reset all settings to defaults?')) {
                    this.resetSettings();
                    this.playSound('click');
                }
            });
        }
        
        // Clear all data
        const clearAllData = document.getElementById('clearAllData');
        if (clearAllData) {
            clearAllData.addEventListener('click', () => {
                if (confirm('Clear all calculator data including history and memory?')) {
                    this.clearAllData();
                    this.playSound('click');
                }
            });
        }
    }
    
    bindConverterEvents() {
        if (!this.converterType) return;
        
        this.converterType.addEventListener('change', () => {
            this.updateConverterUnits();
            this.convertUnits();
            this.playSound('click');
        });
        
        this.fromValue.addEventListener('input', () => {
            this.convertUnits();
        });
        
        this.fromUnit.addEventListener('change', () => {
            this.convertUnits();
            this.playSound('click');
        });
        
        this.toUnit.addEventListener('change', () => {
            this.convertUnits();
            this.playSound('click');
        });
        
        this.swapUnits.addEventListener('click', () => {
            this.swapConverterUnits();
            this.playSound('click');
        });
        
        this.useInCalc.addEventListener('click', () => {
            this.useConverterResult();
            this.playSound('click');
        });
        
        this.swapValues.addEventListener('click', () => {
            this.swapConverterValues();
            this.playSound('click');
        });
    }
    
    // ===== INPUT HANDLING =====
    inputNumber(num) {
        this.playSound('click');
        
        if (this.waitingForNewOperand) {
            this.currentOperand = num === '.' ? '0.' : num;
            this.waitingForNewOperand = false;
        } else {
            // Check digit limit
            if (this.currentOperand.replace(/[^0-9]/g, '').length >= this.MAX_DIGITS) {
                return;
            }
            
            if (num === '.') {
                // Only add decimal if not already present
                if (!this.currentOperand.includes('.')) {
                    this.currentOperand += '.';
                }
            } else {
                // Replace leading zero, but keep zero before decimal
                if (this.currentOperand === '0' || this.currentOperand === '-0') {
                    this.currentOperand = this.currentOperand === '-0' ? '-' + num : num;
                } else {
                    this.currentOperand += num;
                }
            }
        }
        
        this.updateDisplay();
    }
    
    inputOperator(op) {
        this.playSound('click');
        
        if (this.operation && !this.waitingForNewOperand) {
            this.calculate();
        }
        
        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.waitingForNewOperand = true;
        this.updateDisplay();
    }
    
    handleAction(action) {
        this.playSound('click');
        
        switch(action) {
            case 'clear-all':
                this.clearAll();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'plus-minus':
                this.toggleSign();
                break;
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'm+':
                this.memoryAdd();
                break;
            case 'm-':
                this.memorySubtract();
                break;
        }
        
        this.updateDisplay();
    }
    
    handleFunction(func) {
        this.playSound('click');
        const value = parseFloat(this.currentOperand) || 0;
        let result;
        
        try {
            switch(func) {
                case 'sqrt':
                    if (value < 0) throw new Error('Invalid input');
                    result = Math.sqrt(value);
                    break;
                case 'power':
                    result = Math.pow(value, 2);
                    break;
                case 'percent':
                    result = value / 100;
                    break;
                case 'inverse':
                    if (value === 0) throw new Error('Cannot divide by zero');
                    result = 1 / value;
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'factorial':
                    if (value < 0 || !Number.isInteger(value)) throw new Error('Invalid input');
                    result = this.factorial(value);
                    break;
                    
                // Trigonometric functions
                case 'sin':
                    result = Math.sin(this.toRadians(value));
                    break;
                case 'cos':
                    result = Math.cos(this.toRadians(value));
                    break;
                case 'tan':
                    result = Math.tan(this.toRadians(value));
                    break;
                case 'asin':
                    result = this.fromRadians(Math.asin(value));
                    break;
                case 'acos':
                    result = this.fromRadians(Math.acos(value));
                    break;
                case 'atan':
                    result = this.fromRadians(Math.atan(value));
                    break;
                    
                // Logarithmic functions
                case 'log':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log(value);
                    break;
                case 'exp':
                    result = Math.exp(value);
                    break;
                case 'log2':
                    if (value <= 0) throw new Error('Invalid input');
                    result = Math.log2(value);
                    break;
                case 'pow10':
                    result = Math.pow(10, value);
                    break;
                    
                // Advanced functions
                case 'abs':
                    result = Math.abs(value);
                    break;
                case 'floor':
                    result = Math.floor(value);
                    break;
                case 'ceil':
                    result = Math.ceil(value);
                    break;
                case 'round':
                    result = Math.round(value);
                    break;
                case 'rand':
                    result = Math.random();
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'deg':
                    this.isDegreeMode = true;
                    result = value;
                    break;
                case 'rad':
                    this.isDegreeMode = false;
                    result = value;
                    break;
                case 'hypot':
                    result = Math.hypot(value, this.previousOperand || 0);
                    break;
                case 'mod':
                    if (this.previousOperand === '') throw new Error('Missing second operand');
                    result = parseFloat(this.previousOperand) % value;
                    break;
                    
                default:
                    return;
            }
            
            this.currentOperand = this.formatResult(result);
            this.addToHistory(`${func}(${this.formatDisplay(value)})`, this.currentOperand);
            this.updateDisplay();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    toRadians(degrees) {
        return this.isDegreeMode ? degrees * Math.PI / 180 : degrees;
    }
    
    fromRadians(radians) {
        return this.isDegreeMode ? radians * 180 / Math.PI : radians;
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    calculate() {
        if (!this.operation || this.waitingForNewOperand) {
            return;
        }
        
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        let result;
        
        if (isNaN(prev) || isNaN(current)) {
            return;
        }
        
        try {
            switch(this.operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) throw new Error('Cannot divide by zero');
                    result = prev / current;
                    break;
                default:
                    return;
            }
            
            result = Math.round(result * 100000000) / 100000000;
            this.currentOperand = this.formatResult(result);
            
            this.addToHistory(
                `${this.formatDisplay(prev)} ${this.operation} ${this.formatDisplay(current)}`,
                this.currentOperand
            );
            
            if (this.settings.chainCalculations) {
                this.previousOperand = this.currentOperand;
                this.waitingForNewOperand = true;
            } else {
                this.operation = null;
                this.previousOperand = '';
                this.waitingForNewOperand = true;
            }
            
            this.updateDisplay();
            this.playSound('equals');
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // ===== DISPLAY FUNCTIONS =====
    formatResult(num) {
        // Handle special values
        if (!isFinite(num)) {
            return num > 0 ? 'Infinity' : '-Infinity';
        }
        
        if (isNaN(num)) {
            return 'NaN';
        }
        
        // Handle very large/small numbers with scientific notation
        const absNum = Math.abs(num);
        if (this.settings.scientificNotation && 
            (absNum > 1e12 || (absNum < 1e-6 && absNum > 0))) {
            return num.toPrecision(8);
        }
        
        // Round to specified decimal places
        let rounded;
        if (this.settings.decimalPlaces === 'auto') {
            rounded = parseFloat(num.toFixed(12));
        } else {
            const decimalPlaces = parseInt(this.settings.decimalPlaces);
            rounded = parseFloat(num.toFixed(decimalPlaces));
        }
        
        // Convert to string and remove trailing zeros
        let str = rounded.toString();
        if (str.includes('.')) {
            str = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
        }
        
        // Check if still too long
        if (str.replace(/[^0-9]/g, '').length > this.MAX_DIGITS) {
            return num.toPrecision(10);
        }
        
        return str;
    }
    
    formatDisplay(num) {
        if (num === '' || num === undefined || num === null) return '';
        
        const numStr = num.toString();
        
        // Handle scientific notation
        if (numStr.includes('e')) {
            return numStr;
        }
        
        if (!this.settings.commas) {
            return numStr;
        }
        
        const [integerPart, decimalPart] = numStr.split('.');
        
        // Format integer part with commas
        let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        if (decimalPart !== undefined) {
            return `${formattedInteger}.${decimalPart}`;
        }
        
        return formattedInteger;
    }
    
    updateDisplay() {
        // Update main display
        this.display.textContent = this.formatDisplay(this.currentOperand);
        
        // Update history preview
        if (this.previousOperand && this.operation) {
            this.historyPreview.textContent = 
                `${this.formatDisplay(this.previousOperand)} ${this.operation}`;
        } else {
            this.historyPreview.textContent = '';
        }
        
        // Update memory display
        this.memoryValueElement.textContent = this.formatDisplay(this.memory.toString());
        this.memoryStatus.textContent = this.formatDisplay(this.memory.toString());
        
        // Add animation class if enabled
        if (this.settings.displayAnimation !== 'none') {
            this.display.classList.add('updated');
            setTimeout(() => this.display.classList.remove('updated'), 300);
        }
        
        // Update calculation count
        this.calcCount.textContent = this.history.length;
        
        // Save to localStorage
        this.saveToLocalStorage();
    }
    
    // ===== CALCULATOR FUNCTIONS =====
    clearAll() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.waitingForNewOperand = false;
        this.updateDisplay();
        this.playSound('click');
    }
    
    clearEntry() {
        this.currentOperand = '0';
        this.updateDisplay();
        this.playSound('click');
    }
    
    backspace() {
        if (this.currentOperand.length > 1) {
            this.currentOperand = this.currentOperand.slice(0, -1);
            if (this.currentOperand === '-') {
                this.currentOperand = '0';
            }
        } else {
            this.currentOperand = '0';
        }
        this.updateDisplay();
        this.playSound('click');
    }
    
    toggleSign() {
        if (this.currentOperand !== '0') {
            if (this.currentOperand.startsWith('-')) {
                this.currentOperand = this.currentOperand.slice(1);
            } else {
                this.currentOperand = '-' + this.currentOperand;
            }
            this.updateDisplay();
            this.playSound('click');
        }
    }
    
    memoryClear() {
        this.memory = 0;
        this.updateDisplay();
        this.playSound('click');
    }
    
    memoryRecall() {
        this.currentOperand = this.memory.toString();
        this.updateDisplay();
        this.playSound('click');
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentOperand) || 0;
        this.updateDisplay();
        this.playSound('click');
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentOperand) || 0;
        this.updateDisplay();
        this.playSound('click');
    }
    
    showError(message) {
        const originalValue = this.currentOperand;
        this.display.textContent = 'Error';
        this.historyPreview.textContent = message;
        this.display.classList.add('error');
        
        this.playSound('error');
        
        setTimeout(() => {
            this.clearAll();
            this.historyPreview.textContent = '';
            this.display.classList.remove('error');
        }, 2000);
    }
    
    // ===== HISTORY FUNCTIONS =====
    addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            displayResult: this.formatDisplay(result)
        };
        
        this.history.unshift(historyItem);
        
        // Limit history
        const limit = this.settings.historyLimit === 'unlimited' ? 
            Infinity : parseInt(this.settings.historyLimit);
        if (this.history.length > limit) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveHistory();
    }
    
    updateHistoryDisplay() {
        const container = this.historyList;
        
        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <h4>No Calculations Yet</h4>
                    <p>Perform some calculations to see them here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.history.map(item => `
            <div class="history-item new" data-result="${item.result}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.displayResult}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');
        
        // Remove new class after animation
        setTimeout(() => {
            document.querySelectorAll('.history-item.new').forEach(item => {
                item.classList.remove('new');
            });
        }, 400);
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        localStorage.removeItem('calculatorHistory');
    }
    
    // ===== UNIT CONVERTER =====
    updateConverterUnits() {
        const type = this.converterType.value;
        const units = this.getUnitsForType(type);
        
        // Clear current options
        this.fromUnit.innerHTML = '';
        this.toUnit.innerHTML = '';
        
        // Add new options
        units.forEach(unit => {
            const fromOption = document.createElement('option');
            fromOption.value = unit.value;
            fromOption.textContent = unit.label;
            this.fromUnit.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = unit.value;
            toOption.textContent = unit.label;
            this.toUnit.appendChild(toOption);
        });
        
        // Set default "to" unit to second option
        if (units.length > 1) {
            this.toUnit.selectedIndex = 1;
        }
    }
    
    getUnitsForType(type) {
        const units = {
            length: [
                { value: 'meter', label: 'Meter (m)', factor: 1 },
                { value: 'kilometer', label: 'Kilometer (km)', factor: 1000 },
                { value: 'centimeter', label: 'Centimeter (cm)', factor: 0.01 },
                { value: 'millimeter', label: 'Millimeter (mm)', factor: 0.001 },
                { value: 'mile', label: 'Mile (mi)', factor: 1609.34 },
                { value: 'yard', label: 'Yard (yd)', factor: 0.9144 },
                { value: 'foot', label: 'Foot (ft)', factor: 0.3048 },
                { value: 'inch', label: 'Inch (in)', factor: 0.0254 }
            ],
            weight: [
                { value: 'kilogram', label: 'Kilogram (kg)', factor: 1 },
                { value: 'gram', label: 'Gram (g)', factor: 0.001 },
                { value: 'milligram', label: 'Milligram (mg)', factor: 0.000001 },
                { value: 'pound', label: 'Pound (lb)', factor: 0.453592 },
                { value: 'ounce', label: 'Ounce (oz)', factor: 0.0283495 }
            ],
            temperature: [
                { value: 'celsius', label: 'Celsius (°C)' },
                { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                { value: 'kelvin', label: 'Kelvin (K)' }
            ],
            area: [
                { value: 'sqmeter', label: 'Square Meter (m²)', factor: 1 },
                { value: 'sqkilometer', label: 'Square Kilometer (km²)', factor: 1000000 },
                { value: 'sqmile', label: 'Square Mile (mi²)', factor: 2590000 },
                { value: 'acre', label: 'Acre', factor: 4046.86 },
                { value: 'hectare', label: 'Hectare (ha)', factor: 10000 }
            ],
            volume: [
                { value: 'liter', label: 'Liter (L)', factor: 1 },
                { value: 'milliliter', label: 'Milliliter (mL)', factor: 0.001 },
                { value: 'gallon', label: 'Gallon (gal)', factor: 3.78541 },
                { value: 'quart', label: 'Quart (qt)', factor: 0.946353 },
                { value: 'pint', label: 'Pint (pt)', factor: 0.473176 },
                { value: 'cup', label: 'Cup', factor: 0.236588 }
            ],
            time: [
                { value: 'second', label: 'Second (s)', factor: 1 },
                { value: 'minute', label: 'Minute (min)', factor: 60 },
                { value: 'hour', label: 'Hour (hr)', factor: 3600 },
                { value: 'day', label: 'Day (day)', factor: 86400 },
                { value: 'week', label: 'Week (week)', factor: 604800 }
            ],
            speed: [
                { value: 'mps', label: 'Meters per Second (m/s)', factor: 1 },
                { value: 'kph', label: 'Kilometers per Hour (km/h)', factor: 0.277778 },
                { value: 'mph', label: 'Miles per Hour (mph)', factor: 0.44704 },
                { value: 'knot', label: 'Knots (kn)', factor: 0.514444 }
            ],
            data: [
                { value: 'byte', label: 'Byte (B)', factor: 1 },
                { value: 'kilobyte', label: 'Kilobyte (KB)', factor: 1024 },
                { value: 'megabyte', label: 'Megabyte (MB)', factor: 1048576 },
                { value: 'gigabyte', label: 'Gigabyte (GB)', factor: 1073741824 },
                { value: 'terabyte', label: 'Terabyte (TB)', factor: 1099511627776 }
            ]
        };
        
        return units[type] || units.length;
    }
    
    convertUnits() {
        const type = this.converterType.value;
        const fromValue = parseFloat(this.fromValue.value) || 0;
        const fromUnit = this.fromUnit.value;
        const toUnit = this.toUnit.value;
        
        if (type === 'temperature') {
            this.convertTemperature(fromValue, fromUnit, toUnit);
        } else {
            this.convertRegular(fromValue, fromUnit, toUnit, type);
        }
    }
    
    convertRegular(value, fromUnit, toUnit, type) {
        const units = this.getUnitsForType(type);
        const fromUnitData = units.find(u => u.value === fromUnit);
        const toUnitData = units.find(u => u.value === toUnit);
        
        if (!fromUnitData || !toUnitData) return;
        
        const baseValue = value * fromUnitData.factor;
        const result = baseValue / toUnitData.factor;
        
        this.toValue.value = parseFloat(result.toFixed(10));
    }
    
    convertTemperature(value, fromUnit, toUnit) {
        let celsius;
        
        // Convert to Celsius first
        switch(fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }
        
        // Convert from Celsius to target unit
        let result;
        switch(toUnit) {
            case 'celsius':
                result = celsius;
                break;
            case 'fahrenheit':
                result = (celsius * 9/5) + 32;
                break;
            case 'kelvin':
                result = celsius + 273.15;
                break;
        }
        
        this.toValue.value = parseFloat(result.toFixed(6));
    }
    
    swapConverterUnits() {
        const tempUnit = this.fromUnit.value;
        this.fromUnit.value = this.toUnit.value;
        this.toUnit.value = tempUnit;
        this.convertUnits();
    }
    
    swapConverterValues() {
        const tempValue = this.fromValue.value;
        this.fromValue.value = this.toValue.value;
        this.toValue.value = tempValue;
        this.convertUnits();
    }
    
    useConverterResult() {
        this.currentOperand = this.toValue.value;
        this.updateDisplay();
        this.setMode('standard');
    }
    
    // ===== MODE MANAGEMENT =====
    setMode(mode) {
        this.currentMode = mode;
        
        // Update active tab
        this.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        // Update mode display
        this.currentModeElement.textContent = 
            mode.charAt(0).toUpperCase() + mode.slice(1);
        
        // Show/hide calculator sections
        this.standardCalc.classList.toggle('active', mode === 'standard');
        this.scientificCalc.classList.toggle('active', mode === 'scientific');
        this.converterCalc.classList.toggle('active', mode === 'converter');
        this.historyCalc.classList.toggle('active', mode === 'history');
        
        // Update converter units if needed
        if (mode === 'converter') {
            this.updateConverterUnits();
            this.convertUnits();
        }
        
        // Update history if needed
        if (mode === 'history') {
            this.updateHistoryDisplay();
        }
        
        this.saveSettings();
    }
    
    // ===== SETTINGS MANAGEMENT =====
    toggleSound() {
        this.settings.sound = !this.settings.sound;
        this.saveSettings();
        this.updateSoundIcon();
    }
    
    updateSoundIcon() {
        const icon = this.soundToggle.querySelector('i');
        if (this.settings.sound) {
            icon.className = 'fas fa-volume-up';
            this.soundToggle.classList.add('active');
        } else {
            icon.className = 'fas fa-volume-mute';
            this.soundToggle.classList.remove('active');
        }
    }
    
    cycleTheme() {
        const themes = ['light', 'dark', 'blue', 'purple', 'green', 'orange'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    setTheme(theme) {
        this.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.saveSettings();
        
        // Add transition effect
        document.body.classList.add('theme-changing');
        setTimeout(() => {
            document.body.classList.remove('theme-changing');
        }, 500);
    }
    
    toggleSettings() {
        this.settingsPanel.classList.toggle('active');
        this.settingsOverlay.classList.toggle('active');
        document.body.style.overflow = this.settingsPanel.classList.contains('active') ? 'hidden' : '';
    }
    
    closeSettings() {
        this.settingsPanel.classList.remove('active');
        this.settingsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    resetSettings() {
        this.settings = {
            sound: true,
            volume: 0.5,
            theme: 'light',
            commas: true,
            decimalPlaces: 4,
            scientificNotation: true,
            chainCalculations: true,
            autoDecimal: true,
            angleUnit: 'deg',
            saveHistory: true,
            historyLimit: 20,
            buttonAnimation: 'scale',
            displayAnimation: 'fade',
            performanceMode: 'balanced'
        };
        
        this.saveSettings();
        this.loadSettings();
        
        // Show notification
        alert('Settings have been reset to defaults.');
    }
    
    clearAllData() {
        this.clearAll();
        this.memory = 0;
        this.history = [];
        this.clearHistory();
        localStorage.clear();
        this.updateDisplay();
        
        // Show notification
        alert('All calculator data has been cleared.');
    }
    
    // ===== TIME DISPLAY =====
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        this.currentTime.textContent = timeString;
    }
    
    // ===== KEYBOARD HANDLING =====
    handleKeyboard(e) {
        // Don't interfere with inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Calculator keys
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
            e.preventDefault();
        } else if (e.key === '.') {
            this.inputNumber('.');
            e.preventDefault();
        } else if (e.key === '+') {
            this.inputOperator('+');
            e.preventDefault();
        } else if (e.key === '-') {
            this.inputOperator('-');
            e.preventDefault();
        } else if (e.key === '*') {
            this.inputOperator('*');
            e.preventDefault();
        } else if (e.key === '/') {
            e.preventDefault();
            this.inputOperator('/');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        } else if (e.key === 'Delete') {
            e.preventDefault();
            this.clearEntry();
        } else if (e.key === 'Escape') {
            // Handled separately
        } else if (e.key === 'p' || e.key === 'P') {
            if (e.ctrlKey) {
                e.preventDefault();
                this.toggleSettings();
            }
        }
        
        // Visual feedback for key press
        this.highlightKey(e.key);
    }
    
    highlightKey(key) {
        let selector = '';
        
        switch(key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                selector = `[data-number="${key}"]`;
                break;
            case '+': selector = '[data-operator="+"]'; break;
            case '-': selector = '[data-operator="-"]'; break;
            case '*': selector = '[data-operator="*"]'; break;
            case '/': selector = '[data-operator="/"]'; break;
            case '.': selector = '[data-number="."]'; break;
            case 'Enter': case '=': selector = '#equalsBtn'; break;
            case 'Backspace': selector = '[data-action="backspace"]'; break;
            case 'Delete': selector = '[data-action="clear-entry"]'; break;
        }
        
        if (selector) {
            const button = document.querySelector(selector);
            if (button) {
                button.classList.add('key-press');
                setTimeout(() => button.classList.remove('key-press'), 150);
            }
        }
    }
    
    // ===== AUDIO FUNCTIONS =====
    playSound(type) {
        if (!this.settings.sound) return;
        
        let sound;
        switch(type) {
            case 'click':
                sound = this.clickSound;
                break;
            case 'equals':
                sound = this.equalsSound;
                break;
            case 'error':
                sound = this.errorSound;
                break;
            default:
                return;
        }
        
        if (sound) {
            sound.volume = this.settings.volume;
            sound.currentTime = 0;
            sound.play().catch(e => {
                // Fallback to Web Audio API
                this.playWebAudio(type);
            });
        }
    }
    
    playWebAudio(type) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency, duration;
            
            switch(type) {
                case 'click':
                    frequency = 800;
                    duration = 0.1;
                    break;
                case 'equals':
                    frequency = 600;
                    duration = 0.3;
                    break;
                case 'error':
                    frequency = 300;
                    duration = 0.5;
                    break;
            }
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.1, 
                this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, 
                this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    // ===== LOCAL STORAGE =====
    loadSettings() {
        // Load settings
        const savedSettings = localStorage.getItem('advcalc-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        // Load theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Load calculator state
        const savedState = localStorage.getItem('advcalc-state');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentOperand = state.currentOperand || '0';
            this.previousOperand = state.previousOperand || '';
            this.operation = state.operation || null;
            this.waitingForNewOperand = state.waitingForNewOperand || false;
            this.memory = state.memory || 0;
            this.currentMode = state.currentMode || 'standard';
        }
        
        // Load history
        const savedHistory = localStorage.getItem('advcalc-history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.updateHistoryDisplay();
        }
        
        // Update UI based on settings
        this.updateSoundIcon();
        this.setMode(this.currentMode);
        this.updateDisplay();
    }
    
    saveSettings() {
        localStorage.setItem('advcalc-settings', JSON.stringify(this.settings));
    }
    
    saveToLocalStorage() {
        const state = {
            currentOperand: this.currentOperand,
            previousOperand: this.previousOperand,
            operation: this.operation,
            waitingForNewOperand: this.waitingForNewOperand,
            memory: this.memory,
            currentMode: this.currentMode
        };
        
        localStorage.setItem('advcalc-state', JSON.stringify(state));
    }
    
    saveHistory() {
        if (this.settings.saveHistory) {
            localStorage.setItem('advcalc-history', JSON.stringify(this.history));
        }
    }
}

// ===== INITIALIZE CALCULATOR =====
let calculator;

document.addEventListener('DOMContentLoaded', () => {
    calculator = new AdvancedCalculator();
    
    // Add keyboard focus
    document.body.addEventListener('click', () => {
        document.body.focus();
    });
    
    // Initialize with focus
    setTimeout(() => document.body.focus(), 100);
    
    console.log('Advanced Calculator initialized successfully!');
});