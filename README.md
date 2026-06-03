# StaffSync - Agencia de Personal 🏥👩‍⚕️

Sistema web avanzado para la gestión de turnos, facturación a clientes y cálculo de honorarios de trabajadoras. Diseñado específicamente para agencias de personal (enfermeras, TENS, cuidadores, etc.) en Chile, cumpliendo con las normativas locales de retención de impuestos.

## 🚀 Características Principales

*   **Gestión de Trabajadoras (Nómina):**
    *   Asignación de turnos en calendario interactivo.
    *   Cálculo automático de honorarios basado en tarifas base y recargos por feriados (Normales e Irrenunciables).
    *   Generación de Liquidación en PDF con retención legal (Ley 2026: 15.25% configurable).
    *   Dashboard Global para visualizar la nómina completa de la agencia por mes.
*   **Gestión de Clientes (Facturación):**
    *   Tarifas mensuales independientes (protege el histórico de facturación).
    *   Visualización de progreso de Cuota Mensual (Turnos solicitados vs realizados).
    *   Desglose de cobros y generación de Factura en PDF corporativo (html2pdf).
    *   Control de Folios automáticos para los documentos generados.
*   **Ajustes de Agencia:**
    *   Configuración del Logo corporativo (Base64 local).
    *   Dashboard Anual de métricas (Ingresos vs Costos = Rentabilidad).
    *   Sistema de Backup local (Exportación e importación de Base de Datos en JSON).
*   **Diseño Moderno y Fluido:**
    *   Interfaz *Dark Premium* con Glassmorphism (paneles translúcidos y desenfoques).
    *   Micro-animaciones interactivas (Framer Motion).
    *   Notificaciones Toast para feedback inmediato.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React 18, Vite.
*   **Estilos:** CSS3 (Variables nativas, Glassmorphism), Flexbox/Grid.
*   **Animaciones:** Framer Motion.
*   **Utilidades:** html2pdf.js (Generación de PDF), react-hot-toast (Notificaciones).
*   **Almacenamiento:** LocalStorage (Persistencia de datos sin backend).

## 📦 Instalación y Uso Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/staffsync.git
    cd staffsync
    ```

2.  **Instalar dependencias:**
    Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador:**
    El terminal indicará la URL local (usualmente `http://localhost:5173/`).

## 💾 Gestión de Datos

Este proyecto fue diseñado para ser *Serverless* en su etapa inicial, guardando toda la información de Clientes y Trabajadoras directamente en el **LocalStorage** de tu navegador web.
*   **⚠️ Precaución:** Borrar el historial y los datos de tu navegador eliminará la base de datos de la aplicación.
*   **✅ Solución:** Utiliza la pestaña de **"Ajustes" -> "Respaldo de Datos"** regularmente para descargar una copia de seguridad (`backup.json`) a tu computador físico.

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
