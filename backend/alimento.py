from database import db

class Alimento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    calorias = db.Column(db.Float)
    activo = db.Column(db.Boolean, default=True)
