# Guía de Contribución 🤝

¡Gracias por tu interés en contribuir a StaffSync! Este proyecto busca crear el estándar de software para las agencias de personal, y toda ayuda para mejorar el código, el diseño o la lógica matemática es bienvenida.

## 🐛 Reporte de Errores (Bugs)

Si encuentras un error o el sistema no calcula correctamente una tarifa:
1. Revisa que no exista ya un *Issue* abierto sobre el mismo problema.
2. Crea un nuevo *Issue* describiendo detalladamente:
   * Los pasos para reproducir el error.
   * Lo que esperabas que sucediera.
   * Lo que realmente sucedió.
   * Detalles de tu entorno (Navegador, Sistema Operativo).

## ✨ Propuesta de Nuevas Funcionalidades

Si tienes una idea brillante para mejorar el software:
1. Abre un *Issue* con la etiqueta `enhancement` (mejora).
2. Explica claramente la necesidad o el problema que tu idea resuelve.
3. Si es posible, incluye bocetos o ejemplos de cómo te imaginas la interfaz de usuario.

## 🛠️ Entorno de Desarrollo y Pull Requests

Si deseas escribir código y enviarlo al proyecto, sigue este flujo:

1. **Haz un Fork** del repositorio a tu cuenta de GitHub.
2. **Crea una rama** para tu funcionalidad o corrección:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # o
   git checkout -b fix/correccion-de-error
   ```
3. **Escribe tu código:**
   * Mantiene el estilo arquitectónico de React utilizado en el proyecto (Functional Components, Hooks).
   * Mantén la filosofía visual de CSS: Usa variables CSS, mantén la estética oscura (*glassmorphism*) y evita incorporar frameworks pesados de CSS (como Bootstrap) a menos que se haya discutido previamente, para mantener el bundle ligero.
   * Asegúrate de comentar las secciones complejas, especialmente la lógica de cálculo de recargos por feriados.
4. **Prueba tus cambios localmente** ejecutando `npm run dev`. Verifica que nada se haya roto en la visualización de PDF (`html2pdf`).
5. **Realiza commits descriptivos** explicando *qué* hace tu cambio.
6. **Sube tus cambios** a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
7. **Abre un Pull Request (PR)** hacia la rama principal (`main`) de este repositorio. Proporciona una descripción clara en el PR.

## ⚖️ Arquitectura y Toma de Decisiones
- El estado global actualmente descansa fuertemente en el `App.jsx`. Si planeas implementar un Manejador de Estados (como Redux o Zustand), por favor abre una discusión en un Issue primero para evaluar si la complejidad del sistema lo amerita.
- Para adiciones en el diseño PDF, asegúrate de editar tanto `InvoiceTemplate.jsx` (Facturas) como `WorkerInvoiceTemplate.jsx` (Liquidaciones de Honorarios).

¡Feliz código y gracias por hacer crecer este proyecto! 🚀
