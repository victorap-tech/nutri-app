from database import db

class ComposicionCorporal(db.Model):
    __tablename__ = "composicion_corporal"

    id          = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey("paciente.id"), nullable=False)
    fecha       = db.Column(db.Date, nullable=False)
    peso        = db.Column(db.Float)
    grasa       = db.Column(db.Float)   # % grasa corporal
    agua        = db.Column(db.Float)   # % agua total
    musculo     = db.Column(db.Float)   # % masa muscular
    osea        = db.Column(db.Float)   # % masa ósea
    observaciones = db.Column(db.Text)
