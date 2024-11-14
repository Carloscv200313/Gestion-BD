import { Conex } from "@/util/conexion";

import { NextRequest, NextResponse } from "next/server";

export async function GET(){
    const conx = await Conex();
    const respuest = await conx.request().execute("ObtenerPlatos")
    if(respuest){
        const data = respuest.recordset
        return NextResponse.json(data)
    }
    return NextResponse.json("Error")
}

export async function PUT(req:NextRequest) {
    const { plato_id, nuevo_estado } = await req.json();
    if (!plato_id || !nuevo_estado) {
        return NextResponse.json({ error: "Plato ID and nuevo_estado are required" }, { status: 400 });
    }

    try {
        const conx = await Conex();
        await conx.request()
            .input('plato_id', plato_id)
            .input('nuevo_estado', nuevo_estado)
            .execute('EditarEstadoPlato');
        return NextResponse.json({ message: "Estado del plato actualizado con éxito" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al actualizar el estado del plato" }, { status: 500 });
    }
}
