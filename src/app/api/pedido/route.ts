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
    const {plato, cantidad, nombre, estado}= await req.json();
    if (cookie == undefined) {
        return NextResponse.json("error");
    }
    try {
        const datos = verify(cookie.value, 'mozo');
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