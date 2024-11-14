// Importaciones necesarias
'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Plato {
  id_plato: number
  nombre_plato: string
  estado: string
  precio: number
  tipo: string
}

interface Producto {
  id_producto: number
  nombre_producto: string
  cantidad: number
  precio: number
  tipo: string
}

interface PedidoItem {
  id_producto: number
  nombre?: string
  cantidad: number
  precio_unitario: number
  tipo: 'plato' | 'producto'
  stockDisponible?: number
}

interface Cliente {
  nombre: string
  apellido: string
  ruc: string
  telefono: string
  tipo: 'en local' | 'delivery' | 'para llevar'
  metodo: 'yape' | 'efectivo' | 'tarjeta'
}

interface Pedido {
  id_pedido: number
  cliente: Cliente
  items: PedidoItem[]
  total: number
  estado: 'pendiente' | 'proceso' | 'cancelado'
}

export function PedidosMozoVerificacion() {
  const [pedidoActual, setPedidoActual] = useState<PedidoItem[]>([])
  const [platosEjemplo, setPlatos] = useState<Plato[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalProcesar, setModalProcesar] = useState(false)
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    apellido: '',
    ruc: '',
    telefono: '',
    tipo: 'en local',
    metodo: 'efectivo'
  })
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoAProcesar, setPedidoAProcesar] = useState<Pedido | null>(null)

  // Cargar platos, productos y pedidos al montar el componente
  useEffect(() => {
    const savedPedidos = localStorage.getItem('pedidos')
    if (savedPedidos) {
      setPedidos(JSON.parse(savedPedidos))
    }
    plato()
    producto()
  }, [])

  // Guardar pedidos en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('pedidos', JSON.stringify(pedidos))
  }, [pedidos])

  const plato = async () => {
    await fetch("/api/platos")
      .then(response => response.json())
      .then(data => setPlatos(data))
  }

  const producto = async () => {
    await fetch("/api/productos")
      .then(response => response.json())
      .then(data => setProductos(data))
  }

  const agregarAlPedido = (item: Plato | Producto, tipo: 'plato' | 'producto') => {
    if (tipo === 'producto') {
      const producto = item as Producto
      if (producto.cantidad <= 0) {
        toast.error(`No hay stock disponible de ${producto.nombre_producto}`)
        return
      }
    }

    const itemExistente = pedidoActual.find(i =>
      i.id_producto === ('id_plato' in item ? item.id_plato : item.id_producto) && i.tipo === tipo
    )

    if (itemExistente) {
      if (tipo === 'producto') {
        const producto = item as Producto
        if (itemExistente.cantidad >= producto.cantidad) {
          toast.error(`No hay suficiente stock de ${producto.nombre_producto}`)
          return
        }
      }
      actualizarCantidad(pedidoActual.indexOf(itemExistente), itemExistente.cantidad + 1)
    } else {
      const nuevoItem: PedidoItem = {
        id_producto: 'id_plato' in item ? item.id_plato : item.id_producto,
        nombre: 'nombre_plato' in item ? item.nombre_plato : item.nombre_producto,
        cantidad: 1,
        precio_unitario: item.precio,
        tipo: tipo,
      }
      setPedidoActual([...pedidoActual, nuevoItem])
    }

    if (tipo === 'producto') {
      actualizarStockProducto(item as Producto, -1)
    }
  }

  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevosPedidos = [...pedidoActual]
    const item = nuevosPedidos[index]
    const diferencia = nuevaCantidad - item.cantidad

    if (item.tipo === 'producto') {
      const producto = productos.find(p => p.id_producto === item.id_producto)
      if (producto && (producto.cantidad < nuevaCantidad || nuevaCantidad <= 0)) {
        toast.error(`Cantidad no válida para ${item.nombre}`)
        return
      }
      actualizarStockProducto(producto!, -diferencia)
    }

    item.cantidad = nuevaCantidad
    setPedidoActual(nuevosPedidos)
  }

  const eliminarDelPedido = (index: number) => {
    const item = pedidoActual[index]
    if (item.tipo === 'producto') {
      const producto = productos.find(p => p.id_producto === item.id_producto)
      if (producto) {
        actualizarStockProducto(producto, item.cantidad)
      }
    }
    const nuevoPedido = pedidoActual.filter((_, i) => i !== index)
    setPedidoActual(nuevoPedido)
  }

  const actualizarStockProducto = (producto: Producto, cantidad: number) => {
    const nuevosProductos = productos.map(p =>
      p.id_producto === producto.id_producto
        ? { ...p, cantidad: p.cantidad + cantidad }
        : p
    )
    setProductos(nuevosProductos)
  }

  const abrirModalGuardarPedido = () => {
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setModalProcesar(false)
    setCliente({
      nombre: '',
      apellido: '',
      ruc: '',
      telefono: '',
      tipo: 'en local',
      metodo: 'efectivo'
    })
    setPedidoAProcesar(null)
  }

  const manejarCambioCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCliente(prevCliente => ({ ...prevCliente, [name]: value }))
  }

  const manejarCambioSelect = (name: string, value: string) => {
    setCliente(prevCliente => ({ ...prevCliente, [name]: value }))
    if (pedidoAProcesar) {
      setPedidoAProcesar({
        ...pedidoAProcesar,
        cliente: { ...pedidoAProcesar.cliente, [name]: value }
      })
    }
  }

  const guardarPedido = async () => {
    const platosParaGuardar = pedidoActual.filter(item => item.tipo === 'plato');
    const todosLosItems = [...pedidoActual];

    if (platosParaGuardar.length > 0) {
      for (const plato of platosParaGuardar) {
        const nuevoPedido: Pedido = {
          id_pedido: pedidos.length + 1,
          cliente: cliente,
          items: [plato],
          total: plato.precio_unitario * plato.cantidad,
          estado: 'pendiente'
        }
        try {
          const response = await fetch('/api/pedido', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              plato: plato.nombre,
              cantidad: plato.cantidad,
              nombre: `${cliente.nombre} ${cliente.apellido}`,
              estado: 'pendiente'
            })
          });

          if (response.ok) {
            toast.success('Pedido de plato guardado con éxito!')
            setPedidos([...pedidos, nuevoPedido])
          } else {
            throw new Error('Error al guardar el pedido de plato en la base de datos')
          }
        } catch (error) {
          console.error(error)
          toast.error('Hubo un problema al guardar el pedido de plato')
        }
      }
    }

    const nuevoRegistroPedido: Pedido = {
      id_pedido: pedidos.length + 1,
      cliente: cliente,
      items: todosLosItems,
      total: Number(calcularTotal()),
      estado: 'pendiente'
    }
    setPedidos([...pedidos, nuevoRegistroPedido])
    setPedidoActual([])
    cerrarModal()
  }

  const procesarPedido = (id_pedido: number) => {
    const pedido = pedidos.find(p => p.id_pedido === id_pedido)
    if (!pedido) return

    setPedidoAProcesar(pedido)
    setModalProcesar(true)
  }

  const confirmarProcesarPedido = async () => {
    if (!pedidoAProcesar) return

    const tipoNumerico = pedidoAProcesar.cliente.tipo === 'en local' ? 1 : pedidoAProcesar.cliente.tipo === 'delivery' ? 2 : 3
    const metodoNumerico = pedidoAProcesar.cliente.metodo === 'yape' ? 1 : pedidoAProcesar.cliente.metodo === 'efectivo' ? 2 : 3

    const { nombre, apellido, ruc, telefono } = pedidoAProcesar.cliente
    const total = pedidoAProcesar.total
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pedidosItems = pedidoAProcesar.items.map(({ nombre, ...resto }) => resto)

    await fetch("/api/venta", {
      method: "POST",
      body: JSON.stringify({
        total: Number(total),
        estado: 3, // Estado 'cancelado'
        tipo: tipoNumerico,
        metodo: metodoNumerico,
        nombre,
        apellido,
        ruc,
        telefono,
        pedidos: pedidosItems,
        cargo: "mozo"
      })
    })
    toast.success('Venta procesada con éxito!')
    setPedidos(pedidos.filter(p => p.id_pedido !== pedidoAProcesar.id_pedido))
    cerrarModal()
  }

  const cancelarPedido = (id_pedido: number) => {
    const pedido = pedidos.find(p => p.id_pedido === id_pedido)
    if (!pedido) return

    pedido.items.forEach(item => {
      if (item.tipo === 'producto') {
        const producto = productos.find(p => p.id_producto === item.id_producto)
        if (producto) {
          actualizarStockProducto(producto, item.cantidad)
        }
      }
    })

    setPedidos(pedidos.filter(p => p.id_pedido !== id_pedido))
    toast.info('Pedido cancelado')
  }

  const editarPedido = (id_pedido: number) => {
    const pedido = pedidos.find(p => p.id_pedido === id_pedido)
    if (!pedido) return

    setPedidoActual(pedido.items)
    setPedidos(pedidos.filter(p => p.id_pedido !== id_pedido))
    setModalAbierto(true)
  }

  const calcularTotal = () => {
    return pedidoActual.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0).toFixed(2)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionar Pedidos</h1>
      
      {/* Vista para Agregar Platos y Productos al Pedido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Platos */}
        <Card>
          <CardHeader>
            <CardTitle>Platos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platosEjemplo.map((plato) => (
                  <TableRow key={plato.id_plato}>
                    <TableCell>{plato.nombre_plato}</TableCell>
                    <TableCell>${plato.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => agregarAlPedido(plato, 'plato')}>Agregar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id_producto}>
                    <TableCell>{producto.nombre_producto}</TableCell>
                    <TableCell>${producto.precio.toFixed(2)}</TableCell>
                    <TableCell>{producto.cantidad}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => agregarAlPedido(producto, 'producto')}
                        disabled={producto.cantidad <= 0}
                      >
                        Agregar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Vista para el Pedido Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Pedido Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidoActual.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.cantidad} 
                      onChange={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>${item.precio_unitario.toFixed(2)}</TableCell>
                  <TableCell>${(item.precio_unitario * item.cantidad).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => eliminarDelPedido(index)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <strong>Total: ${calcularTotal()}</strong>
          </div>
          <Button className="mt-4" onClick={abrirModalGuardarPedido} disabled={pedidoActual.length === 0}>Guardar Pedido</Button>
        </CardContent>
      </Card>

      {/* Modal para Guardar Pedido */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datos del Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Formulario para Datos del Cliente */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input id="nombre" name="nombre" value={cliente.nombre} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellido" className="text-right">
                Apellido
              </Label>
              <Input id="apellido" name="apellido" value={cliente.apellido} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ruc" className="text-right">
                RUC
              </Label>
              <Input id="ruc" name="ruc" value={cliente.ruc} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono
              </Label>
              <Input id="telefono" name="telefono" value={cliente.telefono} onChange={manejarCambioCliente} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cerrarModal}>Cancelar</Button>
            <Button onClick={guardarPedido}>Guardar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Procesar Pedido */}
      <Dialog open={modalProcesar} onOpenChange={setModalProcesar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pedido</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="font-bold">Datos del Cliente:</h3>
            {pedidoAProcesar && (
              <>
                <p>Nombre: {pedidoAProcesar.cliente.nombre} {pedidoAProcesar.cliente.apellido}</p>
                <p>RUC: {pedidoAProcesar.cliente.ruc}</p>
                <p>Teléfono: {pedidoAProcesar.cliente.telefono}</p>
              </>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metodoPago" className="text-right">
                Método de Pago
              </Label>
              <Select onValueChange={(value) => manejarCambioSelect('metodo', value)} value={pedidoAProcesar?.cliente.metodo || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yape">Yape</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipoVenta" className="text-right">
                Tipo de Venta
              </Label>
              <RadioGroup
                onValueChange={(value) => manejarCambioSelect('tipo', value)}
                value={pedidoAProcesar?.cliente.tipo || ''}
                className="col-span-3 flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en local" id="en-local" />
                  <Label htmlFor="en-local">En local</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="para llevar" id="para-llevar" />
                  <Label htmlFor="para-llevar">Para llevar</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cerrarModal}>Cancelar</Button>
            <Button onClick={confirmarProcesarPedido}>Confirmar y Procesar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabla de Pedidos */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Pedidos Registrados</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Eliminar</TableHead>
              <TableHead>Editar</TableHead>
              <TableHead>Procesar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id_pedido}>
                <TableCell>{pedido.id_pedido}</TableCell>
                <TableCell>{pedido.cliente.nombre} {pedido.cliente.apellido}</TableCell>
                <TableCell>${pedido.total.toFixed(2)}</TableCell>
                <TableCell>
                  {pedido.items.map((item, index) => (
                    <p key={index}>{item.nombre} x {item.cantidad}</p>
                  ))}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => cancelarPedido(pedido.id_pedido)} disabled={pedido.estado === 'cancelado'}>Cancelar</Button>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => editarPedido(pedido.id_pedido)} disabled={pedido.estado === 'cancelado'}>Editar</Button>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => procesarPedido(pedido.id_pedido)} disabled={pedido.estado === 'cancelado'}>Procesar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ToastContainer />
    </div>
  )
}
