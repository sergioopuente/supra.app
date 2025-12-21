
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
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
        <h1 className="text-base font-bold text-white tracking-widest uppercase">términos legales</h1>
        <div className="size-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 pb-32">
        <article className="prose prose-invert prose-sm max-w-none text-neutral-400">
            <h2 className="text-white font-bold text-xl mb-6 tracking-tight">términos y condiciones de uso de supra</h2>
            
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-8">última actualización: 21/12/2025</p>

            <p className="mb-4">
                el presente documento regula el acceso, uso y utilización de la aplicación y/o plataforma digital denominada supra (en adelante, “supra” o “la plataforma”), así como de todos los servicios, funcionalidades, contenidos y herramientas ofrecidas a través de la misma.
            </p>
            <p className="mb-8">
                el acceso y uso de supra implica la aceptación expresa, plena y sin reservas de los presentes términos y condiciones. si el usuario no está de acuerdo con alguno de ellos, deberá abstenerse de utilizar la plataforma.
            </p>

            <div className="space-y-8">
                <section>
                    <h3 className="text-white font-bold mb-3 text-base">1. identificación del servicio</h3>
                    <p>
                        supra es una plataforma digital de acompañamiento personal, bienestar emocional, desarrollo de hábitos, reflexión y crecimiento individual, que puede integrar tecnología, contenidos digitales e inteligencia artificial con fines informativos, orientativos y de apoyo general.
                    </p>
                    <p className="mt-2 text-white/80">
                        supra no constituye un servicio médico, psicológico, psiquiátrico ni sanitario, ni ofrece diagnósticos, tratamientos clínicos o terapias profesionales.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">2. objeto y alcance</h3>
                    <p className="mb-2">el objeto de supra es proporcionar al usuario herramientas digitales destinadas a:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>la autoobservación emocional</li>
                        <li>el desarrollo personal</li>
                        <li>la mejora de hábitos</li>
                        <li>la reflexión individual</li>
                        <li>el acompañamiento no clínico</li>
                    </ul>
                    <p className="mt-2">
                        todos los contenidos y funcionalidades de supra tienen un carácter orientativo y general, y no deben considerarse asesoramiento profesional, médico o psicológico.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">3. naturaleza no sanitaria del servicio</h3>
                    <p className="mb-2 font-bold text-white/90">supra no sustituye en ningún caso la atención prestada por profesionales de la salud mental o física.</p>
                    <p className="mb-2">el usuario reconoce y acepta expresamente que:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>supra no realiza diagnósticos clínicos</li>
                        <li>supra no prescribe tratamientos</li>
                        <li>supra no garantiza resultados terapéuticos</li>
                        <li>supra no actúa como servicio de emergencia</li>
                    </ul>
                    <p className="mt-3 p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-red-200 text-xs">
                        en situaciones de crisis grave, ideación suicida, riesgo para la integridad física o mental, el usuario deberá acudir inmediatamente a servicios médicos, psicológicos o de emergencia competentes.
                    </p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">4. uso de inteligencia artificial</h3>
                    <p className="mb-2">
                        supra puede incorporar sistemas de inteligencia artificial para generar respuestas, sugerencias, contenidos o acompañamiento conversacional.
                    </p>
                    <p className="mb-2">el usuario acepta que:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>las respuestas generadas por ia no son humanas</li>
                        <li>la información proporcionada es orientativa y general</li>
                        <li>la ia no sustituye a profesionales cualificados</li>
                        <li>las respuestas pueden contener errores, imprecisiones o limitaciones</li>
                    </ul>
                    <p className="mt-2">el usuario es el único responsable de la interpretación y uso de la información recibida.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">5. responsabilidad del usuario</h3>
                    <p className="mb-2">el usuario se compromete a:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>utilizar supra de forma lícita, responsable y conforme a estos términos</li>
                        <li>no emplear la plataforma con fines fraudulentos, ilícitos o dañinos</li>
                        <li>asumir la responsabilidad de sus decisiones personales</li>
                    </ul>
                    <p className="mt-2">supra no será responsable de los daños o perjuicios derivados del uso indebido, incorrecto o exclusivo de la información proporcionada a través de la plataforma.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">6. limitación de responsabilidad</h3>
                    <p className="mb-2">en la máxima medida permitida por la legislación aplicable, supra no será responsable de:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>daños directos o indirectos derivados del uso de la plataforma</li>
                        <li>expectativas no cumplidas del usuario</li>
                        <li>resultados personales, emocionales o vitales</li>
                        <li>interrupciones, errores técnicos o fallos de funcionamiento</li>
                    </ul>
                    <p className="mt-2">supra se ofrece “tal cual” y “según disponibilidad”.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">7. privacidad y protección de datos</h3>
                    <p className="mb-2">supra cumple con la normativa vigente en materia de protección de datos personales, incluyendo el reglamento (ue) 2016/679 (rgpd).</p>
                    
                    <h4 className="text-white font-bold mt-4 mb-2 text-sm">7.1 principios generales</h4>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>recogida mínima de datos</li>
                        <li>finalidad legítima y específica</li>
                        <li>seguridad y confidencialidad</li>
                        <li>transparencia</li>
                    </ul>

                    <h4 className="text-white font-bold mt-4 mb-2 text-sm">7.2 derechos del usuario</h4>
                    <p>el usuario podrá ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad de sus datos conforme a la política de privacidad.</p>
                    <p className="mt-2 text-white/80">supra no vende ni cede datos personales a terceros con fines comerciales.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">8. uso anónimo</h3>
                    <p>cuando sea técnicamente posible, supra permitirá el uso de la plataforma de forma anónima o sin identificación directa del usuario.</p>
                    <p className="mt-2">el usuario entiende que ciertas funcionalidades pueden requerir datos mínimos para su correcto funcionamiento.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">9. contenidos espirituales (opcionales)</h3>
                    <p className="mb-2">supra puede ofrecer contenidos de carácter espiritual, reflexivo o trascendente de forma estrictamente opcional.</p>
                    <p className="mb-2">el usuario reconoce que:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>dichos contenidos no constituyen asesoramiento religioso oficial</li>
                        <li>no existe imposición de creencias</li>
                        <li>la activación o desactivación depende exclusivamente del usuario</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">10. gamificación y sistemas de progreso</h3>
                    <p>supra puede incluir elementos de gamificación tales como puntos, retos, rachas o niveles.</p>
                    <p className="mt-2">estos elementos tienen únicamente un fin motivacional y no constituyen evaluaciones objetivas del valor personal del usuario.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">11. comunidad y conducta</h3>
                    <p className="mb-2">en los espacios compartidos, el usuario se compromete a mantener un comportamiento respetuoso.</p>
                    <p className="mb-2">queda prohibido:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-neutral-600">
                        <li>el acoso</li>
                        <li>el discurso de odio</li>
                        <li>la difusión de contenido dañino o ilegal</li>
                    </ul>
                    <p className="mt-2">supra se reserva el derecho de moderar, suspender o eliminar cuentas que incumplan estas normas.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">12. modificaciones del servicio</h3>
                    <p>supra se reserva el derecho de modificar, actualizar o eliminar funcionalidades, contenidos o condiciones, en cualquier momento.</p>
                    <p className="mt-2">las modificaciones serán comunicadas al usuario cuando resulte legalmente exigible.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">13. propiedad intelectual</h3>
                    <p>todos los contenidos, diseños, textos, marcas, código y elementos de supra son titularidad de supra o de sus licenciantes, quedando prohibida su reproducción no autorizada.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">14. vigencia y terminación</h3>
                    <p>el acceso a supra tiene duración indefinida, sin perjuicio del derecho de supra a suspender o cancelar el servicio por razones técnicas, legales o de seguridad.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">15. legislación aplicable y jurisdicción</h3>
                    <p>los presentes términos y condiciones se rigen por la legislación española y europea.</p>
                    <p className="mt-2">cualquier controversia se someterá a los juzgados y tribunales que resulten legalmente competentes.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold mb-3 text-base">16. aceptación expresa</h3>
                    <p className="font-medium text-white">el uso de supra implica que el usuario declara haber leído, comprendido y aceptado íntegramente estos términos y condiciones.</p>
                </section>
            </div>
        </article>
      </main>
    </div>
  );
};

export default Terms;
