from database import db

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)

    edad = db.Column(db.Integer)
    altura = db.Column(db.Float)
    peso = db.Column(db.Float)

    diagnostico = db.Column(db.Text)   # 👈 NUEVO
