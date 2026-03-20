from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import date
from database import db
from models import Paciente
from alimento import Alimento
from plan import PlanAlimentario
from plan_alimento import PlanAlimento
from pdf import generar_pdf_plan
from visita import Visita
from laboratorio import Laboratorio
from composicion import ComposicionCorporal
from configuracion import Configuracion
import os
import traceback

app = Flask(__name__)
CORS(app)

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL no está definida")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "not_found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "internal_server_error"}), 500

def to_float(valor):
    if valor is None or valor == "":
        return None
    if isinstance(valor, str):
        valor = valor.replace(",", ".")
    try:
        return float(valor)
    except:
        return None

def calcular_imc(peso, altura):
    if not peso or not altura:
        return None, None
    try:
        imc = peso / (altura * altura)
    except:
        return None, None
    imc = round(imc, 2)
    if imc < 18.5:   rango = "Bajo peso"
    elif imc < 25:   rango = "Normal"
    elif imc < 30:   rango = "Sobrepeso"
    else:            rango = "Obesidad"
    return imc, rango

def get_or_404(model, id):
    obj = db.session.get(model, id)
    if obj is None:
        from flask import abort
        abort(404)
    return obj

@app.route("/")
def home():
    return jsonify({"status": "Nutri App OK"})

# ---------------- PACIENTES ----------------

@app.route("/pacientes", methods=["POST"])
def crear_paciente():
    data = request.json or {}
    paciente = Paciente(
        nombre=data.get("nombre"),
        apellido=data.get("apellido"),
        dni=data.get("dni"),
        edad=data.get("edad"),
        altura=to_float(data.get("altura")),
        peso=to_float(data.get("peso")),
        cintura=to_float(data.get("cintura")),
        fecha_visita=date.fromisoformat(data["fecha_visita"]) if data.get("fecha_visita") else None,
        diagnostico=data.get("diagnostico"),
        presion_sistolica=data.get("presion_sistolica"),
        presion_diastolica=data.get("presion_diastolica")
    )
    db.session.add(paciente)
    db.session.commit()
    return jsonify({"id": paciente.id}), 201

@app.route("/pacientes", methods=["GET"])
def listar_pacientes():
    pacientes = Paciente.query.all()
    return jsonify([
        {
            "id": p.id, "nombre": p.nombre, "apellido": p.apellido,
            "dni": p.dni, "edad": p.edad, "altura": p.altura,
            "peso": p.peso, "cintura": p.cintura,
            "fecha_visita": p.fecha_visita.isoformat() if p.fecha_visita else None,
            "diagnostico": p.diagnostico,
            "presion_sistolica": p.presion_sistolica,
            "presion_diastolica": p.presion_diastolica
        }
        for p in pacientes
    ])

@app.route("/pacientes/<int:paciente_id>", methods=["GET"])
def obtener_paciente(paciente_id):
    p = get_or_404(Paciente, paciente_id)
    imc, rango = calcular_imc(p.peso, p.altura)
    return jsonify({
        "id": p.id, "nombre": p.nombre, "apellido": p.apellido,
        "dni": p.dni, "edad": p.edad, "altura": p.altura,
        "peso": p.peso, "cintura": p.cintura,
        "fecha_visita": p.fecha_visita.isoformat() if p.fecha_visita else None,
        "diagnostico": p.diagnostico,
        "presion_sistolica": p.presion_sistolica,
        "presion_diastolica": p.presion_diastolica,
        "imc": imc, "rango_imc": rango
    })

@app.route("/pacientes/<int:paciente_id>", methods=["PUT"])
def actualizar_paciente(paciente_id):
    data = request.json or {}
    paciente = get_or_404(Paciente, paciente_id)
    paciente.nombre    = data.get("nombre")
    paciente.apellido  = data.get("apellido")
    paciente.dni       = data.get("dni")
    paciente.edad      = data.get("edad")
    paciente.altura    = to_float(data.get("altura"))
    paciente.peso      = to_float(data.get("peso"))
    paciente.cintura   = to_float(data.get("cintura"))
    paciente.fecha_visita = date.fromisoformat(data["fecha_visita"]) if data.get("fecha_visita") else None
    paciente.diagnostico  = data.get("diagnostico")
    paciente.presion_sistolica  = data.get("presion_sistolica")
    paciente.presion_diastolica = data.get("presion_diastolica")
    db.session.commit()
    return jsonify({"status": "paciente actualizado"})

