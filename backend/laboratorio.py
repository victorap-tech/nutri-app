from database import db

class Laboratorio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey("paciente.id"))
    fecha = db.Column(db.Date)

    glucosa = db.Column(db.Float)
    colesterol_total = db.Column(db.Float)
    hdl = db.Column(db.Float)
    ldl = db.Column(db.Float)
    trigliceridos = db.Column(db.Float)
    tsh = db.Column(db.Float)

    observaciones = db.Column(db.Text)
