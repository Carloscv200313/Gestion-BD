import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { BarChart3, Home, ShoppingBag, ShoppingCart, Users } from 'lucide-react'
export const Sidevar = () => {
    const Vistas = [
        { nombre: "Home", src: "/Home", icon: Home },
        { nombre: "Empleados", src: "/Home/Empleados", icon: Users },
        { nombre: "Ventas", src: "/Home/Ventas", icon: BarChart3 },
        { nombre: "Compras", src: "/Home/Compras", icon: ShoppingCart },
        { nombre: "Productos", src: "/Home/Productos", icon: ShoppingBag },
    ]
    return (
        <nav className='h-screen flex flex-col  gap-2  py-10 w-44' >
            <Image
                src={'/img/logo-1.png'}
                alt={'logo'}
                width={150}
                height={200}
                priority
                className='w-auto h-auto'
            />
            <div className='flex flex-col h-screen items-start justify-center w-full gap-4'>
                {
                    Vistas.map((vista, id) => (
                        <div key={id} className='hover:bg-zinc-200 w-full px-4 py-2 text-gray-500 hover:text-black '>
                            <Link href={vista.src} className='flex flex-row w-full text-base '>
                                <vista.icon className="mr-2 h-5 w-5" /> {vista.nombre}
                            </Link>
                        </div>
                    ))
                }
            </div>
            <footer>
                <p className="px-4 py-2 text-sm text-muted-foreground text-center">© 2024 Panizzeria</p>
            </footer>
        </nav>

    )
}
