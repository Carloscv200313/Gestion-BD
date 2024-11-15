import { Conex } from "@/util/conexion";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }){
    const id = (await params).id
    const {estado}= await req.json();
    const conex = await Conex()
    const resp = await conex.request()
    .input("id",sql.Int ,id)
    .input("estado", sql.Bit ,estado)
    .query("UPDATE Productos_bodega SET activo=@estado WHERE id_productos_bodega=@id")
    return NextResponse.json(resp)
}