@app.route("/pacientes/<int:paciente_id>", methods=["DELETE"])
def eliminar_paciente(paciente_id):
    paciente = get_or_404(Paciente, paciente_id)
    db.session.delete(paciente)
    db.session.commit()
    return jsonify({"status": "paciente eliminado"})

@app.route("/pacientes/buscar")
def buscar_paciente():
    q = (request.args.get("q") or "").strip()
    pacientes = Paciente.query.filter(
        (Paciente.nombre.ilike(f"%{q}%")) |
        (Paciente.apellido.ilike(f"%{q}%")) |
        (Paciente.dni.ilike(f"%{q}%"))
    ).all()
    return jsonify([
        {"id": p.id, "nombre": p.nombre, "apellido": p.apellido, "dni": p.dni, "edad": p.edad, "altura": p.altura, "peso": p.peso}
        for p in pacientes
    ])

# ---------------- VISITAS ----------------

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["POST"])
def crear_visita(paciente_id):
    data = request.json or {}
    peso   = to_float(data.get("peso"))
    altura = to_float(data.get("altura"))
    cintura = to_float(data.get("cintura"))
    imc, rango = calcular_imc(peso, altura)
    visita = Visita(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        peso=peso, altura=altura, cintura=cintura,
        diagnostico=data.get("diagnostico")
    )
    db.session.add(visita)
    db.session.commit()
    return jsonify({"status": "visita creada", "imc": imc, "rango_imc": rango}), 201

@app.route("/pacientes/<int:paciente_id>/visitas", methods=["GET"])
def listar_visitas(paciente_id):
    visitas = Visita.query.filter_by(paciente_id=paciente_id).order_by(Visita.fecha.desc()).all()
    return jsonify([
        {"id": v.id, "fecha": v.fecha.isoformat(), "peso": v.peso, "altura": v.altura, "cintura": v.cintura, "diagnostico": v.diagnostico}
        for v in visitas
    ])

@app.route("/visitas/<int:visita_id>", methods=["PUT"])
def actualizar_visita(visita_id):
    data = request.json or {}
    visita = get_or_404(Visita, visita_id)
    visita.fecha       = date.fromisoformat(data["fecha"])
    visita.peso        = to_float(data.get("peso"))
    visita.altura      = to_float(data.get("altura"))
    visita.cintura     = to_float(data.get("cintura"))
    visita.diagnostico = data.get("diagnostico")
    db.session.commit()
    return jsonify({"status": "visita actualizada"})

@app.route("/visitas/<int:visita_id>", methods=["DELETE"])
def eliminar_visita(visita_id):
    visita = get_or_404(Visita, visita_id)
    db.session.delete(visita)
    db.session.commit()
    return jsonify({"status": "visita eliminada"})

# ---------------- LABORATORIO ----------------

@app.route("/pacientes/<int:paciente_id>/laboratorio", methods=["POST"])
def crear_laboratorio(paciente_id):
    data = request.json or {}
    lab = Laboratorio(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        glucosa=data.get("glucosa"),
        colesterol_total=data.get("colesterol_total"),
        hdl=data.get("hdl"),
        ldl=data.get("ldl"),
        trigliceridos=data.get("trigliceridos"),
        tsh=data.get("tsh"),
        observaciones=data.get("observaciones")
    )
    db.session.add(lab)
    db.session.commit()
    return jsonify({"status": "laboratorio creado"}), 201

@app.route("/pacientes/<int:paciente_id>/laboratorio", methods=["GET"])
def listar_laboratorio(paciente_id):
    labs = Laboratorio.query.filter_by(paciente_id=paciente_id).order_by(Laboratorio.fecha.desc()).all()
    return jsonify([
        {
            "id": l.id, "fecha": l.fecha.isoformat(),
            "glucosa": l.glucosa, "colesterol_total": l.colesterol_total,
            "hdl": l.hdl, "ldl": l.ldl, "trigliceridos": l.trigliceridos,
            "tsh": l.tsh, "observaciones": l.observaciones
        }
        for l in labs
    ])

@app.route("/laboratorio/<int:lab_id>", methods=["DELETE"])
def eliminar_laboratorio(lab_id):
    lab = get_or_404(Laboratorio, lab_id)
    db.session.delete(lab)
    db.session.commit()
    return jsonify({"status": "laboratorio eliminado"})

# ---------------- ALIMENTOS ----------------

@app.route("/alimentos", methods=["POST"])
def crear_alimento():
    data = request.json or {}
    alimento = Alimento(nombre=data["nombre"], categoria=data["categoria"], calorias=data.get("calorias"))
    db.session.add(alimento)
    db.session.commit()
    return jsonify({"id": alimento.id}), 201

