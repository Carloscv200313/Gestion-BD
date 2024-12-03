import { Conex } from "@/util/conexion";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function PUT(req: NextRequest) {
    try {
        // Establecer la conexión con la base de datos
        const conx = await Conex();

        // Desestructurar los datos enviados en la solicitud
        const { id, estado } = await req.json();

        // Ejecutar el procedimiento almacenado en la base de datos
        const resp = await conx.request()
            .input("estado", sql.Bit, estado) // estado debe ser un valor 1 o 0
            .input("id", sql.Int, id)         // id debe ser un valor numérico
            .execute("EstadoEmpleado");

        // Verificar si se actualizaron filas
        if (resp.rowsAffected[0] > 0) {
            return NextResponse.json({
                success: true,
                message: `Empleado con ID ${id} actualizado exitosamente`,
            });
        } else {
            return NextResponse.json({
                success: false,
                message: `No se encontró un empleado con el ID ${id} o no se actualizó.`,
            });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Hubo un error al actualizar el estado del empleado.",
        });
    }
}
