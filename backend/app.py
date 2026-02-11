from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import date
from database import db
from models import Paciente
from peso import Peso
from alimento import Alimento
from plan import PlanAlimentario
from plan_alimento import PlanAlimento
from flask import send_file
from pdf import generar_pdf_plan
from visita import Visita
import os

app = Flask(__name__)
CORS(app)

database_url = os.environ.get("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL no está definida")

if database_url.startswith("postgres://"):
    database_url = database_url.replace(
        "postgres://",
        "postgresql+psycopg://",
        1
    )

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

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
    return {"status": "Nutri App OK"}

# ---------------- PACIENTES ----------------

@app.route("/pacientes", methods=["POST"])
def crear_paciente():
    data = request.json

    paciente = Paciente(
        nombre=data.get("nombre"),
        apellido=data.get("apellido"),
        dni=data.get("dni"),
        edad=data.get("edad"),
        altura=data.get("altura"),
        peso=data.get("peso"),
        cintura=data.get("cintura"),
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

@app.route("/pacientes/<int:paciente_id>", methods=["PUT"])
def actualizar_paciente(paciente_id):
    data = request.json
    paciente = Paciente.query.get_or_404(paciente_id)

    paciente.nombre = data.get("nombre")
    paciente.apellido = data.get("apellido")
    paciente.dni = data.get("dni")
    paciente.edad = data.get("edad")
    paciente.altura = data.get("altura")
    paciente.peso = data.get("peso")

    db.session.commit()
    return {"status": "paciente actualizado"}

@app.route("/pacientes/buscar")
def buscar_paciente():
    q = request.args.get("q", "")
    pacientes = Paciente.query.filter(
        (Paciente.nombre.ilike(f"%{q}%")) |
        (Paciente.apellido.ilike(f"%{q}%")) |
        (Paciente.dni.ilike(f"%{q}%"))
    ).all()

    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "apellido": p.apellido,
            "dni": p.dni,
            "edad": p.edad,
            "altura": p.altura,
            "peso": p.peso
        } for p in pacientes
    ])

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["POST"])
def crear_visita(paciente_id):
    data = request.json

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

    return {
        "status": "visita creada",
        "imc": imc,
        "rango_imc": rango
    }, 201

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["GET"])
def listar_visitas(paciente_id):
    visitas = Visita.query.filter_by(paciente_id=paciente_id)\
        .order_by(Visita.fecha.desc()).all()

    return jsonify([
        {
            "id": v.id,
            "fecha": v.fecha.isoformat(),
            "peso": v.peso,
            "altura": v.altura,
            "cintura": v.cintura,
            "diagnostico": v.diagnostico
        }
        for v in visitas
    ])
# ---------------- PESO ----------------

@app.route("/pacientes/<int:paciente_id>/peso", methods=["POST"])
def agregar_peso(paciente_id):
    data = request.json

    peso = Peso(
        paciente_id=paciente_id,
        peso=data["peso"],
        fecha=date.fromisoformat(data["fecha"])
    )

    db.session.add(peso)
    db.session.commit()

    return {"status": "peso registrado"}, 201

@app.route("/pacientes/<int:paciente_id>/peso", methods=["GET"])
def historial_peso(paciente_id):
    pesos = Peso.query.filter_by(paciente_id=paciente_id).order_by(Peso.fecha).all()

    return jsonify([
        {
            "fecha": p.fecha.isoformat(),
            "peso": p.peso
        }
        for p in pesos
    ])

# ---------------- ALIMENTOS ----------------

@app.route("/alimentos", methods=["POST"])
def crear_alimento():
    data = request.json

    alimento = Alimento(
        nombre=data["nombre"],
        categoria=data["categoria"],
        calorias=data.get("calorias")
    )

    db.session.add(alimento)
    db.session.commit()

    return {"id": alimento.id}, 201


@app.route("/alimentos", methods=["GET"])
def listar_alimentos():
    alimentos = Alimento.query.filter_by(activo=True).all()

    return jsonify([
        {
            "id": a.id,
            "nombre": a.nombre,
            "categoria": a.categoria,
            "calorias": a.calorias
        }
        for a in alimentos
    ])
# ---------------- PLANES ----------------

@app.route("/pacientes/<int:paciente_id>/plan", methods=["POST"])
def crear_plan(paciente_id):
    data = request.json

    plan = PlanAlimentario(
        paciente_id=paciente_id,
        fecha=data["fecha"]
    )

    db.session.add(plan)
    db.session.commit()

    return {"plan_id": plan.id}, 201


@app.route("/planes/<int:plan_id>/alimentos", methods=["POST"])
def agregar_alimento_plan(plan_id):
    data = request.json

    pa = PlanAlimento(
        plan_id=plan_id,
        alimento_id=data["alimento_id"],
        comida=data["comida"]
    )

    db.session.add(pa)
    db.session.commit()

    return {"status": "alimento agregado"}, 201


@app.route("/pacientes/<int:paciente_id>/plan", methods=["GET"])
def ver_plan_actual(paciente_id):
    plan = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(
        PlanAlimentario.fecha.desc()
    ).first()

    if not plan:
        return {"error": "sin plan"}, 404

    items = PlanAlimento.query.filter_by(plan_id=plan.id).all()

    return {
        "plan_id": plan.id,
        "fecha": plan.fecha.isoformat(),
        "alimentos": [
            {
                "nombre": i.alimento.nombre,
                "categoria": i.alimento.categoria,
                "comida": i.comida
            }
            for i in items
        ]
    }

# ---------------- PDF ----------------

@app.route("/pacientes/<int:paciente_id>/plan/pdf", methods=["GET"])
def plan_pdf(paciente_id):
    paciente = Paciente.query.get_or_404(paciente_id)

    plan = PlanAlimentario.query.filter_by(
        paciente_id=paciente_id
    ).order_by(PlanAlimentario.fecha.desc()).first()

    if not plan:
        return {"error": "sin plan"}, 404

    items = PlanAlimento.query.filter_by(plan_id=plan.id).all()

    pdf = generar_pdf_plan(paciente, plan, items)

    return send_file(
        pdf,
        mimetype="application/pdf",
        download_name=f"plan_{paciente.nombre}.pdf",
        as_attachment=True
    )

# ---------------- COPIAR PLAN ----------------

@app.route("/pacientes/<int:paciente_id>/plan/copiar", methods=["POST"])
def copiar_plan_anterior(paciente_id):
    data = request.json

    plan_anterior = PlanAlimentario.query.filter_by(
        paciente_id=paciente_id
    ).order_by(PlanAlimentario.fecha.desc()).first()

    if not plan_anterior:
        return {"error": "no hay plan anterior"}, 404

    nuevo_plan = PlanAlimentario(
        paciente_id=paciente_id,
        fecha=data["fecha"]
    )

    db.session.add(nuevo_plan)
    db.session.commit()

    items = PlanAlimento.query.filter_by(plan_id=plan_anterior.id).all()

    for item in items:
        copia = PlanAlimento(
            plan_id=nuevo_plan.id,
            alimento_id=item.alimento_id,
            comida=item.comida
        )
        db.session.add(copia)

    db.session.commit()

    return {
        "status": "plan copiado",
        "plan_id": nuevo_plan.id
    }, 201

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
