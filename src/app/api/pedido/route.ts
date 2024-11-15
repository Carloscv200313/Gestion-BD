import { NextRequest, NextResponse } from "next/server";
import { Conex } from "@/util/conexion";
import {verify} from "jsonwebtoken"
import sql from "mssql";
interface User{
    exp: number;
    user: string;
    id_empleado: number;
    cargo: string;
    iat: number;

}
export async function POST(req: NextRequest){
    const cookie = req.cookies.get('mytoken');
    const {plato, cantidad, nombre, estado, cargo}= await req.json();
    if (cookie == undefined) {
        return NextResponse.json("error");
    }
    try {
        const datos = verify(cookie.value, cargo);
        const user = datos as User;
        const id_empleado = user.id_empleado;
        const conex = await Conex();
        const respuesta = await conex.request()
            .input("plato", sql.VarChar, plato)
            .input("cantidad", sql.Int, cantidad)
            .input("id_empleado", sql.Int, id_empleado)
            .input("nombre_cliente", sql.VarChar, nombre)
            .input("estado_pedido", sql.VarChar, estado)
            .execute("InsertarPedido");
        
        return NextResponse.json(respuesta);
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}
export async function GET(){
    const conex = await Conex();
    const respuesta = await conex.request().execute("Pedidos")
    return NextResponse.json(respuesta.recordset)
}
export async function PUT(req: NextRequest) {
    const { pedido_id } = await req.json();
    if (!pedido_id) {
        return NextResponse.json({ error: "Pedido ID is required" }, { status: 400 });
    }

    try {
        const conx = await Conex();
        await conx.request()
            .input('pedido_id', pedido_id)
            .execute('CancelarPedido');
        return NextResponse.json({ message: "Pedido cancelado con éxito" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al cancelar el pedido" }, { status: 500 });
    }
}
