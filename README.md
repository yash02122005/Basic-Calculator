# 🧮 AdvCalculator | Professional Advanced Calculator

![Version](https://img.shields.io/badge/version-3.0.1-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

**AdvCalc** is a high-performance, multi-functional web calculator designed for both daily utility and advanced scientific computing. It features a sleek glassmorphism interface, real-time unit conversion, and a robust history tracking system.

[**Launch Application**](#) | [**View Documentation**](#) | [**Report Issue**](#)

---

## 🚀 Core Functionalities

* **🔢 Multi-Mode Interface:** Seamlessly toggle between **Standard**, **Scientific**, and **Unit Converter** modes.
* **📐 Scientific Suite:** Comprehensive support for trigonometry (sin, cos, tan), logarithms, and advanced algebraic functions.
* **🔄 Dynamic Converter:** Real-time conversion for Length, Weight, Temperature, Area, Volume, and Data Storage.
* **📜 Smart History:** Persistent calculation logs with statistical tracking and "Use in Calc" functionality.
* **🎨 Advanced Customization:** 6+ premium themes (Ocean, Purple, Green, etc.) and deep settings for haptic feedback and animations.

---

## 🛠️ Technical Insights & Error Resolution

During the development of AdvCalc v3.0, several technical hurdles were addressed to ensure a professional-grade user experience:

1.  **Precision & Floating Point Errors:**
    * *Observation:* JavaScript's native math can produce precision errors (e.g., `0.1 + 0.2 !== 0.3`).
    * *Solution:* Integrated a selectable **Decimal Places** manager in the settings panel (Auto, 2, 4, 6, 8 places) to ensure displayed results meet professional accuracy standards.

2.  **Display State Management:**
    * *Observation:* Rapid inputs could cause display overflows or "NaN" (Not a Number) errors.
    * *Solution:* Implemented a strict **Clear Entry (CE)** and **All Clear (AC)** logic alongside a `display-cursor` animation to provide visual feedback and prevent invalid mathematical strings.

3.  **Resource Management (Audio/UI):**
    * *Observation:* Multiple sound effects (Click, Equals, Error) can cause lag if played synchronously.
    * *Solution:* Developed a sound-toggle and volume-level controller in the settings panel to allow users to optimize performance based on their hardware.

4.  **Unit Conversion Logic:**
    * *Observation:* Swapping units often caused value resetting or calculation loss.
    * *Solution:* Added a **"Use in Calc"** feature that safely transfers converted values back into the main calculation buffer without interrupting the user workflow.

---

## 📥 Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/yourusername/advcalc-pro.git](https://github.com/yourusername/advcalc-pro.git)
    ```
2.  **Run Locally:**
    Open `index.html` in any modern browser. The application utilizes `script.js`, `style.css`, and `animations.css` for a zero-dependency setup.

---

## ⌨️ Quick Controls

| Key/Action | Description |
| :--- | :--- |
| **AC** | All Clear - Resets entire calculation state |
| **M+ / M-** | Memory Add/Subtract - Stores values in independent buffer |
| **±** | Change Sign - Toggles positive/negative value |
| **Palette Icon** | Theme Toggle - Switches between Light and Dark modes instantly |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Developed with precision by [Yash]**
