from flask import Flask, jsonify, request
from flask_cors import CORS  # Importar CORS

from db import *

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Crear la base de datos solo una vez al iniciar el servidor
crear_base_de_datos()

# Ruta para obtener los personajes en formato JSON
@app.route('/personajes', methods=['GET'])
def obtener_personajes():
    personajes = get_personajes()
    return jsonify(personajes)

# Ruta para actualizar el daño del personaje
@app.route('/personajes/<int:id>/daño', methods=['PATCH'])
def actualizar_dano(id):
    data = request.get_json()
    daño = data.get('daño')
    
    if daño is not None:
        personaje = get_personaje_por_id(id)  # Obtiene solo el personaje por su id
        
        if personaje:
            personaje['hp'] -= daño
            if personaje['hp'] < 0:
                personaje['hp'] = 0
            actualizar_personaje(personaje)  # Actualiza en la DB
            return jsonify({'mensaje': f'Personaje {personaje["nombre"]} ha recibido {daño} de daño, HP ahora: {personaje["hp"]}'}), 200
        else:
            return jsonify({'mensaje': 'Personaje no encontrado'}), 404
    return jsonify({'mensaje': 'Daño no proporcionado'}), 400

# Ruta para curar al personaje
@app.route('/personajes/<int:id>/curar', methods=['PATCH'])
def curar_personaje(id):
    data = request.get_json()
    curacion = data.get('curacion')
    
    if curacion is not None:
        personaje = get_personaje_por_id(id)  # Obtiene solo el personaje por su id
        
        if personaje:
            personaje['hp'] += curacion
            # No dejes que suba más allá de su HP máximo (si tienes hp_max en la base de datos)
            if 'hp_max' in personaje and personaje['hp'] > personaje['hp_max']:
                personaje['hp'] = personaje['hp_max']
            actualizar_personaje(personaje)  # Actualiza en la DB
            return jsonify({'mensaje': f'Personaje {personaje["nombre"]} ha sido curado, HP ahora: {personaje["hp"]}'}), 200
        else:
            return jsonify({'mensaje': 'Personaje no encontrado'}), 404
    return jsonify({'mensaje': 'Curación no proporcionada'}), 400

# Ruta para aplicar un estado alterado al personaje
@app.route('/personajes/<int:id>/estado', methods=['PATCH'])
def aplicar_estado(id):
    data = request.get_json()
    estado = data.get('estado')
    
    if estado:
        personaje = get_personaje_por_id(id)  # Obtiene solo el personaje por su id
        
        if personaje:
            personaje['estado'] = estado  # Actualiza el estado alterado
            actualizar_personaje(personaje)  # Actualiza en la DB
            return jsonify({'mensaje': f'Personaje {personaje["nombre"]} ha recibido el estado: {estado}'}), 200
        else:
            return jsonify({'mensaje': 'Personaje no encontrado'}), 404
    return jsonify({'mensaje': 'Estado no proporcionado'}), 400

# Ruta para obtener los enemigos en formato JSON
@app.route('/enemigos', methods=['GET'])
def obtener_enemigos():
    enemigos = get_enemigos()
    return jsonify(enemigos)

# Ruta para actualizar el daño de un enemigo
@app.route('/enemigos/<int:id>/daño', methods=['PATCH'])
def actualizar_dano_enemigo(id):
    data = request.get_json()
    daño = data.get('daño')
    
    if daño is not None:
        enemigo = get_enemigo_por_id(id)  # Obtiene solo el enemigo por su id
        
        if enemigo:
            enemigo['hp'] -= daño
            if enemigo['hp'] < 0:
                enemigo['hp'] = 0
            actualizar_enemigo(enemigo)  # Actualiza en la DB
            return jsonify({'mensaje': f'Enemigo {enemigo["nombre"]} ha recibido {daño} de daño, HP ahora: {enemigo["hp"]}'}), 200
        else:
            return jsonify({'mensaje': 'Enemigo no encontrado'}), 404
    return jsonify({'mensaje': 'Daño no proporcionado'}), 400

# Ruta para curar al enemigo
@app.route('/enemigos/<int:id>/curar', methods=['PATCH'])
def curar_enemigo(id):
    data = request.get_json()
    curacion = data.get('curacion')
    
    if curacion is not None:
        enemigo = get_enemigo_por_id(id)  # Obtiene solo el enemigo por su id
        
        if enemigo:
            enemigo['hp'] += curacion
            # No dejes que suba más allá de su HP máximo (si tienes hp_max en la base de datos)
            if 'hp_max' in enemigo and enemigo['hp'] > enemigo['hp_max']:
                enemigo['hp'] = enemigo['hp_max']
            actualizar_enemigo(enemigo)  # Actualiza en la DB
            return jsonify({'mensaje': f'Enemigo {enemigo["nombre"]} ha sido curado, HP ahora: {enemigo["hp"]}'}), 200
        else:
            return jsonify({'mensaje': 'Enemigo no encontrado'}), 404
    return jsonify({'mensaje': 'Curación no proporcionada'}), 400

# Ruta para aplicar un estado alterado al enemigo
@app.route('/enemigos/<int:id>/estado', methods=['PATCH'])
def aplicar_estado_enemigo(id):
    data = request.get_json()
    estado = data.get('estado')
    
    if estado:
        enemigo = get_enemigo_por_id(id)  # Obtiene solo el enemigo por su id
        
        if enemigo:
            enemigo['estado'] = estado  # Actualiza el estado alterado
            actualizar_enemigo(enemigo)  # Actualiza en la DB
            return jsonify({'mensaje': f'Enemigo {enemigo["nombre"]} ha recibido el estado: {estado}'}), 200
        else:
            return jsonify({'mensaje': 'Enemigo no encontrado'}), 404
    return jsonify({'mensaje': 'Estado no proporcionado'}), 400

if __name__ == '__main__':
    app.run(debug=True)