@app.route("/alimentos", methods=["GET"])
def listar_alimentos():
    alimentos = Alimento.query.filter_by(activo=True).all()
    return jsonify([{"id": a.id, "nombre": a.nombre, "categoria": a.categoria, "calorias": a.calorias} for a in alimentos])

@app.route("/alimentos/<int:alimento_id>", methods=["PUT"])
def actualizar_alimento(alimento_id):
    data = request.json or {}
    alimento = get_or_404(Alimento, alimento_id)
    alimento.nombre    = data.get("nombre", alimento.nombre)
    alimento.categoria = data.get("categoria", alimento.categoria)
    alimento.calorias  = to_float(data.get("calorias"))
    db.session.commit()
    return jsonify({"status": "alimento actualizado"})

@app.route("/alimentos/<int:alimento_id>", methods=["DELETE"])
def desactivar_alimento(alimento_id):
    alimento = get_or_404(Alimento, alimento_id)
    alimento.activo = False
    db.session.commit()
    return jsonify({"status": "alimento desactivado"})

# ---------------- PLANES ----------------

@app.route("/pacientes/<int:paciente_id>/plan", methods=["POST"])
def crear_plan(paciente_id):
    data = request.json or {}
    fecha_str = data.get("fecha")
    if not fecha_str:
        return jsonify({"error": "fecha_requerida"}), 400
    try:
        fecha = date.fromisoformat(fecha_str)
    except ValueError:
        return jsonify({"error": "fecha_invalida"}), 400
    for p in PlanAlimentario.query.filter_by(paciente_id=paciente_id, activo=True).all():
        p.activo = False
    plan = PlanAlimentario(paciente_id=paciente_id, fecha=fecha, activo=True)
    db.session.add(plan)
    db.session.commit()
    return jsonify({"plan_id": plan.id}), 201

@app.route("/pacientes/<int:paciente_id>/plan", methods=["GET"])
def ver_plan_actual(paciente_id):
    try:
        plan = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
        if not plan:
            return jsonify({"error": "sin_plan"}), 404
        items = PlanAlimento.query.filter_by(plan_id=plan.id).all()
        alimentos_out = []
        for i in items:
            alimento_obj = db.session.get(Alimento, i.alimento_id)
            nombre   = alimento_obj.nombre   if alimento_obj else "(eliminado)"
            categoria = alimento_obj.categoria if alimento_obj else ""
            alimentos_out.append({
                "item_id": i.id, "alimento_id": i.alimento_id,
                "nombre": nombre, "categoria": categoria,
                "comida": i.comida, "cantidad": i.cantidad, "dia": i.dia or "Todos"
            })
        return jsonify({"plan_id": plan.id, "fecha": plan.fecha.isoformat(), "alimentos": alimentos_out})
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "internal_server_error"}), 500

@app.route("/pacientes/<int:paciente_id>/planes", methods=["GET"])
def listar_planes(paciente_id):
    planes = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).all()
    return jsonify([{"id": p.id, "fecha": p.fecha.isoformat()} for p in planes])

@app.route("/planes/<int:plan_id>/alimentos", methods=["POST"])
def agregar_alimento_plan(plan_id):
    data = request.json or {}
    pa = PlanAlimento(plan_id=plan_id, alimento_id=data["alimento_id"], comida=data["comida"], cantidad=data.get("cantidad"), dia=data.get("dia", "Todos"))
    db.session.add(pa)
    db.session.commit()
    return jsonify({"status": "alimento agregado"}), 201

@app.route("/plan_item/<int:item_id>", methods=["DELETE"])
def eliminar_item_plan(item_id):
    item = get_or_404(PlanAlimento, item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"status": "item eliminado"})

@app.route("/pacientes/<int:paciente_id>/plan/pdf", methods=["GET"])
def plan_pdf(paciente_id):
    paciente = get_or_404(Paciente, paciente_id)
    plan = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
    if not plan:
        return jsonify({"error": "sin_plan"}), 404
    items = PlanAlimento.query.filter_by(plan_id=plan.id).all()
    claves = ["prof_nombre", "prof_matricula", "prof_especialidad", "prof_firma"]
    profesional = {}
    for clave in claves:
        conf = db.session.get(Configuracion, clave)
        key = clave.replace("prof_", "")
        profesional[key] = conf.valor if conf else ""
    pdf = generar_pdf_plan(paciente, plan, items, profesional=profesional)
    return send_file(pdf, mimetype="application/pdf", download_name=f"plan_{paciente.nombre}.pdf", as_attachment=True)

