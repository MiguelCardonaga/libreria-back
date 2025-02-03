# libreria-back

Este proyecto back fue desarrollado con node v16.20.2 y npm 8.19.4
paso 1: Bajar el repositorio al computador local.
paso 2: Abrir el proyecto e instalar paquetes con npm install.
paso 3: Este api fue desarrollada con base de datos sql, a continuación ponder la creación de respectivas tablas:
      CREATE DATABASE libreria
      USE libreria;

      create table USUARIOS(
      ID INT IDENTITY(1,1) PRIMARY KEY,
      NOMBRE_COMPLETO VARCHAR (45),
      TIPO_DOCUMENTO VARCHAR (25),
      NUMERO_DOCUMENTO VARCHAR (45),
      CORREO VARCHAR (65),
      CONTRASENA varchar(75)
      );

      CREATE TABLE GENEROS (
    ID INT PRIMARY KEY IDENTITY(1,1),
    GENERO VARCHAR(100) NOT NULL
    );

    INSERT INTO GENEROS (GENERO) VALUES 
    ('No identificado'), 
    ('Varios'), 
    ('Misterio'), 
    ('Ciencia Ficción'), 
    ('Fantasía'), 
    ('Terror'), 
    ('Romance'), 
    ('Aventura'), 
    ('Histórico'), 
    ('Biografía'), 
    ('Drama'), 
    ('Thriller'), 
    ('Autoayuda');


    
    CREATE TABLE ESTADOS (
        ID INT PRIMARY KEY IDENTITY(1,1),
        ESTADO VARCHAR(50) NOT NULL
    );


    INSERT INTO ESTADOS (ESTADO) VALUES ('No identificado'), ('Perdido'), ('Prestado'), ('Reservado'), ('Disponible');
    INSERT INTO ESTADOS (ESTADO) VALUES ('Inactivo');


    CREATE TABLE LIBROS (
    ID INT PRIMARY KEY IDENTITY(1,1),
    TITULO VARCHAR(255) NOT NULL,
    AUTOR VARCHAR(255),
    AÑO_PUBLICACION INT,  
    GENERO_ID INT DEFAULT 1,
    ESTADO_ID INT DEFAULT 1,
    FOREIGN KEY (GENERO_ID) REFERENCES GENEROS(ID),
    FOREIGN KEY (ESTADO_ID) REFERENCES ESTADOS(ID)
    );


esas son las tablas necesarias para correr el API.

paso 4: Modificar la configuración de la db.js, en este caso la conexión se manejo por medio de windows authentication

