from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import date
from database import db
from models import Paciente
from peso import Peso
from alimento import Alimento
from plan import PlanAlimentario
from plan_alimento import PlanAlimento
from pdf import generar_pdf_plan
from visita import Visita
from laboratorio import Laboratorio
import os
import traceback

app = Flask(__name__)

# CORS: si querés restringirlo, acá podés poner origins=["http://localhost:3000", "https://TU-FRONT..."]
CORS(app)

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL no está definida")

# Railway a veces da postgres://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# ---------------- ERRORES JSON (clave para que NO explote React) ----------------

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "not_found"}), 404

@app.errorhandler(500)
def internal_error(e):
    # Devolvemos JSON (no HTML). Así React no intenta parsear "<!doctype...>"
    return jsonify({"error": "internal_server_error"}), 500

# ---------------- UTILIDADES ----------------

def to_float(valor):
    if valor is None or valor == "":
        return None
    if isinstance(valor, str):
        valor = valor.replace(",", ".")
    try:
        return float(valor)
    except:
        return None

def calcular_imc(peso, altura):
    if not peso or not altura:
        return None, None
    try:
        imc = peso / (altura * altura)
    except:
        return None, None

    imc = round(imc, 2)
    if imc < 18.5:
        rango = "Bajo peso"
    elif imc < 25:
        rango = "Normal"
    elif imc < 30:
        rango = "Sobrepeso"
    else:
        rango = "Obesidad"
    return imc, rango

@app.route("/")
def home():
    return jsonify({"status": "Nutri App OK"})

# ---------------- PACIENTES ----------------

@app.route("/pacientes", methods=["POST"])
def crear_paciente():
    data = request.json or {}

    paciente = Paciente(
        nombre=data.get("nombre"),
        apellido=data.get("apellido"),
        dni=data.get("dni"),
        edad=data.get("edad"),
        altura=to_float(data.get("altura")),
        peso=to_float(data.get("peso")),
        cintura=to_float(data.get("cintura")),
        fecha_visita=date.fromisoformat(data["fecha_visita"]) if data.get("fecha_visita") else None,
        diagnostico=data.get("diagnostico")
    )

    db.session.add(paciente)
    db.session.commit()
    return jsonify({"id": paciente.id}), 201

@app.route("/pacientes", methods=["GET"])
def listar_pacientes():
    pacientes = Paciente.query.all()
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "apellido": p.apellido,
            "dni": p.dni,
            "edad": p.edad,
            "altura": p.altura,
            "peso": p.peso,
            "cintura": p.cintura,
            "fecha_visita": p.fecha_visita.isoformat() if p.fecha_visita else None,
            "diagnostico": p.diagnostico
        }
        for p in pacientes
    ])

@app.route("/pacientes/<int:paciente_id>", methods=["GET"])
def obtener_paciente(paciente_id):
    p = Paciente.query.get_or_404(paciente_id)
    imc, rango = calcular_imc(p.peso, p.altura)
    return jsonify({
        "id": p.id,
        "nombre": p.nombre,
        "apellido": p.apellido,
        "dni": p.dni,
        "edad": p.edad,
        "altura": p.altura,
        "peso": p.peso,
        "cintura": p.cintura,
        "fecha_visita": p.fecha_visita.isoformat() if p.fecha_visita else None,
        "diagnostico": p.diagnostico,
        "imc": imc,
        "rango_imc": rango
    })

@app.route("/pacientes/<int:paciente_id>", methods=["PUT"])
def actualizar_paciente(paciente_id):
    data = request.json or {}
    paciente = Paciente.query.get_or_404(paciente_id)

    paciente.nombre = data.get("nombre")
    paciente.apellido = data.get("apellido")
    paciente.dni = data.get("dni")
    paciente.edad = data.get("edad")
    paciente.altura = to_float(data.get("altura"))
    paciente.peso = to_float(data.get("peso"))
    paciente.cintura = to_float(data.get("cintura"))
    paciente.fecha_visita = date.fromisoformat(data["fecha_visita"]) if data.get("fecha_visita") else None
    paciente.diagnostico = data.get("diagnostico")

    db.session.commit()
    return jsonify({"status": "paciente actualizado"})

@app.route("/pacientes/<int:paciente_id>", methods=["DELETE"])
def eliminar_paciente(paciente_id):
    paciente = Paciente.query.get_or_404(paciente_id)
    db.session.delete(paciente)
    db.session.commit()
    return jsonify({"status": "paciente eliminado"})

