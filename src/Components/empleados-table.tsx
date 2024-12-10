"use client"
import { PlusCircle, Search } from 'lucide-react'
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/Components/ui/dialog"
import { useState, useEffect } from 'react'

interface Empleado {
  id_empleado: number
  DNI: string
  nombre: string
  apellido: string
  cargo: string
  activo: boolean
}
interface NuevoEmpleado {
  DNI: string
  nombre: string
  apellido: string
  cargo: string
  fecha_contrato: string,
  telefono: string,
  usuario?: string,
  contrasena?: string;
}
export function EmpleadosTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [empleados, Setempleados] = useState<Empleado[]>([])
  const [nuevoEmpleado, setNuevoEmpleado] = useState<NuevoEmpleado>({
    DNI: "",
    nombre: "",
    apellido: "",
    cargo: "",
    fecha_contrato: "",
    telefono: "",
    usuario: "",
    contrasena: "",
  })
  const [modalAbierto, setModalAbierto] = useState(false)
  const emplea = async () => {
    await fetch("/api/empleados")
      .then(response => response.json())
      .then(data => Setempleados(data))
  }
  useEffect(() => {
    emplea()
  }, [])
  useEffect(() => {
    const results = empleados.filter(empleado =>
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmpleados(results)
  }, [empleados, searchTerm])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }
  const manejarCambioCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevoEmpleado(prevCliente => ({ ...prevCliente, [name]: value }))
  }
  const abrirModalGuardarPedido = () => {
    setModalAbierto(true)
  }
  const guardarPedido = async () => {
    await fetch("/api/empleados", {
      method: "POST",
      body: JSON.stringify(nuevoEmpleado)
    })
    console.log(nuevoEmpleado)
    setModalAbierto(false)
    window.location.reload();
  }
  const cambiarEstado= async (estado: boolean, id: number)=>{
    console.log(estado)
    const nuevo_estado = !estado
    console.log(nuevo_estado)
    await fetch("/api/empleados/estado", {
      method: "PUT",
      body: JSON.stringify({
        id,
        estado: nuevo_estado
      })
    })
    Setempleados(empleados => empleados.map(persona =>
      persona.id_empleado === id
        ? { ...persona, activo: nuevo_estado }
        : persona
    ));
  }
  return (
    <div className="space-y-4 w-full p-10">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={abrirModalGuardarPedido}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Empleado
            </Button >
          </DialogTrigger>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmpleados.map((empleado) => (
            <TableRow key={empleado.id_empleado}>
              <TableCell>{empleado.id_empleado}</TableCell>
              <TableCell>{empleado.DNI}</TableCell>
              <TableCell>{empleado.nombre}</TableCell>
              <TableCell>{empleado.apellido}</TableCell>
              <TableCell>{empleado.cargo}</TableCell>
              <TableCell>
                <Button
                  onClick={()=> cambiarEstado(empleado.activo, empleado.id_empleado)}
                  variant={empleado.activo ? 'default' : 'destructive'}
                  className="transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {empleado.activo ? "Activo" : "Inactivo"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datos del Empleado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Formulario para Datos del Empleado */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input id="nombre" name="nombre" value={nuevoEmpleado.nombre} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellido" className="text-right">
                Apellido
              </Label>
              <Input id="apellido" name="apellido" value={nuevoEmpleado.apellido} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dni" className="text-right">
                DNI
              </Label>
              <Input id="dni" name="DNI" value={nuevoEmpleado.DNI} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono
              </Label>
              <Input id="telefono" name="telefono" value={nuevoEmpleado.telefono} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargo" className="text-right">
                Cargo
              </Label>
              <Select
                onValueChange={(value) =>
                  setNuevoEmpleado((prev) => ({ ...prev, cargo: value }))
                }
                value={nuevoEmpleado.cargo}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cajero">Cajero</SelectItem>
                  <SelectItem value="cocinero">Cocinero</SelectItem>
                  <SelectItem value="mozo">Mozo</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="ayudante">Ayudante</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_contrato" className="text-right">
                Fecha de Contrato
              </Label>
              <Input type="date" id="fecha_contrato" name="fecha_contrato" value={nuevoEmpleado.fecha_contrato} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usuario" className="text-right">
                Usuario
              </Label>
              <Input id="usuario" name="usuario" value={nuevoEmpleado.usuario || ''} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contrasena" className="text-right">
                Contraseña
              </Label>
              <Input type="password" id="contrasena" name="contrasena" value={nuevoEmpleado.contrasena || ''} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={guardarPedido}>Guardar Empleado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}