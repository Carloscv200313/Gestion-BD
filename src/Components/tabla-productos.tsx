'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog"
import { Label } from "@/Components/ui/label"
import { AlertCircle } from 'lucide-react'

interface Producto {
  id_productos_bodega: number
  nombre_producto: string
  cantidad: number
  tipo_producto: string
  nombre_bodega: string
  precio: number
  stock: number,
  activo: boolean
}

export function TablaProductosComponent() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  useEffect(() => {
    bodega()
  }, [])
  const bodega = async () => {
    await fetch("/api/bodega")
      .then(response => response.json())
      .then(data => setProductos(data))
  }
  const tiposProducto = useMemo(() => [...new Set(productos.map(p => p.tipo_producto))], [productos])

  const productosFiltrados = useMemo(() => {
    return productos.filter(producto =>
      producto.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroTipo === '' || producto.tipo_producto === filtroTipo)
    )
  }, [productos, busqueda, filtroTipo])

  const handleCrearEditar = useCallback(async (producto: Producto) => {
    const tipo = producto.tipo_producto == "ingredientes" ? 1 : producto.tipo_producto == "insumos" ? 2 : 3
    const bodega = producto.nombre_bodega == "N-01" ? 1 : producto.nombre_bodega == "N-02" ? 2 : producto.nombre_bodega == "N-03" ? 3 : producto.nombre_bodega == "N-04" ? 4 : 5
    if (producto.id_productos_bodega) {
      await fetch(`/api/productos/${producto.id_productos_bodega}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: producto.nombre_producto,
          cantidad: producto.cantidad,
          tipo,
          bodega,
          precio: producto.precio,
          stock: producto.stock,
        }),
      });
      setProductos(prev => prev.map(p => p.id_productos_bodega === producto.id_productos_bodega ? producto : p))
    } else {
      await fetch("/api/productos", {
        method: "POST",
        body: JSON.stringify({
          nombre: producto.nombre_producto,
          cantidad: producto.cantidad,
          tipo,
          bodega,
          precio: producto.precio,
          stock: producto.stock,
          activo: 1
        }),
      });
      setProductos(prev => [...prev, { ...producto, id_productos_bodega: Date.now() }])
    }
    setDialogoAbierto(false)
    setProductoEditando(null)
  }, [])

  const abrirDialogoEdicion = useCallback((producto: Producto) => {
    setProductoEditando(producto)
    setDialogoAbierto(true)
  }, [])
  const Cambiarestado = async (producto: Producto) => {
    const nuevoEstado = !producto.activo;
    await fetch(`/api/bodega/${producto.id_productos_bodega}`, {
      method: "PUT",
      body: JSON.stringify({ estado: nuevoEstado })
    })
    const productoActualizado = { ...producto, activo: nuevoEstado };
    setProductos(prev =>
      prev.map(p =>
        p.id_productos_bodega === producto.id_productos_bodega ? productoActualizado : p
      )
    );
    console.log(productoActualizado.activo);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {tiposProducto.map(tipo => (
              <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button onClick={() => setProductoEditando(null)}>Crear Producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{productoEditando ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
            </DialogHeader>
            <FormularioProducto
              productoInicial={productoEditando || {
                id_productos_bodega: 0,
                nombre_producto: '',
                cantidad: 0,
                tipo_producto: '',
                nombre_bodega: '',
                precio: 0,
                stock: 0,
                activo: true
              }}
              onGuardar={handleCrearEditar}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Bodega</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Acciones</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productosFiltrados.map((producto) => (
            <TableRow key={producto.id_productos_bodega} className={producto.cantidad < producto.stock ? 'bg-yellow-100' : ''}>
              <TableCell>{producto.nombre_producto}</TableCell>
              <TableCell className="flex items-center gap-2">
                {producto.cantidad}
                {producto.cantidad < producto.stock && (
                  <AlertCircle className="text-yellow-500" size={20} />
                )}
              </TableCell>
              <TableCell>{producto.tipo_producto}</TableCell>
              <TableCell>{producto.nombre_bodega}</TableCell>
              <TableCell>${producto.precio.toFixed(2)}</TableCell>
              <TableCell>{producto.stock}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => abrirDialogoEdicion(producto)}>
                  Editar
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => Cambiarestado(producto)} >
                  {producto.activo ? "Activo" : "Desactivado"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface FormularioProductoProps {
  productoInicial: Producto
  onGuardar: (producto: Producto) => void
}

function FormularioProducto({ productoInicial, onGuardar }: FormularioProductoProps) {
  const [producto, setProducto] = useState(productoInicial)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProducto(prev => ({ ...prev, [name]: name === 'nombre_producto' || name === 'tipo_producto' || name === 'nombre_bodega' ? value : Number(value) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(producto)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre_producto">Nombre del Producto</Label>
        <Input id="nombre_producto" name="nombre_producto" value={producto.nombre_producto} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="cantidad">Cantidad</Label>
        <Input id="cantidad" name="cantidad" type="number" value={producto.cantidad} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="tipo_producto">Tipo de Producto</Label>
        <Select
          name="tipo_producto"
          value={producto.tipo_producto}
          onValueChange={value => setProducto(prev => ({ ...prev, tipo_producto: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo de producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingredientes">Ingredientes</SelectItem>
            <SelectItem value="insumos">Insumos</SelectItem>
            <SelectItem value="productos">Productos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="nombre_bodega">Nombre de Bodega</Label>
        <Select
          name="nombre_bodega"
          value={producto.nombre_bodega}
          onValueChange={value => setProducto(prev => ({ ...prev, nombre_bodega: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una bodega" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="N-01">Bodega N-01</SelectItem>
            <SelectItem value="N-02">Bodega N-02</SelectItem>
            <SelectItem value="N-03">Bodega N-03</SelectItem>
            <SelectItem value="N-04">Bodega N-04</SelectItem>
            <SelectItem value="N-05">Bodega N-05</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="precio">Precio</Label>
        <Input id="precio" name="precio" type="number" step="0.01" value={producto.precio} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" name="stock" type="number" value={producto.stock} onChange={handleChange} required />
      </div>
      <Button type="submit">Guardar</Button>
    </form>
  )
}