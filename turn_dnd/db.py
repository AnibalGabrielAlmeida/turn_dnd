import sqlite3

def crear_base_de_datos():
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()

    # Crear tabla de personajes
    c.execute(''' 
    CREATE TABLE IF NOT EXISTS personajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        hp INTEGER NOT NULL,
        hp_max INTEGER NOT NULL,
        iniciativa INTEGER NOT NULL,
        destreza INTEGER NOT NULL,
        clase TEXT NOT NULL,
        estado TEXT DEFAULT 'Normal',
        imagen_url TEXT
    )
    ''')

    # Crear tabla de enemigos
    c.execute('''
    CREATE TABLE IF NOT EXISTS enemigos (
        id INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        hp INTEGER NOT NULL,
        hp_max INTEGER NOT NULL,
        iniciativa INTEGER NOT NULL,
        destreza INTEGER NOT NULL,
        clase TEXT NOT NULL,
        tipo TEXT NOT NULL,
        estado TEXT DEFAULT 'Normal'
    )
    ''')


    # Insertar personajes de ejemplo si no existen
    personajes_iniciales = [
        ('KRUMM', 8, 8, 0, 8, 'Paladin','images/martin.jpg'),
        ('Aeris', 6, 6, 0, 11, 'Druida','images/ana.jpg'),
        ('Edric Caelion', 8, 8, 0, 15, 'Guerrero','images/jose.jpg'),
        ('Drusilla', 9, 9, 0, 18, 'Bruja','images/isa.jpg'),
        ('Ramiel undav', 7, 7, 0, 15, 'Brujo','images/tortu.jpg'),
        ('Yuuki Phantom', 11, 11, 0, 14, 'Druida','images/emily.jpg'),
        ('Althia', 9, 9, 0, 20, 'Picara','images/maca.jpg'),
        ('Tito Calderstone', 4, 4, 0, 11, 'Bardo','images/fer.jpg')
    ]
    
    for nombre, hp, hp_max, iniciativa, destreza, clase, imagen_url in personajes_iniciales:
        # Verificar si el personaje ya existe
        c.execute("SELECT * FROM personajes WHERE nombre = ?", (nombre,))
        if not c.fetchone():  # Si no existe, insertar
            c.execute("INSERT INTO personajes (nombre, hp, hp_max, iniciativa, destreza, clase, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      (nombre, hp, hp_max, iniciativa, destreza, clase, imagen_url))


    
    # Insertar enemigos de ejemplo si no existen
    enemigos_iniciales = [
        (101, 'Orco', 50, 50, 10, 10, 'Guerrero', 'Monstruo'),
        (102, 'Dragón', 200, 200, 5, 11, 'Bestia', 'Jefe')
    ]

    for id, nombre, hp, hp_max, iniciativa, destreza, clase, tipo in enemigos_iniciales:
        # Verificar si el enemigo ya existe
        c.execute("SELECT * FROM enemigos WHERE nombre = ?", (nombre,))
        if not c.fetchone():  # Si no existe, insertar
            c.execute("INSERT INTO enemigos (id, nombre, hp, hp_max, iniciativa, destreza, clase, tipo) VALUES (?,?,?, ?, ?, ?, ?, ?)",
                      (id, nombre, hp, hp_max, iniciativa, destreza, clase, tipo))

    conn.commit()
    conn.close()

    
#Rutas Personajes
def get_personajes():
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute("SELECT * FROM personajes")
    rows = c.fetchall()
    personajes = []
    for row in rows:
        personaje = {
            "id": row[0],
            "nombre": row[1],
            "hp": row[2],
            "hp_max": row[3],  # Agregar hp_max al diccionario
            "iniciativa": row[4],
            "destreza": row[5],
            "clase": row[6],
            "estado": row[7],
            "imagen_url": row[8]
        }
        personajes.append(personaje)
    conn.close()
    return personajes

#obtener un personaje por ID
def get_personaje_por_id(id):
    personajes = get_personajes()  # Obtén todos los personajes
    return next((p for p in personajes if p['id'] == id), None)  # Busca el personaje por ID


def actualizar_personaje(personaje):
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute('''
    UPDATE personajes
    SET hp = ?, estado = ?
    WHERE id = ?
    ''', (personaje['hp'], personaje['estado'], personaje['id']))
    conn.commit()
    conn.close()
    

def eliminar_personaje(id):
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute('DELETE FROM personajes WHERE id = ?', (id,))
    conn.commit()
    conn.close()


#Rutas enemigos
def get_enemigos():
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute("SELECT * FROM enemigos")
    rows = c.fetchall()
    enemigos = []
    for row in rows:
        enemigo = {
            "id": row[0],
            "nombre": row[1],
            "hp": row[2],
            "hp_max": row[3],
            "iniciativa": row[4],
            "destreza": row[5],
            "clase": row[6],
            "tipo": row[7],
            "estado": row[8]
        }
        enemigos.append(enemigo)
    conn.close()
    return enemigos

# Función para obtener un enemigo por ID
def get_enemigo_por_id(id):
    enemigos = get_enemigos()  # Obtén todos los enemigos
    return next((e for e in enemigos if e['id'] == id), None)  # Busca el enemigo por ID

def eliminar_enemigo(id):
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute('DELETE FROM enemigos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    
def actualizar_enemigo(enemigo):
    conn = sqlite3.connect('dnd_turnos.db')
    c = conn.cursor()
    c.execute('''
    UPDATE enemigos
    SET hp = ?, estado = ?
    WHERE id = ?
    ''', (enemigo['hp'], enemigo['estado'], enemigo['id']))
    conn.commit()
    conn.close()

