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
        .input("contraseña", sql.Int, Number(password))
        .query("SELECT * FROM Credencial WHERE usuario=@usuario and contraseña=@contraseña");

    if (result.rowsAffected[0] === 1) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 60, // 1 minuto de expiración
                user,
                password,
            },
            'secret' // Clave secreta para firmar el token
        );

        // Serializar la cookie
        const serialized = serialize("mytoken", token, {
            httpOnly: true, // Para mayor seguridad, solo accesible por el servidor
            maxAge: 60,     // Duración de 1 minuto
            path: "/"       // Accesible en toda la aplicación
        });

        // Crear una respuesta con la cookie en las cabeceras
        const response = NextResponse.json("hola");
        response.headers.set("Set-Cookie", serialized);
        
        return response;
    }

    return NextResponse.json({ message: "Usuario no existe" });
}
