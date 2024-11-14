import { Conex } from "@/util/conexion";

import { NextResponse } from "next/server";

export async function GET(){
    const conx = await Conex();
    const respuest = await conx.request().execute("ObtenerProductos")
    if(respuest){
        const data = respuest.recordset
        return NextResponse.json(data)
    }
    return NextResponse.json("Error")
}