@app.route("/pacientes/buscar")
def buscar_paciente():
    q = (request.args.get("q") or "").strip()
    pacientes = Paciente.query.filter(
        (Paciente.nombre.ilike(f"%{q}%")) |
        (Paciente.apellido.ilike(f"%{q}%")) |
        (Paciente.dni.ilike(f"%{q}%"))
    ).all()

    return jsonify([
        {"id": p.id, "nombre": p.nombre, "apellido": p.apellido, "dni": p.dni, "edad": p.edad, "altura": p.altura, "peso": p.peso}
        for p in pacientes
    ])

# ---------------- VISITAS (Evolución) ----------------

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["POST"])
def crear_visita(paciente_id):
    data = request.json or {}

    peso = to_float(data.get("peso"))
    altura = to_float(data.get("altura"))
    cintura = to_float(data.get("cintura"))
    imc, rango = calcular_imc(peso, altura)

    visita = Visita(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        peso=peso,
        altura=altura,
        cintura=cintura,
        diagnostico=data.get("diagnostico")
    )

    db.session.add(visita)
    db.session.commit()

    return jsonify({"status": "visita creada", "imc": imc, "rango_imc": rango}), 201

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["GET"])
def listar_visitas(paciente_id):
    visitas = Visita.query.filter_by(paciente_id=paciente_id).order_by(Visita.fecha.desc()).all()
    return jsonify([
        {"id": v.id, "fecha": v.fecha.isoformat(), "peso": v.peso, "altura": v.altura, "cintura": v.cintura, "diagnostico": v.diagnostico}
        for v in visitas
    ])

@app.route("/visitas/<int:visita_id>", methods=["PUT"])
def actualizar_visita(visita_id):
    data = request.json or {}
    visita = Visita.query.get_or_404(visita_id)

    visita.fecha = date.fromisoformat(data["fecha"])
    visita.peso = to_float(data.get("peso"))
    visita.altura = to_float(data.get("altura"))
    visita.cintura = to_float(data.get("cintura"))
    visita.diagnostico = data.get("diagnostico")

    db.session.commit()
    return jsonify({"status": "visita actualizada"})

@app.route("/visitas/<int:visita_id>", methods=["DELETE"])
def eliminar_visita(visita_id):
    visita = Visita.query.get_or_404(visita_id)
    db.session.delete(visita)
    db.session.commit()
    return jsonify({"status": "visita eliminada"})

# ---------------- LABORATORIO ----------------

@app.route("/pacientes/<int:paciente_id>/laboratorio", methods=["POST"])
def crear_laboratorio(paciente_id):
    data = request.json or {}

    lab = Laboratorio(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        glucosa=data.get("glucosa"),
        colesterol_total=data.get("colesterol_total"),
        hdl=data.get("hdl"),
        ldl=data.get("ldl"),
        trigliceridos=data.get("trigliceridos"),
        tsh=data.get("tsh"),
        observaciones=data.get("observaciones")
    )

    db.session.add(lab)
    db.session.commit()
    return jsonify({"status": "laboratorio creado"}), 201

@app.route("/pacientes/<int:paciente_id>/laboratorio", methods=["GET"])
def listar_laboratorio(paciente_id):
    labs = Laboratorio.query.filter_by(paciente_id=paciente_id).order_by(Laboratorio.fecha.desc()).all()
    return jsonify([
        {
            "id": l.id,
            "fecha": l.fecha.isoformat(),
            "glucosa": l.glucosa,
            "colesterol_total": l.colesterol_total,
            "hdl": l.hdl,
            "ldl": l.ldl,
            "trigliceridos": l.trigliceridos,
            "tsh": l.tsh,
            "observaciones": l.observaciones
        }
        for l in labs
    ])

@app.route("/laboratorio/<int:lab_id>", methods=["DELETE"])
def eliminar_laboratorio(lab_id):
    lab = Laboratorio.query.get_or_404(lab_id)
    db.session.delete(lab)
    db.session.commit()
    return jsonify({"status": "laboratorio eliminado"})

# ---------------- ALIMENTOS ----------------

@app.route("/alimentos", methods=["POST"])
def crear_alimento():
    data = request.json or {}
    alimento = Alimento(
        nombre=data["nombre"],
        categoria=data["categoria"],
        calorias=data.get("calorias")
    )
    db.session.add(alimento)
    db.session.commit()
    return jsonify({"id": alimento.id}), 201

@app.route("/alimentos", methods=["GET"])
def listar_alimentos():
    alimentos = Alimento.query.filter_by(activo=True).all()
    return jsonify([
        {"id": a.id, "nombre": a.nombre, "categoria": a.categoria, "calorias": a.calorias}
        for a in alimentos
    ])

