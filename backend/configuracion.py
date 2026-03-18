from database import db

class Configuracion(db.Model):
    __tablename__ = "configuracion"
    clave = db.Column(db.String(50), primary_key=True)
    valor = db.Column(db.Text)
