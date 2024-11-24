import { Conex } from "@/util/conexion";
import { NextResponse } from "next/server";
export async function GET(){
    const conx = await Conex()
    const resp= await conx.request().execute("GetEmpleados")
    return NextResponse.json(resp.recordset)
}