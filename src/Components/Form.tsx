"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconEye,IconEyeOff } from '@tabler/icons-react';
export const Form = () => {
    const route = useRouter();
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

    const credenciales = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/auth", {
            method: "POST",
            body: JSON.stringify({ user, password })
        }).then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    if (data === "cajero") {
                        route.push("/Cajero");
                        console.log(data);
                    }
                    if (data === "cocinero") {
                        route.push("/Cocinero");
                        console.log(data);
                    }
                    if (data === "mozo") {
                        route.push("/Atencion");
                        console.log(data);
                    }
                    if (data === "gerente") {
                        route.push("/Home");
                        console.log(data);
                    }
                    if (data === "supervisor") {
                        route.push("/Inventario");
                        console.log(data);
                    }
                }
            });
    };

    return (
        <form className="space-y-6" onSubmit={credenciales}>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Usuario
                </label>
                <div className="mt-1">
                    <input
                        name="user"
                        type="text"
                        placeholder="Usuario"
                        required
                        className="text-black block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => { setUser(e.target.value); }}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <div className="mt-1 relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"} // Cambiar tipo según el estado
                        placeholder="Contraseña"
                        required
                        className="text-black block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => { setPassword(e.target.value); }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)} // Alternar estado
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                    >
                        {showPassword ? (
                            <IconEye stroke={2} />
                        ) : (
                            <IconEyeOff stroke={2} />
                        )}
                    </button>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Iniciar sesión
                </button>
            </div>
        </form>
    );
};
