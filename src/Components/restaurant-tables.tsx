'use client'

import { useState, useCallback, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Button } from "@/Components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface Pedidos {
  id: number;
  plato: string;
  cantidad: number;
  nombre_empleado: string;
  nombre_cliente: string;
  estado_pedido: string;
}
interface Plato {
  id_plato: number
  nombre_plato: string
  estado: string
  precio: number
  tipo: string
}
export function RestaurantTablesComponent() {
  const [pedido, setPedidos] = useState<Pedidos[]>([])
  const [platos, setPlatos] = useState<Plato[]>([])
  useEffect(() => {
    pedidos()
    plato()
  }, [])
  const pedidos = async () => {
    await fetch("/api/pedido")
      .then(response => response.json())
      .then(datos => setPedidos(datos))
  }
  const plato = async () => {
    await fetch("/api/plato")
      .then(response => response.json())
      .then(data => setPlatos(data))
  }
  const togglePedidoEstado = useCallback(async (id: number) => {
    try {
      const nuevoEstado = 'Cancelado';
      await fetch(`/api/pedido`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pedido_id: id, nuevo_estado: nuevoEstado })
      });
      setPedidos(prevPedidos => prevPedidos.filter(pedido => pedido.id !== id));
    } catch (error) {
      console.error('Error al cambiar el estado del pedido:', error);
    }
  }, []);


  const togglePlatoEstado = useCallback(async (id: number, estado: string) => {
    try {
      const nuevoEstado = estado == "activo" ? "agotado" : "activo";
      await fetch(`/api/platos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plato_id: id, nuevo_estado: nuevoEstado })
      });
      setPlatos(prevPlatos => prevPlatos.map(plato =>
        plato.id_plato === id
          ? { ...plato, estado: nuevoEstado }
          : plato
      ));
    } catch (error) {
      console.error('Error al cambiar el estado del plato:', error);
    }
  }, [])

  return (
    <div className="space-y-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 min-h-screen font-sans">
      <div>
        <h2 className="text-3xl font-extrabold mb-6 text-purple-800">Pedidos</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-100">
              <TableHead className="text-purple-800">Plato</TableHead>
              <TableHead className="text-purple-800">Empleado</TableHead>
              <TableHead className="text-purple-800">Cantidad</TableHead>
              <TableHead className="text-purple-800">Cliente</TableHead>
              <TableHead className="text-purple-800">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {pedido.map(pedido => (
                <motion.tr
                  key={pedido.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TableCell className="font-medium">{pedido.plato}</TableCell>
                  <TableCell>{pedido.nombre_empleado}</TableCell>
                  <TableCell>{pedido.cantidad}</TableCell>
                  <TableCell>{pedido.nombre_cliente}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => togglePedidoEstado(pedido.id)}
                      variant={pedido.estado_pedido === 'pendiente' ? 'default' : 'secondary'}
                      className="transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      {pedido.estado_pedido}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold mb-6 text-pink-800">Platos</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-pink-100">
              <TableHead className="text-pink-800">Nombre del Plato</TableHead>
              <TableHead className="text-pink-800">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platos.map(plato => (
              <TableRow key={plato.id_plato}>
                <TableCell className="font-medium">{plato.nombre_plato}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => togglePlatoEstado(plato.id_plato, plato.estado)}
                    variant={plato.estado === 'activo' ? 'default' : 'destructive'}
                    className="transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    {plato.estado}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
