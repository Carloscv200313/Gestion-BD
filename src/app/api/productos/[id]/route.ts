import { Conex } from "@/util/conexion";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }){
    const id = (await params).id
    const {nombre, cantidad, tipo, bodega, precio, stock }= await req.json();
    const conex = await Conex()
    const resp = await conex.request()
    .input("id",sql.Int ,id)
    .input("nombre",sql.VarChar() ,nombre)
    .input("cantidad",sql.Int ,cantidad)
    .input("tipo",sql.Int ,tipo)
    .input("bodega",sql.Int ,bodega)
    .input("precio",sql.Float() ,precio)
    .input("stock",sql.Int ,stock)
    .execute("EditarProducto")
    return NextResponse.json(resp)
}