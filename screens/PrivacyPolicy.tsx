
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-base font-bold text-white tracking-widest uppercase">política de privacidad</h1>
        <div className="size-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 pb-32">
        <article className="prose prose-invert prose-sm max-w-none text-neutral-400">
            <h2 className="text-white font-bold text-xl mb-6 tracking-tight">política de privacidad de supra</h2>
            
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-8">última actualización: 21/12/2025</p>

            <p className="mb-4">
                en supra nos tomamos la privacidad muy en serio. esta política de privacidad explica de forma clara, transparente y conforme a la normativa vigente cómo se recogen, utilizan, almacenan y protegen los datos personales de los usuarios de la plataforma supra (en adelante, “supra” o “la plataforma”).
            </p>
            <p className="mb-8">
                el uso de supra implica la aceptación expresa de la presente política de privacidad.
            </p>

            <div className="space-y-8">
                <section>
                    <h3 className="text-white font-bold mb-3 text-base">1. responsable del tratamiento</h3>
                    <p className="mb-2">responsable del tratamiento de los datos personales:</p>
                    <ul className="list-none pl-0 space-y-1 text-white">
                        <li className="font-bold">supra</li>
                        <li>supra.app</li>
                        <li><a href="mailto:contacto.supra.app@gmail.com" className="text-emerald-400 hover:underline">contacto.supra.app@gmail.com</a></li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">2. marco legal aplicable</h3>
                    <p className="mb-2">supra cumple con la normativa vigente en materia de protección de datos personales, incluyendo:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>reglamento (ue) 2016/679, reglamento general de protección de datos (rgpd)</li>
                        <li>ley orgánica 3/2018, de protección de datos personales y garantía de los derechos digitales (lopdgdd)</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">3. datos personales que se recopilan</h3>
                    <p className="mb-2">supra aplica el principio de minimización de datos, recogiendo únicamente la información estrictamente necesaria para el funcionamiento del servicio.</p>
                    <p className="mb-4">los datos que pueden recopilarse incluyen:</p>

                    <h4 className="text-white font-bold mt-4 mb-2 text-sm">3.1 datos identificativos (opcionales)</h4>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>identificador de usuario</li>
                        <li>correo electrónico (si el usuario decide registrarse)</li>
                        <li>nombre o alias (si el usuario lo introduce voluntariamente)</li>
                    </ul>

                    <h4 className="text-white font-bold mt-4 mb-2 text-sm">3.2 datos de uso y actividad</h4>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>check-ins emocionales</li>
                        <li>textos escritos por el usuario (diario, reflexiones, mensajes)</li>
                        <li>interacciones con la app</li>
                        <li>progreso en hábitos o retos</li>
                    </ul>

                    <h4 className="text-white font-bold mt-4 mb-2 text-sm">3.3 datos técnicos</h4>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>tipo de dispositivo</li>
                        <li>sistema operativo</li>
                        <li>información básica de rendimiento y errores</li>
                    </ul>
                    <p className="mt-2 text-white/80">supra no recopila datos innecesarios, ni solicita información sensible salvo que el propio usuario la introduzca voluntariamente.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">4. datos de salud y contenido emocional</h3>
                    <p className="mb-2">supra puede tratar información relacionada con el estado emocional del usuario cuando este la introduce voluntariamente.</p>
                    <p className="mb-2">dichos datos:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>se tratan exclusivamente para ofrecer el servicio</li>
                        <li>no se utilizan con fines publicitarios</li>
                        <li>no se venden ni ceden a terceros</li>
                        <li>se almacenan con medidas de seguridad reforzadas</li>
                    </ul>
                    <p className="mt-2 text-white/80">supra no utiliza esta información para realizar diagnósticos médicos o psicológicos.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">5. finalidad del tratamiento</h3>
                    <p className="mb-2">los datos personales se tratan con las siguientes finalidades:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>permitir el uso de las funcionalidades de supra</li>
                        <li>personalizar la experiencia del usuario</li>
                        <li>generar recomendaciones generales</li>
                        <li>mejorar la calidad y seguridad del servicio</li>
                        <li>cumplir obligaciones legales</li>
                    </ul>
                    <p className="mt-2">en ningún caso los datos se utilizarán para fines distintos sin consentimiento expreso.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">6. base legal del tratamiento</h3>
                    <p className="mb-2">la base legal para el tratamiento de los datos es:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>el consentimiento explícito del usuario</li>
                        <li>la ejecución del servicio solicitado</li>
                        <li>el interés legítimo en garantizar el correcto funcionamiento y seguridad de la plataforma</li>
                    </ul>
                    <p className="mt-2">el usuario puede retirar su consentimiento en cualquier momento.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">7. uso de inteligencia artificial</h3>
                    <p className="mb-2">supra puede utilizar sistemas de inteligencia artificial para procesar textos o generar respuestas.</p>
                    <p className="mb-2">el usuario acepta que:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>el contenido puede ser procesado automáticamente</li>
                        <li>la ia no realiza diagnósticos</li>
                        <li>los datos no se utilizan para entrenar modelos de terceros con fines comerciales</li>
                    </ul>
                    <p className="mt-2">supra aplica medidas técnicas para proteger la confidencialidad de la información tratada por estos sistemas.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">8. conservación de los datos</h3>
                    <p className="mb-2">los datos personales se conservarán:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>mientras el usuario mantenga su cuenta activa</li>
                        <li>mientras sean necesarios para la finalidad para la que fueron recogidos</li>
                        <li>hasta que el usuario solicite su supresión</li>
                    </ul>
                    <p className="mt-2">una vez finalizada la relación, los datos serán eliminados o anonimizados conforme a la legislación aplicable.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">9. cesión de datos a terceros</h3>
                    <p className="mb-2">supra no vende, alquila ni cede datos personales a terceros con fines comerciales.</p>
                    <p className="mb-2">únicamente podrán acceder a los datos:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>proveedores tecnológicos necesarios para el funcionamiento del servicio (por ejemplo, alojamiento o infraestructura), bajo contratos de confidencialidad y cumplimiento rgpd</li>
                        <li>autoridades públicas, cuando exista obligación legal</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">10. uso anónimo</h3>
                    <p className="mb-2">supra permite, siempre que sea técnicamente posible, el uso de la plataforma de forma anónima o sin identificación directa del usuario.</p>
                    <p>el usuario reconoce que algunas funciones pueden requerir datos mínimos para su correcta prestación.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">11. derechos del usuario</h3>
                    <p className="mb-2">el usuario puede ejercer en cualquier momento los siguientes derechos:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>acceso a sus datos personales</li>
                        <li>rectificación de datos inexactos</li>
                        <li>supresión (“derecho al olvido”)</li>
                        <li>limitación del tratamiento</li>
                        <li>oposición al tratamiento</li>
                        <li>portabilidad de los datos</li>
                    </ul>
                    <p className="mt-4">para ejercer estos derechos, el usuario puede contactar en:<br/>
                    <a href="mailto:contacto.supra.app@gmail.com" className="text-emerald-400 hover:underline">contacto.supra.app@gmail.com</a></p>
                    <p className="mt-2">asimismo, tiene derecho a presentar una reclamación ante la autoridad de control competente.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">12. seguridad de los datos</h3>
                    <p className="mb-2">supra adopta medidas técnicas y organizativas adecuadas para garantizar la seguridad, confidencialidad e integridad de los datos personales, incluyendo:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>cifrado de datos</li>
                        <li>accesos restringidos</li>
                        <li>sistemas de control y auditoría</li>
                        <li>protección frente a accesos no autorizados</li>
                    </ul>
                    <p className="mt-2">no obstante, el usuario reconoce que ningún sistema es completamente infalible.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">13. menores de edad</h3>
                    <p className="mb-2">supra no está destinada a menores de la edad mínima legal sin consentimiento válido de sus representantes legales, conforme a la normativa aplicable.</p>
                    <p>supra no recopila conscientemente datos de menores sin autorización.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">14. modificaciones de la política de privacidad</h3>
                    <p className="mb-2">supra se reserva el derecho de modificar la presente política de privacidad para adaptarla a cambios legales o técnicos.</p>
                    <p>las modificaciones serán comunicadas al usuario cuando sea legalmente exigible.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">15. contacto</h3>
                    <p>para cualquier cuestión relacionada con la privacidad o protección de datos, el usuario puede contactar con supra en:</p>
                    <p className="mt-2"><a href="mailto:contacto.supra.app@gmail.com" className="text-emerald-400 hover:underline">contacto.supra.app@gmail.com</a></p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">16. aceptación</h3>
                    <p className="font-medium text-white">el uso de supra implica que el usuario declara haber leído, comprendido y aceptado la presente política de privacidad.</p>
                </section>
            </div>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