@app.route("/pacientes/<int:paciente_id>/plan/copiar", methods=["POST"])
def copiar_plan_anterior(paciente_id):
    data = request.json or {}
    plan_anterior = PlanAlimentario.query.filter_by(paciente_id=paciente_id).order_by(PlanAlimentario.fecha.desc()).first()
    if not plan_anterior:
        return jsonify({"error": "no_hay_plan_anterior"}), 404
    fecha_nueva = date.fromisoformat(data["fecha"])
    nuevo_plan = PlanAlimentario(paciente_id=paciente_id, fecha=fecha_nueva, activo=True)
    db.session.add(nuevo_plan)
    db.session.commit()
    for item in PlanAlimento.query.filter_by(plan_id=plan_anterior.id).all():
        db.session.add(PlanAlimento(plan_id=nuevo_plan.id, alimento_id=item.alimento_id, comida=item.comida, cantidad=item.cantidad))
    db.session.commit()
    return jsonify({"status": "plan copiado", "plan_id": nuevo_plan.id}), 201

# ---------------- CONFIGURACION ----------------

CLAVES_VALIDAS = ["prof_nombre", "prof_matricula", "prof_especialidad", "prof_firma", "tg_bot_token", "tg_chat_id", "agenda_hora_inicio", "agenda_hora_fin"]

@app.route("/configuracion", methods=["GET"])
def get_configuracion():
    result = {}
    for clave in CLAVES_VALIDAS:
        conf = db.session.get(Configuracion, clave)
        result[clave] = conf.valor if conf else ""
    return jsonify(result)

@app.route("/configuracion", methods=["PUT"])
def set_configuracion():
    data = request.json or {}
    for clave in CLAVES_VALIDAS:
        if clave in data:
            conf = db.session.get(Configuracion, clave)
            if conf:
                conf.valor = data[clave]
            else:
                db.session.add(Configuracion(clave=clave, valor=data[clave]))
    db.session.commit()
    return jsonify({"status": "configuracion guardada"})

# ---------------- COMPOSICION CORPORAL ----------------

@app.route("/pacientes/<int:paciente_id>/composicion", methods=["POST"])
def crear_composicion(paciente_id):
    data = request.json or {}
    comp = ComposicionCorporal(
        paciente_id=paciente_id,
        fecha=date.fromisoformat(data["fecha"]),
        peso=to_float(data.get("peso")),
        grasa=to_float(data.get("grasa")),
        agua=to_float(data.get("agua")),
        musculo=to_float(data.get("musculo")),
        osea=to_float(data.get("osea")),
        observaciones=data.get("observaciones")
    )
    db.session.add(comp)
    db.session.commit()
    return jsonify({"id": comp.id}), 201

@app.route("/pacientes/<int:paciente_id>/composicion", methods=["GET"])
def listar_composicion(paciente_id):
    registros = ComposicionCorporal.query.filter_by(paciente_id=paciente_id).order_by(ComposicionCorporal.fecha.desc()).all()
    return jsonify([
        {"id": r.id, "fecha": r.fecha.isoformat(), "peso": r.peso, "grasa": r.grasa, "agua": r.agua, "musculo": r.musculo, "osea": r.osea, "observaciones": r.observaciones}
        for r in registros
    ])

@app.route("/composicion/<int:comp_id>", methods=["DELETE"])
def eliminar_composicion(comp_id):
    comp = get_or_404(ComposicionCorporal, comp_id)
    db.session.delete(comp)
    db.session.commit()
    return jsonify({"status": "eliminado"})
@app.route("/admin/reset", methods=["POST"])
def reset_datos():
    """Borra todos los datos clínicos, deja configuración y alimentos intactos"""
    try:
        ComposicionCorporal.query.delete()
        Laboratorio.query.delete()
        PlanAlimento.query.delete()
        PlanAlimentario.query.delete()
        Visita.query.delete()
        Paciente.query.delete()
        db.session.execute(db.text("ALTER SEQUENCE paciente_id_seq RESTART WITH 1"))
        db.session.execute(db.text("ALTER SEQUENCE visita_id_seq RESTART WITH 1"))
        db.session.execute(db.text("ALTER SEQUENCE plan_alimentario_id_seq RESTART WITH 1"))
        db.session.commit()
        return jsonify({"status": "reset ok"})
    except Exception:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "no_se_pudo_resetear"}), 500
