from flask import Flask, request, jsonify
from database import db
from models import Paciente

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {"status": "Nutri App OK"}

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
    pacientes = Paciente.query.all()
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "edad": p.edad,
            "altura": p.altura
        }
        for p in pacientes
    ])

if __name__ == "__main__":
    app.run(debug=True)
