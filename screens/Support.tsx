
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative font-sans lowercase animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 border-b border-white/5 apple-blur sticky top-0 z-50 flex items-center justify-between bg-black/80">
        <button 
            onClick={() => navigate(-1)} 
            className="size-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors -ml-2"
        >
            <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
        </button>
        <h1 className="text-base font-bold text-white tracking-widest uppercase">centro de soporte</h1>
        <div className="size-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 pb-32">
        <article className="prose prose-invert prose-sm max-w-none text-neutral-400">
            <h2 className="text-white font-bold text-xl mb-6 tracking-tight">soporte y atención al usuario de supra</h2>
            
            <div className="space-y-8">
                <section>
                    <h3 className="text-white font-bold mb-3 text-base">1. canal oficial de soporte</h3>
                    <p className="mb-2">
                        supra pone a disposición de los usuarios un canal oficial de atención para resolver dudas, incidencias técnicas, solicitudes relacionadas con la cuenta, privacidad o funcionamiento general de la plataforma.
                    </p>
                    <p className="mb-2">el canal de contacto oficial es:</p>
                    <p className="font-bold text-lg mb-2">
                        📧 <a href="mailto:contacto.supra.app@gmail.com" className="text-emerald-400 hover:underline">contacto.supra.app@gmail.com</a>
                    </p>
                    <p className="text-white/80">este es el único medio válido para comunicaciones relacionadas con el soporte de supra.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">2. alcance del soporte</h3>
                    <p className="mb-2">el servicio de soporte de supra está destinado a atender, entre otras, las siguientes cuestiones:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>incidencias técnicas o errores de funcionamiento</li>
                        <li>problemas de acceso, registro o uso de la cuenta</li>
                        <li>consultas sobre funcionalidades de la aplicación</li>
                        <li>solicitudes relacionadas con privacidad y protección de datos</li>
                        <li>ejercicio de derechos rgpd</li>
                        <li>reporte de contenido inapropiado o comportamientos indebidos</li>
                        <li>sugerencias o comentarios sobre la plataforma</li>
                    </ul>
                    <p className="mt-2">el soporte no ofrece asesoramiento médico, psicológico, legal ni terapéutico, ni responde a situaciones de emergencia.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">3. tiempos de respuesta</h3>
                    <p className="mb-2">
                        supra se compromete a realizar sus mejores esfuerzos para responder a las solicitudes recibidas en un plazo razonable, generalmente dentro de un periodo aproximado de 48 a 72 horas laborables.
                    </p>
                    <p>los tiempos de respuesta pueden variar en función del volumen de solicitudes o de la complejidad del caso.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">4. uso adecuado del canal de soporte</h3>
                    <p className="mb-2">el usuario se compromete a utilizar el canal de soporte de forma adecuada y respetuosa.</p>
                    <p className="mb-2">queda prohibido el uso del correo de soporte para:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>envío de contenido ofensivo, abusivo o amenazante</li>
                        <li>spam o comunicaciones no relacionadas con supra</li>
                        <li>solicitudes ajenas al ámbito de la plataforma</li>
                    </ul>
                    <p className="mt-2">supra se reserva el derecho de no responder a comunicaciones que incumplan estas normas.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">5. soporte y emergencias</h3>
                    <p className="mb-2 font-bold text-white/90">el servicio de soporte de supra no es un servicio de emergencia.</p>
                    <p className="mb-2">en caso de:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>crisis emocional grave</li>
                        <li>riesgo para la integridad física o mental</li>
                        <li>ideación suicida</li>
                        <li>situaciones urgentes</li>
                    </ul>
                    <div className="mt-4 p-4 bg-red-900/10 border border-red-900/30 rounded-xl">
                        <p className="text-red-200 text-xs font-medium mb-2">
                            el usuario deberá contactar inmediatamente con servicios de emergencia o profesionales cualificados de su país.
                        </p>
                        <p className="text-red-200/70 text-[10px]">
                            supra no puede ofrecer asistencia inmediata ni intervención directa en este tipo de situaciones.
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">6. confidencialidad de las comunicaciones</h3>
                    <p className="mb-2">
                        las comunicaciones realizadas a través del correo de soporte serán tratadas de forma confidencial y conforme a la política de privacidad de supra.
                    </p>
                    <p className="mb-2">la información facilitada será utilizada exclusivamente para:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>gestionar la solicitud del usuario</li>
                        <li>mejorar la calidad del servicio</li>
                        <li>cumplir obligaciones legales</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">7. modificación del servicio de soporte</h3>
                    <p>
                        supra se reserva el derecho de modificar, suspender o ampliar los canales de soporte disponibles, informando al usuario cuando resulte legalmente exigible.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">8. aceptación</h3>
                    <p className="font-medium text-white">
                        el uso del servicio de soporte implica la aceptación de las condiciones descritas en este apartado.
                    </p>
                </section>
            </div>
        </article>
      </main>
    </div>
  );
};

export default Support;
