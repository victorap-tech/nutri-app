from flask import Flask, request, jsonify
from datetime import date
from database import db
from models import Paciente
from peso import Peso

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

if __name__ == "__main__":
    app.run(debug=True)
