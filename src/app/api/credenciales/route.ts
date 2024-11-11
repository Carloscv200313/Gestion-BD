import { NextRequest, NextResponse } from "next/server";
import { Conex } from "@/util/conexion";
import sql from "mssql"
export  async function POST(req : NextRequest){
    const conx= await Conex();
    const {user, password} = await req.json();
    console.log(user, password)
    const result = await conx.request()
    .input("usuario", sql.VarChar, user)
    .input("contraseña", sql.Int, Number(password))
    .query("SELECT * FROM Credencial WHERE usuario=@usuario and contraseña=@contraseña");
    if (result.rowsAffected[0]===1){
        return NextResponse.json(result.recordset[0])
    }
    return NextResponse.json({message:"Usuario no existe"})
}