import { NextRequest, NextResponse } from "next/server";
import { Conex } from "@/util/conexion";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
    const conx = await Conex();
    const { user, password } = await req.json();
    console.log(user, password);
    const result = await conx.request()
        .input("usuario", sql.VarChar, user)
        .input("contrasena", sql.VarChar, password)
        .execute("Validar_usuario")

    if (!result.recordset[0].mensaje) {
        const {id_empleado, cargo}= result.recordset[0]
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 60*60*24, // 1 minuto de expiración
                user,
                id_empleado,
                cargo
            },
            cargo // Clave secreta para firmar el token
        );

        // Serializar la cookie
        const serialized = serialize("mytoken", token, {
            httpOnly: true, // Para mayor seguridad, solo accesible por el servidor
            maxAge: 60*60*24,     // Duración de 1 minuto
            path: "/"       // Accesible en toda la aplicación
        });

        // Crear una respuesta con la cookie en las cabeceras
        const response = NextResponse.json(cargo);
        response.headers.set("Set-Cookie", serialized);
        
        return response;
    }

    return NextResponse.json({ message: "Usuario no existe" });
}
