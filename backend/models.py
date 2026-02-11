from database import db


class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)

    edad = db.Column(db.Integer)
    altura = db.Column(db.Float)
    peso = db.Column(db.Float)

    cintura = db.Column(db.Float)              # NUEVO
    fecha_visita = db.Column(db.Date)          # NUEVO
    diagnostico = db.Column(db.Text)           # YA AGREGADO
