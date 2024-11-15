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
    estado: 'pedido' | 'proceso' | 'cancelado'
    tipo: 'en local' | 'delivery' | 'para llevar'
    metodo: 'yape' | 'efectivo' | 'tarjeta'
}

export function Caja() {
    const [pedidoActual, setPedidoActual] = useState<PedidoItem[]>([])
    const [platosEjemplo, setPlatos] = useState<Plato[]>([])
    const [productos, setProductos] = useState<Producto[]>([])
    const [modalAbierto, setModalAbierto] = useState(false)
    const [modalVerificacion, setModalVerificacion] = useState(false)
    const [cliente, setCliente] = useState<Cliente>({
        nombre: '',
        apellido: '',
        ruc: '',
        telefono: '',
        estado: 'pedido',
        tipo: 'en local',
        metodo: 'efectivo'
    })

    useEffect(() => {
        plato()
        producto()
    }, [])

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
        setModalVerificacion(false)
        setCliente({
            nombre: '',
            apellido: '',
            ruc: '',
            telefono: '',
            estado: 'pedido',
            tipo: 'en local',
            metodo: 'efectivo'
        })
    }

    const manejarCambioCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCliente(prevCliente => ({ ...prevCliente, [name]: value }))
    }

    const manejarCambioSelect = (name: string, value: string) => {
        setCliente(prevCliente => ({ ...prevCliente, [name]: value }))
    }

    const verificarPedido = () => {
        setModalVerificacion(true)
    }

    const guardarPedido = async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const pedidos = pedidoActual.map(({ nombre, ...resto }) => resto)
        const total = calcularTotal()
        const { nombre, apellido, ruc, telefono } = cliente
        const tipo = cliente.tipo === 'en local' ? 1 : cliente.tipo === 'delivery' ? 2 : 3
        const metodo = cliente.metodo === 'yape' ? 1 : cliente.metodo === 'efectivo' ? 2 : 3
        const platosParaGuardar = pedidoActual.filter(item => item.tipo === 'plato');
        if (platosParaGuardar.length > 0) {
            for (const plato of platosParaGuardar) {
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
                            estado: 'pendiente',
                            cargo: "cajero"
                        })
                    });
                    console.log(response);
                    toast.success('Pedido del Plato ha sido guardado')
                } catch (error) {
                    console.error(error)
                    toast.error('Hubo un problema al guardar el pedido de plato')
                }
            }
        }
        await fetch("/api/venta", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                total: Number(total),
                estado: 3,
                tipo,
                metodo,
                nombre,
                apellido,
                ruc,
                telefono,
                pedidos,
                cargo: "cajero"
            })
        })
        toast.success('Pedido guardado con éxito!')
        setPedidoActual([])
        setProductos(productos)
        cerrarModal()
    }

    const calcularTotal = () => {
        return pedidoActual.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0).toFixed(2)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Tomar Pedido</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                            max={item.stockDisponible}
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

            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Datos del Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                                DNI
                            </Label>
                            <Input id="telefono" name="telefono" value={cliente.telefono} onChange={manejarCambioCliente} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                                Tipo de Venta
                            </Label>
                            <RadioGroup
                                onValueChange={(value) => manejarCambioSelect('tipo', value)}
                                value={cliente.tipo}
                                className="col-span-3 flex space-x-4"
                            >
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="metodoPago" className="text-right">
                                Método de Pago
                            </Label>
                            <Select onValueChange={(value) => manejarCambioSelect('metodo', value)} value={cliente.metodo}>
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={cerrarModal}>Cancelar</Button>
                        <Button onClick={verificarPedido}>Verificar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={modalVerificacion} onOpenChange={setModalVerificacion}>
                <DialogContent className="h-[80vh] w-full max-w-lg flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Verificar Pedido</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4 border-t border-b">
                        <div className="grid gap-4">
                            <h3 className="font-bold">Datos del Cliente:</h3>
                            <p>Nombre: {cliente.nombre} {cliente.apellido}</p>
                            <p>RUC: {cliente.ruc}</p>
                            <p>DNI: {cliente.telefono}</p>
                            <p>Estado de Venta: {cliente.estado}</p>
                            <p>Tipo de Venta: {cliente.tipo}</p>
                            <p>Método de Pago: Cancelado</p>
                            <h3 className="font-bold mt-4">Resumen del Pedido:</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pedidoActual.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell>${item.precio_unitario.toFixed(2)}</TableCell>
                                            <TableCell>${(item.precio_unitario * item.cantidad).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4">
                                <strong>Total: ${calcularTotal()}</strong>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0">
                        <Button variant="outline" onClick={() => setModalVerificacion(false)}>Volver</Button>
                        <Button onClick={guardarPedido}>Generar Pedido</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <ToastContainer />
        </div>
    )
}
