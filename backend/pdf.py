from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

def generar_pdf_plan(paciente, plan, items):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 40

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, y, "Plan Alimentario")
    y -= 30

    c.setFont("Helvetica", 11)
    c.drawString(40, y, f"Paciente: {paciente.nombre}")
    y -= 20
    c.drawString(40, y, f"Fecha: {plan.fecha.isoformat()}")
    y -= 30

    comida_actual = None

    for item in items:
        if item.comida != comida_actual:
            comida_actual = item.comida
            c.setFont("Helvetica-Bold", 12)
            c.drawString(40, y, comida_actual)
            y -= 20
            c.setFont("Helvetica", 11)

        c.drawString(60, y, f"- {item.alimento.nombre}")
        y -= 15

        if y < 50:
            c.showPage()
            y = height - 40

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer
