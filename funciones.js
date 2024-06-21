const { Pool } = require("pg")

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "1234",
    port: 5432,
    database: "bancosolar",
});

const create = async(dato) => {
    try{
        
        const query = {
            text: "INSERT INTO usuarios(nombre, balance) VALUES ($1, $2) RETURNING *",
            values: dato
        }
        const result = await pool.query(query);
        return result;

    } catch(err){
        console.error("error al insertar", err);

    }
};

const consultar = async()=>{
    try{
        const consulta = {
            text: "SELECT * FROM usuarios"
        }
        result = await pool.query(consulta);
        return result.rows;
    }catch(error){
        console.error("error de consulta", error);
    }
};

const editar = async(dato)=>{
    try{
        const consulta = {
            text: "UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1",            
            values: dato
        }
        const result = await pool.query(consulta);
        
        return result;
    }catch(error){
        console.error("error de consulta", error);
    }
};

const eliminar = async (id) => {
    try {
        const consulta = {
            text: "DELETE FROM usuarios WHERE id = $1",
            values: [id],
        };
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.error("Error de consulta", error);
    }
};

const obtenerId = async(nombre)=>{
    const result = await pool.query(`SELECT id FROM usuarios WHERE nombre = '${nombre}'`);
    return result.rows[0].id;
}
const createTransferencia = async (emisorNombre, receptorNombre, monto) => {
    try{
        const emisor = await obtenerId(emisorNombre);
        const receptor = await obtenerId(receptorNombre);
        await pool.query("BEGIN");
        const descontar = {
            text: "UPDATE usuarios SET balance = balance - $2 WHERE id = $1",
            values: [emisor, monto]
        }
        await pool.query(descontar);
        const acreditar = {
            text: "UPDATE usuarios SET balance = balance + $2 WHERE id = $1",
            values: [receptor, monto]
        }
        await pool.query(acreditar)
        const transferencia = {
            text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW())",
            values: [emisor, receptor, monto]
        }
        await pool.query(transferencia);
        await pool.query("COMMIT")
        return { success: true };

    } catch (error) {
        console.error("Error al crear transferencia", error);
        await pool.query("ROLLBACK");
    }
};

const obtenerTransferencias = async()=>{
    try{
        const consulta = {
            text: "SELECT usuario1.nombre AS emisor, usuario2.nombre AS receptor, t.monto FROM usuarios usuario1 INNER JOIN transferencias t ON usuario1.id = t.emisor INNER JOIN usuarios usuario2 ON usuario2.id = t.receptor"
        }
        const result = await pool.query(consulta);
        return result.rows
    }catch (error) {
        console.error("Error al consultar transferencias", error);
    }
}

module.exports = {create, consultar, editar, eliminar, createTransferencia, obtenerTransferencias};