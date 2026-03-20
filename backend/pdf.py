from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from io import BytesIO
import base64

COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"]
DIAS    = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

def generar_pdf_plan(paciente, plan, items, profesional=None):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    prof = profesional or {}
    prof_nombre       = prof.get("nombre", "")
    prof_matricula    = prof.get("matricula", "")
    prof_especialidad = prof.get("especialidad", "Nutricionista")
    prof_firma_b64    = prof.get("firma", "")

    # ── Header verde ────────────────────────────────────
    c.setFillColorRGB(0.18, 0.42, 0.31)
    c.rect(0, height - 70, width, 70, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 38, "Plan Alimentario")
    c.setFont("Helvetica", 10)
    fecha_str = plan.fecha.strftime('%d/%m/%Y') if hasattr(plan.fecha, 'strftime') else str(plan.fecha)
    c.drawString(40, height - 56, f"Fecha: {fecha_str}")
    if prof_nombre:
        c.setFont("Helvetica", 10)
        c.drawRightString(width - 40, height - 38, prof_nombre)
        c.setFont("Helvetica", 9)
        mat_txt = f"Mat. {prof_matricula}" if prof_matricula else prof_especialidad
        c.drawRightString(width - 40, height - 54, mat_txt)

    y = height - 90

    # ── Datos del paciente ───────────────────────────────
    c.setFillColor(colors.HexColor("#f6f4ef"))
    c.rect(30, y - 38, width - 60, 46, fill=True, stroke=False)
    c.setFillColor(colors.HexColor("#1c1a16"))
    c.setFont("Helvetica-Bold", 13)
    c.drawString(40, y - 14, f"{paciente.apellido}, {paciente.nombre}")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#7c7869"))
    datos = []
    if paciente.dni:    datos.append(f"DNI: {paciente.dni}")
    if paciente.edad:   datos.append(f"Edad: {paciente.edad} años")
    if paciente.peso:   datos.append(f"Peso: {paciente.peso} kg")
    if paciente.altura: datos.append(f"Altura: {paciente.altura} m")
    c.drawString(40, y - 28, "  ·  ".join(datos))
    y -= 60

    # ── Construir tabla semanal ──────────────────────────
    # Agrupar items por dia y comida
    grilla = {}
    for item in items:
        dia = getattr(item, 'dia', None) or "Lunes"
        comida = item.comida or "Desayuno"
        nombre = item.alimento.nombre if item.alimento else "(eliminado)"
        cantidad = item.cantidad or ""
        key = (dia, comida)
        if key not in grilla:
            grilla[key] = []
        txt = nombre
        if cantidad:
            txt += f"\n({cantidad})"
        grilla[key].append(txt)

    # Detectar qué días tienen datos
    dias_con_datos = [d for d in DIAS if any((d, c) in grilla for c in COMIDAS)]
    if not dias_con_datos:
        dias_con_datos = DIAS[:5]  # lun-vie por defecto

    # Tabla por grupos de días para que entre en la página
    GRUPO = 4  # max días por tabla
    for g_start in range(0, len(dias_con_datos), GRUPO):
        grupo_dias = dias_con_datos[g_start:g_start + GRUPO]

        col_w = (width - 100) / (len(grupo_dias) + 1)
        header_row = [""] + grupo_dias
        table_data = [header_row]

        for comida in COMIDAS:
            row = [comida]
            tiene_algo = False
            for dia in grupo_dias:
                cell_items = grilla.get((dia, comida), [])
                row.append("\n".join(cell_items) if cell_items else "")
                if cell_items:
                    tiene_algo = True
            if tiene_algo:
                table_data.append(row)

        if len(table_data) <= 1:
            continue

        col_widths = [80] + [col_w] * len(grupo_dias)
        t = Table(table_data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ("BACKGROUND",   (0, 0), (-1, 0),  colors.HexColor("#2d6a4f")),
            ("TEXTCOLOR",    (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",     (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, 0),  8),
            ("BACKGROUND",   (0, 1), (0, -1),  colors.HexColor("#e6f2eb")),
            ("TEXTCOLOR",    (0, 1), (0, -1),  colors.HexColor("#2d6a4f")),
            ("FONTNAME",     (0, 1), (0, -1),  "Helvetica-Bold"),
            ("FONTSIZE",     (0, 1), (-1, -1), 7.5),
            ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
            ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#ddd9d0")),
            ("ROWBACKGROUNDS", (1, 1), (-1, -1), [colors.white, colors.HexColor("#f9f8f5")]),
            ("TOPPADDING",   (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
            ("LEFTPADDING",  (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("WORDWRAP",     (0, 0), (-1, -1), True),
        ]))

        t_w, t_h = t.wrapOn(c, width - 60, height)
        if y - t_h < 80:
            c.showPage()
            y = height - 50
        t.drawOn(c, 30, y - t_h)
        y -= t_h + 20

    # ── Firma ────────────────────────────────────────────
    if prof_nombre or prof_firma_b64:
        if y < 100:
            c.showPage()
            y = height - 50
        firma_y = max(y - 80, 55)
        c.setStrokeColor(colors.HexColor("#ddd9d0"))
        c.setLineWidth(0.5)
        c.line(width - 230, firma_y + 32, width - 40, firma_y + 32)
        if prof_firma_b64:
            try:
                b64data = prof_firma_b64.split(",", 1)[1] if "," in prof_firma_b64 else prof_firma_b64
                img_bytes = base64.b64decode(b64data)
                from reportlab.lib.utils import ImageReader
                img = ImageReader(BytesIO(img_bytes))
                c.drawImage(img, width - 200, firma_y + 34, width=160, height=45, preserveAspectRatio=True, mask='auto')
            except Exception:
                pass
        c.setFillColor(colors.HexColor("#1c1a16"))
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(width - 135, firma_y + 18, prof_nombre)
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#7c7869"))
        if prof_matricula:
            c.drawCentredString(width - 135, firma_y + 6, f"Mat. {prof_matricula}")
        if prof_especialidad:
            c.drawCentredString(width - 135, firma_y - 6, prof_especialidad)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
