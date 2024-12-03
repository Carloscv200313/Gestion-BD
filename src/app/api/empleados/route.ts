import { Conex } from "@/util/conexion";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function GET() {
    const conx = await Conex();
    const resp = await conx.request().execute("GetEmpleados");
    return NextResponse.json(resp.recordset);
}

export async function POST(req: NextRequest) {
    const conx = await Conex();
    const { DNI, nombre, apellido, cargo, fecha_contrato, telefono, usuario, contrasena } = await req.json();

    const request = conx.request()
        .input("DNI", sql.VarChar(), DNI)
        .input("nombre", sql.VarChar(), nombre)
        .input("apellido", sql.VarChar(), apellido)
        .input("cargo", sql.VarChar(), cargo)
        .input("fecha_contrato", sql.DateTime(), fecha_contrato)
        .input("telefono", sql.VarChar(), telefono);

    // Solo agregar usuario y contraseña si no están vacíos
    if (usuario && contrasena) {
        request.input("usuario", sql.VarChar(), usuario);
        request.input("contrasena", sql.VarChar(), contrasena);
    }

    const resp = await request.execute("Crear_empleado");

    return NextResponse.json({
        respuesta: resp.recordset,
        mensaje: usuario && contrasena ? "con usuario" : "sin usuario"
    });
}