from database import db

class PlanAlimento(db.Model):
    __tablename__ = "plan_alimento"
    id         = db.Column(db.Integer, primary_key=True)
    plan_id    = db.Column(db.Integer, db.ForeignKey("plan_alimentario.id"), nullable=False)
    alimento_id = db.Column(db.Integer, db.ForeignKey("alimento.id"), nullable=False)
    comida     = db.Column(db.String(50))
    cantidad   = db.Column(db.String(100))
    dia        = db.Column(db.String(20), default="Todos")
    alimento   = db.relationship("Alimento", lazy="select")
