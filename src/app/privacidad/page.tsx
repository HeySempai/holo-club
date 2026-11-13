import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Aviso de privacidad · Holo Club" };

// BORRADOR: debe revisarlo un abogado y completar los datos entre corchetes antes de cobrar.
export default function Privacidad() {
  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 py-16 leading-relaxed text-mist">
      <Link href="/" className="text-cyan">← Volver</Link>
      <h1 className="font-display text-4xl font-bold text-white">Aviso de privacidad simplificado</h1>
      <p>
        <strong className="text-white">[NOMBRE DEL RESPONSABLE]</strong>, con domicilio en [DOMICILIO], Culiacán, Sinaloa, es responsable del tratamiento de los datos
        personales que nos proporciones a través de este sitio.
      </p>
      <h2 className="font-display text-2xl text-white">Qué datos recabamos</h2>
      <p>Para la lista de socios fundadores: tu nombre y tu correo electrónico.</p>
      <h2 className="font-display text-2xl text-white">Para qué los usamos</h2>
      <p>
        Para avisarte cuando abran las suscripciones de Holo Club y respetar tu lugar como socio fundador. No vendemos ni compartimos tus datos con terceros
        con fines comerciales.
      </p>
      <h2 className="font-display text-2xl text-white">Tus derechos</h2>
      <p>
        Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos (derechos ARCO), o pedir que te saquemos de la lista, escribiendo a
        <strong className="text-white"> [CORREO DE CONTACTO]</strong>.
      </p>
      <p>Cualquier cambio a este aviso se publicará en esta página.</p>
      <p className="text-sm text-dim">Última actualización: [FECHA].</p>
    </main>
  );
}
