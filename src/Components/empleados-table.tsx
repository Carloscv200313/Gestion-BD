"use client"

import * as React from "react"
import { PlusCircle, Search } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
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
} from "@/Components/ui/dialog"
import { CrearEmpleadoForm } from "./crear-empleado-form"

interface Empleado {
  id_empleado: number
  DNI: string
  nombre: string
  apellido: string
  cargo: string
}




export function EmpleadosTable() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filteredEmpleados, setFilteredEmpleados] = React.useState<Empleado[]>([])
  const [empleados, Setempleados]=React.useState<Empleado[]>([])
  const router = useRouter()
  const emplea = async () => {
    await fetch("/api/empleados")
      .then(response => response.json())
      .then(data=> Setempleados(data))
  }
  React.useEffect(()=>{ 
    emplea()
  },[])
  React.useEffect(() => {
    const results = empleados.filter(empleado =>
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmpleados(results)
  }, [empleados, searchTerm])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCrearEmpleado = () => {
    // Recargar la página para reflejar los cambios
    // En una aplicación real, podrías actualizar el estado local en su lugar
    router.refresh()
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Empleado</DialogTitle>
            </DialogHeader>
            <CrearEmpleadoForm onSuccess={handleCrearEmpleado} />
          </DialogContent>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

