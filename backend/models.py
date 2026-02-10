from database import db

class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    edad = db.Column(db.Integer)
    altura = db.Column(db.Float)  # metros
    created_at = db.Column(db.DateTime, server_default=db.func.now())