@app.route("/alimentos/<int:alimento_id>", methods=["DELETE"])
def desactivar_alimento(alimento_id):
    alimento = Alimento.query.get_or_404(alimento_id)
    alimento.activo = False
    db.session.commit()
    return jsonify({"status": "alimento desactivado"})

# ---------------- PLANES ----------------

@app.route("/pacientes/<int:paciente_id>/plan", methods=["POST"])
def crear_plan(paciente_id):
    data = request.json or {}

    # Desactivar planes activos anteriores
    planes_anteriores = PlanAlimentario.query.filter_by(paciente_id=paciente_id, activo=True).all()
    for p in planes_anteriores:
        p.activo = False

    # Crear nuevo plan activo
    plan = PlanAlimentario(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        activo=True
    )

    db.session.add(plan)
    db.session.commit()
    return jsonify({"plan_id": plan.id}), 201

@app.route("/pacientes/<int:paciente_id>/plan", methods=["GET"])
def ver_plan_actual(paciente_id):
    try:
        plan = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
        if not plan:
            return jsonify({"error": "sin_plan"}), 404

        items = PlanAlimento.query.filter_by(plan_id=plan.id).all()

        alimentos_out = []
        for i in items:
            # Si por algún motivo el alimento no existe (borrado/desactivado), no reventamos
            nombre = i.alimento.nombre if getattr(i, "alimento", None) else "(alimento eliminado)"
            categoria = i.alimento.categoria if getattr(i, "alimento", None) else ""
            alimentos_out.append({
                "item_id": i.id,
                "alimento_id": i.alimento_id,
                "nombre": nombre,
                "categoria": categoria,
                "comida": i.comida,
                "cantidad": i.cantidad
            })

        return jsonify({
            "plan_id": plan.id,
            "fecha": plan.fecha.isoformat(),
            "alimentos": alimentos_out
        })
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "internal_server_error"}), 500

@app.route("/pacientes/<int:paciente_id>/planes", methods=["GET"])
def listar_planes(paciente_id):
    planes = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).all()
    return jsonify([{"id": p.id, "fecha": p.fecha.isoformat()} for p in planes])

@app.route("/planes/<int:plan_id>/alimentos", methods=["POST"])
def agregar_alimento_plan(plan_id):
    data = request.json or {}

    pa = PlanAlimento(
        plan_id=plan_id,
        alimento_id=data["alimento_id"],
        comida=data["comida"],
        cantidad=data.get("cantidad")
    )

    db.session.add(pa)
    db.session.commit()
    return jsonify({"status": "alimento agregado"}), 201

@app.route("/plan_item/<int:item_id>", methods=["DELETE"])
def eliminar_item_plan(item_id):
    item = PlanAlimento.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"status": "item eliminado"})

@app.route("/pacientes/<int:paciente_id>/plan/pdf", methods=["GET"])
def plan_pdf(paciente_id):
    paciente = Paciente.query.get_or_404(paciente_id)
    plan = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
    if not plan:
        return jsonify({"error": "sin_plan"}), 404

    items = PlanAlimento.query.filter_by(plan_id=plan.id).all()
    pdf = generar_pdf_plan(paciente, plan, items)

    return send_file(
        pdf,
        mimetype="application/pdf",
        download_name=f"plan_{paciente.nombre}.pdf",
        as_attachment=True
    )

@app.route("/pacientes/<int:paciente_id>/plan/copiar", methods=["POST"])
def copiar_plan_anterior(paciente_id):
    data = request.json or {}

    plan_anterior = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
    if not plan_anterior:
        return jsonify({"error": "no_hay_plan_anterior"}), 404

    # CORRECCIÓN: parsear fecha (antes podía romper y dar 500)
    fecha_nueva = date.fromisoformat(data["fecha"])

    nuevo_plan = PlanAlimentario(
        paciente_id=paciente_id,
        fecha=fecha_nueva,
        activo=True
    )
    db.session.add(nuevo_plan)
    db.session.commit()

    items = PlanAlimento.query.filter_by(plan_id=plan_anterior.id).all()
    for item in items:
        copia = PlanAlimento(
            plan_id=nuevo_plan.id,
            alimento_id=item.alimento_id,
            comida=item.comida,
            cantidad=item.cantidad
        )
        db.session.add(copia)

    db.session.commit()
    return jsonify({"status": "plan copiado", "plan_id": nuevo_plan.id}), 201

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
