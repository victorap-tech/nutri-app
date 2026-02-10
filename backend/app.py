from flask import Flask, request, jsonify
from datetime import date
from database import db
from models import Paciente
from peso import Peso
from alimento import Alimento
from plan import PlanAlimentario
from plan_alimento import PlanAlimento

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {"status": "Nutri App OK"}

# ---------------- PACIENTES ----------------

@app.route("/pacientes", methods=["POST"])
def crear_paciente():
    data = request.json
    paciente = Paciente(
        nombre=data["nombre"],
        edad=data.get("edad"),
        altura=data.get("altura")
    )
    db.session.add(paciente)
    db.session.commit()
    return jsonify({"id": paciente.id}), 201

@app.route("/pacientes", methods=["GET"])
def listar_pacientes():
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "edad": p.edad,
            "altura": p.altura
        }
        for p in Paciente.query.all()
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
if __name__ == "__main__":
    app.run(debug=True)
