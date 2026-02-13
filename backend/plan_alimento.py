from database import db

class PlanAlimento(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    plan_id = db.Column(
        db.Integer,
        db.ForeignKey("plan_alimentario.id"),
        nullable=False
    )

    alimento_id = db.Column(
        db.Integer,
        db.ForeignKey("alimento.id"),
        nullable=False
    )

    comida = db.Column(db.String(50), nullable=False)
    cantidad = db.Column(db.String(100))  # 🔥 IMPORTANTE

    alimento = db.relationship("Alimento")
