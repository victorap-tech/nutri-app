from database import db

class PlanAlimentario(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    paciente_id = db.Column(
        db.Integer,
        db.ForeignKey("paciente.id"),
        nullable=False
    )

    fecha = db.Column(db.Date, nullable=False)

    activo = db.Column(db.Boolean, default=True)  # 🔥 IMPORTANTE
