"use client"
import Image from "next/image";

export default function Home() {
  const datos = (e) => {//+
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(data);//+
    data.forEach((value, key) => {
      console.log(`${key}: ${value}`); // Muestra el nombre del campo y su valor
    });
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Inicia sesión en tu cuenta
            </h2>
          </div>
          <div className="mt-8">
            <form className="space-y-6" onSubmit={datos} >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <div className="mt-1">
                  <input
                    name="username"
                    type="text"
                    placeholder="Correo electrónico"
                    autoComplete="username"
                    required
                    className="text-black block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                    type="password"
                    placeholder="Contraseña"
                    required
                    className="text-black block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
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
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-auto object-cover"
          src="/img/fondo.webp"
          alt="Imagen de la empresa"
          width={2000}
          height={1080}
        />
      </div>
    </div>
  );
}
