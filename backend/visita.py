from database import db
from datetime import date

class Visita(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    paciente_id = db.Column(
        db.Integer,
        db.ForeignKey("paciente.id"),
        nullable=False
    )

    fecha = db.Column(db.Date, nullable=False, default=date.today)
    peso = db.Column(db.Float, nullable=False)
    altura = db.Column(db.Float)
    cintura = db.Column(db.Float)

    diagnostico = db.Column(db.Text)

    paciente = db.relationship("Paciente", backref="visitas")
