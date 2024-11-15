import { NextResponse } from "next/server";
import { Conex } from "@/util/conexion";
//import sql from "sql"
export async function GET(){
    const conex= await Conex()
    const resp= await conex.request().execute("Revisar_productos_bodega")
    return NextResponse.json(resp.recordset)
}