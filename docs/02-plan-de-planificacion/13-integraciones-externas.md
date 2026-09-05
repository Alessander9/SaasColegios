<!-- Documento perteneciente a la Guía Maestra de la Plataforma Educativa SaaS -->
<!-- Fuente original: cole.txt (Líneas 2854 a 2884) -->

# 13. 🔌 Integraciones externas

Debemos decidir qué integraciones soportaremos.

Por ejemplo:

```text
Pagos
├── Tarjetas
├── Transferencias
├── Yape/Plin*
└── Otros gateways

Comunicación
├── Email
├── SMS
├── Push
└── WhatsApp

Documentos
├── S3
└── PDF

Facturación
└── Proveedor fiscal / API correspondiente
```

Si el mercado inicial será Perú, además debemos especificar desde temprano los requisitos locales de **facturación electrónica, protección de datos y conservación documental** que correspondan al producto.

---

---

[⬅️ Anterior: 12. Eventos del Sistema](./12-eventos-del-sistema.md) | [🏠 Índice Principal](../README.md) | [Siguiente: 14. Seguridad y Compliance ➡️](./14-seguridad-y-compliance.md)
