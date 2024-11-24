import { Form } from "@/Components/Form";
import Image from "next/image";
export default function Home() {
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
            <Form/>
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