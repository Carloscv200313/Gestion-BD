import { Conex } from "@/util/conexion";
import sql from "mssql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){
    const conx = await Conex();
    const respuest = await conx.request().execute("ObtenerProductos")
    if(respuest){
        const data = respuest.recordset
        return NextResponse.json(data)
    }
    return NextResponse.json("Error")
}

export async function POST(req: NextRequest){
    const conx = await Conex();
    const {nombre, cantidad, tipo, bodega, precio, stock, activo} = await req.json();
    try {
        const resp = await conx.request()
        .input("nombre", sql.VarChar, nombre)
        .input("cantidad", sql.Int, cantidad)
        .input("tipo", sql.Int, tipo)
        .input("bodega", sql.Int, bodega)
        .input("precio", sql.Float, precio)
        .input("stock", sql.Int, stock)
        .input("activo", sql.Bit, activo)
        .execute("CrearProducto")
        return NextResponse.json(resp);
    } catch (error) {
        return NextResponse.json(error);
    }

}