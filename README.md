<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg" width="80" height="80" alt="CPU-J Logo">
  
  # CPU-J
  
  **La evolución moderna de CPU-Z, reimaginada con tecnologías web y un impresionante diseño Cyberpunk.**
  
  [![Versión](https://img.shields.io/badge/Versión-1.0.0-00e5ff?style=for-the-badge)](https://github.com/juliangelvez/CPU-J)
  [![Plataformas](https://img.shields.io/badge/Plataformas-Windows%20%7C%20macOS-ff2d7b?style=for-the-badge)](#)
  [![Autor](https://img.shields.io/badge/Creado_por-Julián_&_IA-00ff88?style=for-the-badge)](#)

  *Primera versión construida colaborativamente.*
</div>

---

## ⚡ ¿Qué es CPU-J?

**CPU-J** es una herramienta de diagnóstico de hardware en tiempo real que obtiene información física genuina de los componentes de tu computadora, agrupándola en una interfaz intuitiva de múltiples pestañas. A diferencia de las herramientas del navegador aisladas, CPU-J se ejecuta como una **aplicación nativa portable de escritorio**, lo que le permite eludir la zona de pruebas y acceder a las métricas reales del sistema de forma segura.

Todo está empaquetado en un diseño de cristal oscuro de primera calidad (**Neon Dark / Cyberpunk UI**) con potentes paneles y animaciones asombrosas construidas usando **Tailwind CSS**.

### 🌟 Características Principales

*   **🕵️‍♂️ Datos de Hardware Reales:** Obtiene datos físicos exactos sobre procesadores, caché, placa base, BIOS, ranuras de memoria SPD individuales y modelos de tarjetas gráficas dedicadas.
*   **💻 Cross-Platform Portable:** Ejecutables de un solo clic que **no requieren instalación**. Sólo tienes que descargarlo y abrirlo tanto en Windows (`.exe`) como en macOS (`.dmg`).
*   **📊 Monitorización en Tiempo Real:** Muestra la velocidad instantánea de tu núcleo, el voltaje estimado y la temperatura de tu CPU con métricas parpadeantes con estilo neón.
*   **🚀 Benchmark Integrado Multi-Núcleo:** ¡Pon a prueba tu procesador! El motor de benchmark incorporado usa **Web Workers** para desatar la potencia de *todos los hilos lógicos de tu CPU* de manera simultánea en el cálculo de números primos brutos. Incluye barras de estado y promedios frente a procesadores emblemáticos como el i9-13900K o Apple M2.
*   **💾 Reportes Exportables:** Genera un registro exhaustivo `.txt` de tu sistema de manera instantánea presionando un botón.

---

## 🛠️ Cómo descargar y ejecutar

### Opción 1: Descargar las versiones precompiladas (Recomendado)

Ve a la pestaña de **[Releases]([https://github.com/juliangelvez/CPU-J/releases/latest](https://github.com/jgelvez/cpu-j/releases/tag/v1.0.0))** en este repositorio y descarga el archivo correspondiente a tu sistema operativo:

*   🍎 **Para Mac:** Descarga el archivo `CPU-J-1.0.0-arm64.dmg` (o x64), haz doble clic y arrástralo a la carpeta Aplicaciones, o ábrelo directamente.
*   🪟 **Para Windows:** Descarga el archivo `CPU-J-1.0.0-portable.exe` y haz doble clic para ejecutarlo. ¡No requiere instalación!

### Opción 2: Ejecutar en entorno de desarrollo

Si deseas ejecutar el código fuente o modificar la interfaz, puedes hacerlo usando Node.js:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/juliangelvez/CPU-J.git
   cd CPU-J
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la aplicación de escritorio al instante:
   ```bash
   npm start
   ```

---

## 🏗️ Cómo está construido

1.  **Frontend**: HTML5, **Tailwind CSS**, íconos Lucide. Todo reside en el directorio `src/`.
2.  **Motor de Hardware**: `systeminformation` ejecutándose de forma segura en Node.js dentro de los procesos de backend de Electron (`main.js`).
3.  **Puente de Seguridad**: Una integración segura en `preload.js` envía métricas desde Node.js hacia la interfaz a través de `contextBridge`.
4.  **Cómputo en Paralelo**: `benchmark-worker.js` crea hilos secundarios independientes evitando que la interfaz se congele durante pruebas de estrés.

## 👥 Créditos

Esta es la **Primera Versión (v1.0.0)**.
Construido de cero, mano a mano y de manera conjunta entre **Julián** y la inteligencia artificial **Antigravity**.
