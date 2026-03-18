from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from io import BytesIO

def generar_pdf_plan(paciente, plan, items, profesional=None):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    prof = profesional or {}
    prof_nombre    = prof.get("nombre", "")
    prof_matricula = prof.get("matricula", "")
    prof_especialidad = prof.get("especialidad", "Nutricionista")

    # ── Header ──────────────────────────────────────────
    c.setFillColorRGB(0.18, 0.42, 0.31)  # verde acento
    c.rect(0, height - 70, width, 70, fill=True, stroke=False)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 38, "Plan Alimentario")

    c.setFont("Helvetica", 10)
    c.drawString(40, height - 56, f"Fecha: {plan.fecha.strftime('%d/%m/%Y') if hasattr(plan.fecha, 'strftime') else plan.fecha}")

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
    if paciente.dni:   datos.append(f"DNI: {paciente.dni}")
    if paciente.edad:  datos.append(f"Edad: {paciente.edad} años")
    if paciente.peso:  datos.append(f"Peso: {paciente.peso} kg")
    if paciente.altura: datos.append(f"Altura: {paciente.altura} m")
    c.drawString(40, y - 28, "  ·  ".join(datos))

    y -= 60

    # ── Alimentos por comida ─────────────────────────────
    COMIDAS = ["Desayuno", "Almuerzo", "Merienda", "Cena", "Colación"]
    por_comida = {}
    for item in items:
        k = item.comida
        if k not in por_comida:
            por_comida[k] = []
        nombre = item.alimento.nombre if item.alimento else "(eliminado)"
        por_comida[k].append((nombre, item.cantidad or ""))

    # Orden de comidas
    orden = [c2 for c2 in COMIDAS if c2 in por_comida]
    orden += [k for k in por_comida if k not in COMIDAS]

    for comida in orden:
        alimentos_comida = por_comida[comida]

        # Check page space
        needed = 28 + len(alimentos_comida) * 18 + 10
        if y - needed < 80:
            c.showPage()
            y = height - 50

        # Comida header pill
        c.setFillColor(colors.HexColor("#e6f2eb"))
        c.roundRect(30, y - 18, 140, 22, 4, fill=True, stroke=False)
        c.setFillColor(colors.HexColor("#2d6a4f"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(40, y - 10, comida.upper())
        y -= 28

        # Items
        c.setFillColor(colors.HexColor("#1c1a16"))
        for nombre, cantidad in alimentos_comida:
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor("#1c1a16"))
            c.drawString(50, y, f"• {nombre}")
            if cantidad:
                c.setFont("Helvetica", 9)
                c.setFillColor(colors.HexColor("#7c7869"))
                c.drawRightString(width - 40, y, cantidad)
            y -= 18

            if y < 80:
                c.showPage()
                y = height - 50

        y -= 8

    # ── Firma ────────────────────────────────────────────
    if prof_nombre:
        if y < 120:
            c.showPage()
            y = height - 50

        firma_y = 60
        c.setStrokeColor(colors.HexColor("#ddd9d0"))
        c.setLineWidth(0.5)
        c.line(width - 220, firma_y + 30, width - 40, firma_y + 30)

        c.setFillColor(colors.HexColor("#1c1a16"))
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(width - 130, firma_y + 16, prof_nombre)

        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#7c7869"))
        if prof_matricula:
            c.drawCentredString(width - 130, firma_y + 4, f"Mat. {prof_matricula}")
        if prof_especialidad:
            c.drawCentredString(width - 130, firma_y - 8, prof_especialidad)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
