# 💼 Sistema de Gestión Comercial y Servicios Web - David Ramirez

Suite web profesional para generar, gestionar e imprimir en tamaño **A4**:
1. **Presupuestos Comerciales** (Comprobante Tipo X)
2. **Contratos de Servicios Web** (Mensual, Hosting, Mantenimiento y Propiedad Intelectual)
3. **Recibos de Pago y Cobro** (Abonos mensuales, control de pagos, descuentos y firma conforme)

Desarrollada para **David Ramirez (CHAVO - Web Developer)**.

---

## ✨ Módulos Incluidos

### 1. 📋 Presupuestos Comerciales (`index.html`)
- **Comprobante Tipo X**: Encabezado tripartito con logo, letra "X", datos de emisor y cliente.
- **Tabla de Ítems Dinámica**: Cantidad, Precio Unitario, % Descuento y Subtotales.
- **Cálculo de Seña / Anticipo**: 50% automático y saldo contra entrega.
- **Historial Seguro**: Base de datos local protegida por clave PIN (`1234`).

### 2. 📑 Contratos de Servicios Web (`contrato.html`)
- **Cláusulas Legales y Operativas**: Alcance de servicio, abono mensual, vencimiento, suspensión por falta de pago, rescisión y cláusula de entrega de código / buyout (3 cuotas).
- **Configuración de Página A4**: Ancho 210 mm, alto 297 mm, márgenes reglamentarios (2,5 cm) y tipografía Arial con interlineado legible.
- **Línea de Firma al Pie**: Modalidad de firma configurable (Solo Emisor o Desarrollador + Cliente).

### 3. 🧾 Recibos de Cobro y Servicios (`recibo.html`)
- **Comprobante de Pago Oficial**: Control de cantidad de meses, monto mensual y período liquidado.
- **Descuento por Monto Directo**: Descuenta el importe exacto ingresado (ej: $110 - $10 = $100).
- **Ocultamiento Inteligente**: Si el descuento es 0, no se muestra ninguna fila de descuento en la hoja A4.
- **Conversor a Letras en Español**: *"Son: Cien dólares con 00/100"*.
- **Sello Oficial**: Insignia verde de *"COBRADO / PAGADO"*.
- **Firma del Emisor**: Línea exclusiva del prestador / emisor con DNI/CUIT.

---

## 🚀 Uso Local

Solo abrí cualquier archivo en el navegador:
- [index.html](index.html) -> Generador de Presupuestos
- [contrato.html](contrato.html) -> Generador de Contratos
- [recibo.html](recibo.html) -> Generador de Recibos

O si usás un servidor local:
```bash
npx serve .
```

---

## ☁️ Publicación en Vercel

Configurado con `vercel.json` para despliegue inmediato y gratuito:
1. Conectá este repositorio en [Vercel](https://vercel.com).
2. Hacé clic en **Deploy**.
3. ¡Listo! Acceso inmediato desde cualquier dispositivo móvil o de escritorio.
