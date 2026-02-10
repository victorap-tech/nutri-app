from database import db

class Peso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey("paciente.id"), nullable=False)
    peso = db.Column(db.Float, nullable=False)  # kg
    fecha = db.Column(db.Date, nullable=False)

    paciente = db.relationship("Paciente", backref="pesos")
