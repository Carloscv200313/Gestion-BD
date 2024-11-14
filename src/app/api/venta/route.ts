import { NextRequest, NextResponse } from "next/server";
import {verify} from "jsonwebtoken"
import { Conex } from "@/util/conexion";
import sql from "mssql";
interface User{
    exp: number;
    user: string;
    id_empleado: number;
    cargo: string;
    iat: number;

}
export async function POST(req: NextRequest) {
    const cookie = req.cookies.get('mytoken');
    const {total, estado, tipo, metodo, nombre, apellido , ruc, telefono, pedidos} = await req.json();

    if (cookie == undefined) {
        return NextResponse.json("error");
    }
    try {
        const datos = verify(cookie.value, 'mozo');
        const user = datos as User;
        const id_empleado = user.id_empleado;
        console.log(id_empleado);
        console.log(pedidos);
        const conex = await Conex();
        const respuesta = await conex.request()
            .input("total_venta", sql.Float, total)
            .input("id_estado_venta", sql.Int, estado)
            .input("id_tipo_venta", sql.Int, tipo)
            .input("id_metodo_pago", sql.Int, metodo)
            .input("id_empleado", sql.Int, id_empleado)
            .input("nombre", sql.VarChar, nombre)
            .input("apellido", sql.VarChar, apellido)
            .input("ruc", sql.VarChar, ruc)
            .input("telefono", sql.Char, telefono)
            .input("detalles", sql.NVarChar(sql.MAX), JSON.stringify(pedidos))
            .execute("GenerarVenta");
        
        return NextResponse.json(respuesta);
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}
