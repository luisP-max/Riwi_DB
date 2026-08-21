export const createCoder = async (req: Request, res: Response) => {
    try {
        const { nombre, email, estado, clan_id } = req.body;

        // 1. Validaciones básicas de campos obligatorios
        if (!nombre || !email || !estado || !clan_id) {
            return res.status(400).json({ message: 'Error: Los campos nombre, email, estado y clan_id son obligatorios.' });
        }

        if (estado !== 'activo' && estado !== 'inactivo' && estado !== 'graduado') {
            return res.status(400).json({ message: "Error: El estado debe ser estrictamente 'activo', 'inactivo' o 'graduado'." });
        }

        // 2. VALIDACIÓN DE INTEGRIDAD: Verificar si el clan existe físicamente en Postgres
        const clanCheck = await pool.query(`
            SELECT c.id, r.tipo, r.nombre AS ruta_nombre, r.tl_id 
            FROM clanes c 
            INNER JOIN rutas r ON c.ruta_id = r.id 
            WHERE c.id = $1;
        `, [clan_id]);

        if (clanCheck.rows.length === 0) {
            return res.status(404).json({ message: `Error: El Clan con ID ${clan_id} no existe en el sistema.` });
        }

        const infoClan = clanCheck.rows[0];

        // 3. 🆕 REGLA DE NEGOCIO AVANZADA: Control de cupos dinámicos en la ruta avanzada
        if (infoClan.tipo === 'avanzada') {
            const tlId = infoClan.tl_id;
            const rutaNombre = infoClan.ruta_nombre.toLowerCase();

            // Contamos en PostgreSQL cuántos coders tiene asignados actualmente este TL en su ruta avanzada
            const countQuery = `
                SELECT COUNT(*)::INT as total_coders
                FROM coders co
                INNER JOIN clanes cl ON co.clan_id = cl.id
                INNER JOIN rutas ru ON cl.ruta_id = ru.id
                WHERE ru.tl_id = $1;
            `;
            const countResult = await pool.query(countQuery, [tlId]);
            const totalActual = countResult.rows[0].total_coders;

            // Definimos dinámicamente el límite según el rol/materia del Trainer
            let limiteCupo = 25; // Cupo estándar por defecto (ej: Node)
            if (rutaNombre.includes('ia') || rutaNombre.includes('inteligencia') || rutaNombre.includes('automatización')) {
                limiteCupo = 15; // Cupo ultra especializado para el rol de IA
            }

            // Si se intenta sobrepasar el límite definido de la cohorte, bloqueamos la inserción
            if (totalActual >= limiteCupo) {
                return res.status(400).json({ 
                    message: `Error de Matrícula: El TL asignado a la ruta avanzada ya alcanzó su cupo máximo permitido de ${limiteCupo} coders.` 
                });
            }
        }

        // 4. Insertar de forma segura en PostgreSQL tras pasar todos los filtros analíticos
        const query = 'INSERT INTO coders (nombre, email, estado, clan_id) VALUES ($1, $2, $3, $4) RETURNING *;';
        const values = [nombre, email, estado, clan_id];

        const result = await pool.query(query, values);
        return res.status(201).json({ message: 'Coder registrado y asignado a su sala y TL con éxito.', coder: result.rows });

    } catch (error) {
        console.error("❌ ERROR EN POSTGRESQL (POST CODER):", error);
        if (error instanceof Error && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Error: El correo electrónico ya se encuentra registrado por otro estudiante.' });
        }
        return res.status(500).json({ message: 'Error al registrar al coder', error: error instanceof Error ? error.message : error });
    }
};
